# Tech

## Technologies used
- Node.js
- `node-fetch` para requisições HTTP
- Módulo `http` nativo do Node.js

## Development setup
- Ambiente Node.js instalado
- `npm install` para instalar dependências (`node-fetch`)
- Exposição externa via `ngrok` (para testes de webhook)

## Technical constraints
- Dependência de um serviço externo (`ngrok`) para simular o ambiente de produção/homologação com a CCEE.
- A comunicação é HTTP/HTTPS.

## Dependencies
- `node-fetch`: para fazer requisições HTTP.

## Tool usage patterns
- Uso de `setInterval` para agendamento de tarefas (atualização periódica do endpoint da CCEE).
- Tratamento de requisições HTTP com `http.createServer`.