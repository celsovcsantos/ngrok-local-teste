# Product

## Why this project exists
Este projeto existe para facilitar o desenvolvimento e teste de integrações com a API CCEE, permitindo que notificações sejam recebidas em um ambiente de desenvolvimento local através do ngrok.

## Problems it solves
Resolve o problema de testar webhooks e callbacks de APIs externas (como a CCEE) em ambientes de desenvolvimento locais, que normalmente não são acessíveis publicamente.

## How it should work
O servidor Node.js atua como um proxy, recebendo requisições da CCEE (via ngrok) e encaminhando-as para a aplicação local, ou vice-versa. Ele também atualiza o endpoint de notificação na CCEE periodicamente.

## User experience goals
Proporcionar um ambiente de teste de integração CCEE ágil e eficiente para desenvolvedores, minimizando a necessidade de deploy em ambientes de homologação remotos para cada teste.