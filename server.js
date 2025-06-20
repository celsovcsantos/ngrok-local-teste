// Arquivo server.js
const http = require('http');
const fetch = require('node-fetch'); // Certifique-se de instalar o node-fetch com npm install node-fetch@2
const host = 'localhost';
const port = 8000;
const tokenCceeIntegration = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjIwMDc2MzcyNzgsInVzZXJfbmFtZSI6ImJhY2tvZmZpY2Utcm9ib3RzQGJvbHRlbmVyZ3kuY29tLmJyIiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9CQUNLT0ZGSUNFX1VTRVIiLCJST0xFX0JPTEVUQVNfVVNFUiIsIlJPTEVfQkFDS09GRklDRV9CSUJMSU9URUNBIl0sImp0aSI6ImYzZWJkYWMzLTkwN2EtNDcyZC04MzZjLTEyMzljMzliMWU5ZiIsImNsaWVudF9pZCI6InNpc3RlbWFzIiwic2NvcGUiOlsicmVhZCJdfQ.sMrepF_rNVHCcjf5KHToIK5eDjW3bOQTWIT1hQ3TU6oqrB95hgJy7mma4J1QE3dfBf0PzVgr6ijO2WOz2EQBplnzo6Hj0k0MAa3QQEGuFgbKKQIHYYgPw5RiTEBqwJlDqr-bGMw_5NLCmZW0wwB7BL9fG6Y7qDiSZWpvXrSqzbPj4IKCBv7Gwyui9XHpZjfgr1mECpPJF3wHH2qLHSYTO_VJv2X9oNoDt56vdRUw9IDKsKRxAHsbR8mUM-wD_t2m3cPsrCpCIIh-kAyDVZddXCo7jxz_Vfliml-C-79WmoTki31-LHoxxhGv_4BQsCOYJ4pn9q2u3W3Mqk1FQM12nA'
let hostNgrok;


// atualizaEndpointCCEE();

// setInterval(atualizaEndpointCCEE(), 1 * 60 * 1000);

function getDataatual() {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

async function atualizaEndpointCCEE(host) {
    if (host && host.startsWith('https://')) {
        hostNgrok = host.toString();
    } else {
        hostNgrok = `https://${host}`;
    }

    console.log('Host do ngrok para cadastrar:', hostNgrok);
    const bodyNgrok = {
        "nomeEndpoint": hostNgrok.toString(),
        "temAutorizacaoCustomizada": false
    }
    try {
        const result = await fetch('http://localhost:8081/api/v1/varejo/envia-endpoint-notificacao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: tokenCceeIntegration
            },
            body: JSON.stringify(bodyNgrok)
        });
        if (!result.ok) {
            console.error(`[${getDataatual()}] - Failed to forward POST bodyNgrok: ${JSON.stringify(await result.json())}`);
        } else {
            console.log('POST bodyNgrok forwarded successfully. Status:', result.status);
            console.log('Ngrok URL:', hostNgrok);
            const responseBody = await result.json();
            //const now = new Date();
            //const pad = n => n.toString().padStart(2, '0');
            //const formattedDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
            console.log(`[${getDataatual()}] - Response from CCEE-INTEGRATION: ${JSON.stringify(responseBody)}`);
        }
    } catch (error) {
        console.error(`[${getDataatual()}] - Error forwarding POST bodyNgrok: ${error}`);
    }
}


const requestListener = async function (req, res) {
    console.log('request received');
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    const body = await new Promise(resolve => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => resolve(data));
    });
    //Cadastro o host do ngrok
    // if (!hostNgrok) {
    // Executa ao iniciar a aplicação




    hostNgrok = req.headers.host
    await atualizaEndpointCCEE(hostNgrok)

    // Executa a cada 3 minutos
    //setInterval(atualizaEndpointCCEE(), 1 * 60 * 1000);


    if (req.method === 'POST' && body) {
        //Chama o webhook do CCEE-INTEGRATION
        try {
            const result = await fetch('http://localhost:8081/api/v1/varejo/recebe-notificacao-ccee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: tokenCceeIntegration
                },
                body
            });
            if (!result.ok) {
                console.error(`[${getDataatual()}] - Failed to forward POST body: ${JSON.stringify(await result.json())}`);
                //res.writeHead(result.status);
                //return await res.end(JSON.stringify({ error: 'Failed to forward POST body' }));
            } else {
                console.log('POST body forwarded successfully. Status:', result.status);
                const responseBody = await result.json();
                console.log(`[${getDataatual()}] - Response from CCEE-INTEGRATION: ${JSON.stringify(responseBody)}`);
            }
        } catch (error) {
            console.error(`[${getDataatual()}] - Error forwarding POST body: ${error}`);
        }
    }
    await res.end(JSON.stringify({
        message: 'This is Ngrok',
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: body ? JSON.parse(body) : null
    }));

};
const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
    console.log(`Ngrok URL: ${hostNgrok ? hostNgrok : 'Not set yet'}`);
    setInterval(async () => {
        if (hostNgrok) {
            await atualizaEndpointCCEE(hostNgrok);
        }
    }, 1 * 60 * 1000); // Atualiza a cada 1 minuto
});