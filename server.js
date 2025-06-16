// Arquivo server.js
const http = require('http');
const fetch = require('node-fetch'); // Certifique-se de instalar o node-fetch com npm install node-fetch@2
const host = 'localhost';
const port = 8000;
const requestListener = async function (req, res) {
    console.log('request received');
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    const body = await new Promise(resolve => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => resolve(data));
    });
    if (req.method === 'POST' && body) {
        try {
            const result = await fetch('http://localhost:8081/api/v1/varejo/recebe-notificacao-ccee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjIwMDc2MzcyNzgsInVzZXJfbmFtZSI6ImJhY2tvZmZpY2Utcm9ib3RzQGJvbHRlbmVyZ3kuY29tLmJyIiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9CQUNLT0ZGSUNFX1VTRVIiLCJST0xFX0JPTEVUQVNfVVNFUiIsIlJPTEVfQkFDS09GRklDRV9CSUJMSU9URUNBIl0sImp0aSI6ImYzZWJkYWMzLTkwN2EtNDcyZC04MzZjLTEyMzljMzliMWU5ZiIsImNsaWVudF9pZCI6InNpc3RlbWFzIiwic2NvcGUiOlsicmVhZCJdfQ.sMrepF_rNVHCcjf5KHToIK5eDjW3bOQTWIT1hQ3TU6oqrB95hgJy7mma4J1QE3dfBf0PzVgr6ijO2WOz2EQBplnzo6Hj0k0MAa3QQEGuFgbKKQIHYYgPw5RiTEBqwJlDqr-bGMw_5NLCmZW0wwB7BL9fG6Y7qDiSZWpvXrSqzbPj4IKCBv7Gwyui9XHpZjfgr1mECpPJF3wHH2qLHSYTO_VJv2X9oNoDt56vdRUw9IDKsKRxAHsbR8mUM-wD_t2m3cPsrCpCIIh-kAyDVZddXCo7jxz_Vfliml-C-79WmoTki31-LHoxxhGv_4BQsCOYJ4pn9q2u3W3Mqk1FQM12nA'
                },
                body
            });
            if (!result.ok) {
                console.error('Failed to forward POST body:', result.statusText);
                res.writeHead(result.status);
                return res.end(JSON.stringify({ error: 'Failed to forward POST body' }));
            } else {
                console.log('POST body forwarded successfully. Status:', result.status);
            }
        } catch (error) {
            console.error('Error forwarding POST body:', error);
        }
    }
    res.end(JSON.stringify({
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
});