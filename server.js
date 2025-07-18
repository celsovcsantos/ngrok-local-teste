// Arquivo server.js
import 'dotenv/config';
import http from 'http';
import https from 'https';
import fetch from 'node-fetch';
import pino from 'pino';

const logger = pino();

// Cria um agente HTTPS para reutilizar conexões
const httpsAgent = new https.Agent({ keepAlive: true });

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 8000;
const tokenCceeIntegration = process.env.TOKEN_CCEE_INTEGRATION;
let hostNgrok;

// Função para inicializar o hostNgrok apenas uma vez
function initHostNgrok(req) {
    if (!hostNgrok && req.headers.host) {
        hostNgrok = req.headers.host.startsWith('https://') ? req.headers.host : `https://${req.headers.host}`;
        //atualizaEndpointCCEE(hostNgrok);
    } else if (!hostNgrok) {
        logger.warn('Host do ngrok não definido. Certifique-se de que o cabeçalho "host" está presente na requisição.');
    }
}

// Função para realizar fetch com retentativas e backoff exponencial
async function fetchWithRetry(url, options, retries = 3, backoff = 300) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            }
            logger.error({ status: response.status }, `Tentativa ${i + 1} falhou`);
        } catch (error) {
            logger.error({ err: error }, `Tentativa ${i + 1} falhou`);
        }
        // Espera antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, backoff * (2 ** i)));
    }
    throw new Error(`Falha ao fazer a requisição para ${url} após ${retries} tentativas.`);
}

async function atualizaEndpointCCEE(host) {
    if (host && host.startsWith('https://')) {
        hostNgrok = host.toString();
    } else {
        hostNgrok = `https://${host}`;
    }

    logger.info({ host_ngrok_registrar: process.env.RECEBE_ENDPOINT_URL }, 'Host do ngrok para cadastrar');

    try {
        const options = {
            method: 'POST',
            agent: httpsAgent,
            headers: {
                'Content-Type': 'application/json',
                Authorization: tokenCceeIntegration
            }
        };
        const result = await fetchWithRetry(process.env.ENVIA_ENDPOINT_URL, options);

        logger.info({ status: result.status, ngrok_url: hostNgrok }, 'POST bodyNgrok forwarded successfully.');
        const responseBody = await result.json();
        logger.info({ response: responseBody }, 'Response from CCEE-INTEGRATION');

    } catch (error) {
        logger.error({ err: error }, 'Erro ao atualizar endpoint CCEE');
    }
}

const requestListener = async function (req, res) {
    logger.info({ method: req.method, url: req.url }, 'Request recebida');
    res.setHeader('Content-Type', 'application/json');

    // Inicializa hostNgrok apenas na primeira requisição
    initHostNgrok(req);

    let body = [];
    req.on('error', (err) => {
        logger.error(err);
        res.statusCode = 400;
        res.end();
    }).on('data', (chunk) => {
        body.push(chunk);
    }).on('end', async () => {
        body = Buffer.concat(body).toString();
        res.writeHead(200);

        if (req.method === 'POST' && body) {
            try {
                const options = {
                    method: 'POST',
                    agent: httpsAgent,
                    headers: {
                        'Content-Type': 'application/json',
                        'token-ccee': process.env.TOKEN_CCEE
                    },
                    body
                };
                const result = await fetchWithRetry(process.env.RECEBE_NOTIFICACAO_URL, options);

                logger.info({ status: result.status }, 'POST body forwarded successfully.');
                const responseBody = await result.json();
                logger.info({ response: responseBody }, 'Response from CCEE-INTEGRATION');

            } catch (error) {
                logger.error({ err: error }, 'Erro ao encaminhar notificação CCEE');
            }
        }

        let parsedBody = null;
        try {
            parsedBody = body ? JSON.parse(body) : null;
        } catch {
            parsedBody = body;
        }

        res.end(JSON.stringify({
            message: 'This is Ngrok',
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: parsedBody
        }));
    });
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    logger.info(`Servidor rodando em http://${host}:${port}`);
    logger.info(`URL Ngrok: ${hostNgrok ? hostNgrok : 'Ainda não definida'}`);
    setInterval(async () => {
        if (hostNgrok) {
            await atualizaEndpointCCEE(hostNgrok);
        }
    }, 1 * 60 * 1000); // Atualiza a cada 1 minuto
});