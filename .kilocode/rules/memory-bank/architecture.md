# Architecture

## System architecture
O projeto consiste em um servidor Node.js simples que atua como um proxy/webhook. Ele recebe requisições HTTP e as encaminha para a API da CCEE, além de ter uma lógica para atualizar periodicamente o endpoint de notificação na CCEE.

## Source Code paths
- `server.js`: Contém a lógica principal do servidor, incluindo o tratamento de requisições, o encaminhamento para a CCEE e a atualização periódica do endpoint.
- `package.json`: Define as dependências do projeto (atualmente, `node-fetch`).

## Key technical decisions
- Utilização de `node-fetch` para realizar requisições HTTP assíncronas.
- Uso do módulo `http` nativo do Node.js para criar o servidor.
- Lógica para inicializar o `hostNgrok` a partir do cabeçalho `host` da primeira requisição.
- Atualização periódica do endpoint da CCEE usando `setInterval`.
- Uso de `pino` para logging estruturado.

## Design patterns in use
- **Proxy Pattern**: O servidor atua como um proxy para as requisições da CCEE.

## Component relationships
- `server.js` depende de `node-fetch` para requisições HTTP.
- O servidor interage com a API da CCEE para enviar e receber notificações.
- A comunicação externa é esperada via `ngrok`.

## Critical implementation paths
- Tratamento de requisições POST recebidas, extração do corpo e encaminhamento para a CCEE.
- Lógica de atualização do endpoint da CCEE, incluindo a obtenção do host ngrok e o envio da requisição POST.
- Gestão de erros e logs para as operações de requisição.