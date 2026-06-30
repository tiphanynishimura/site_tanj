const express = require('express');
const cors = require('cors');
const app = express();

// Libera o seu frontend para conversar com este backend
app.use(cors());

app.get('/frete', async (req, res) => {
    const cepDestino = req.query.cep;
    
    // 1. Captura a quantidade enviada pelo script.js. Se não vier nada, usa 1 por padrão.
    const quantidadeItens = parseInt(req.query.qtd) || 1;

    if (!cepDestino) {
        return res.status(400).json({ erro: "CEP não informado" });
    }

    // ⚠️ MANTENHA O SEU TOKEN GIGANTE AQUI
    const TOKEN_MELHOR_ENVIO = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNmU5MTA3YjA4Nzg5Mzg2YTFhMzMxMjYwMjY3OGViZmRkZDUxMDg5NDI2ZWNhODE4MGViMTk5Yzk1NzhkNmI3OWFjZWNlNTY1OTY1Nzg5NDAiLCJpYXQiOjE3ODI3ODEzODUuNDg1MTA3LCJuYmYiOjE3ODI3ODEzODUuNDg1MTA5LCJleHAiOjE4MTQzMTczODUuNDczODk0LCJzdWIiOiJhMjIyNjgxZC0wYmI3LTQ1NDgtYjc5MS1mZDU1NWY1NWMzNGMiLCJzY29wZXMiOlsiY2FydC1yZWFkIiwiY2FydC13cml0ZSIsImNvbXBhbmllcy1yZWFkIiwiY29tcGFuaWVzLXdyaXRlIiwiY291cG9ucy1yZWFkIiwiY291cG9ucy13cml0ZSIsIm5vdGlmaWNhdGlvbnMtcmVhZCIsIm9yZGVycy1yZWFkIiwicHJvZHVjdHMtcmVhZCIsInByb2R1Y3RzLWRlc3Ryb3kiLCJwcm9kdWN0cy13cml0ZSIsInB1cmNoYXNlcy1yZWFkIiwic2hpcHBpbmctY2FsY3VsYXRlIiwic2hpcHBpbmctY2FuY2VsIiwic2hpcHBpbmctY2hlY2tvdXQiLCJzaGlwcGluZy1jb21wYW5pZXMiLCJzaGlwcGluZy1nZW5lcmF0ZSIsInNoaXBwaW5nLXByZXZpZXciLCJzaGlwcGluZy1wcmludCIsInNoaXBwaW5nLXNoYXJlIiwic2hpcHBpbmctdHJhY2tpbmciLCJlY29tbWVyY2Utc2hpcHBpbmciLCJ0cmFuc2FjdGlvbnMtcmVhZCIsInVzZXJzLXJlYWQiLCJ1c2Vycy13cml0ZSIsIndlYmhvb2tzLXJlYWQiLCJ3ZWJob29rcy13cml0ZSIsIndlYmhvb2tzLWRlbGV0ZSIsInRkZWFsZXItd2ViaG9vayJdfQ.qEqWmwT8SvXklgC0rAE7NwPsq_hBFMjXoU1gT03DaxD3RhKQBn2_H_ecp3Mry1339WddbGwQHBNZTEgfuf4PzdgrLpAr468DOuR4W-X583CxenH0wZfYuNZTX6EBP2uiS6ezMT4wopwOuS-tmiv03seBuZqNt4PUqnwkoRyZVXyJgBonEAO6CeCrZ50a_n-ZdkioSTDZQ6oltq2H6LC55juIByuFrO4RjqbeHdtuAsKBlP61oP8K_yWELjiy1vaj3PrzrKxx7LLaw8Rqisu4ZK7hPtsxm96usQB35V04N9eglw0JKX_wTJS3Bok0y_Y7CC7YvRuAZSOwk6-shU6LjhF7moBZSgTmfypRyD7b-aCFnlwBQuCXMZRjd6lF-YJTWucC51dss4IUR6XM_x-KjC-sAI-6fTySY4UeqL3TZUNF8h6hmF-bBgBTXw1x9Qhm4k8fU4bwqYuaNCxnWswifXvX1SFYtt7YPRqtmHkzcRs4SZU52zHS0ZMsqASJQBok5VfLESPbnrfakM5nPmqv0N_RRJ97FArcFZ22o40UpT5ofQFHzW6WKwDHTuisPTPNh1QaRy7SA3_rw6Rw4xM3DRjTnX6k2NZML7boi4pUKrC7hXB8PyKFu9T8CfyCcm0Ta1j8_Ol-H3JNusHeKXwMfmlF8L0Ub9k17NXYE1HMQP4"; 

    try {
        const resposta = await fetch('https://www.melhorenvio.com.br/api/v2/me/shipment/calculate', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN_MELHOR_ENVIO}`,
                'User-Agent': 'TANJ Electronics (tiphanynishimura@gmail.com)'
            },
            body: JSON.stringify({
                "from": { "postal_code": "64049550" }, // Origem configurada para Teresina
                "to": { "postal_code": cepDestino },
                "products": [
                    { 
                        "id": "x", 
                        "width": 11, 
                        "height": 2, 
                        "length": 16, 
                        "weight": 0.3, 
                        "insurance_value": 50.0, 
                        "quantity": quantidadeItens // 2. A MÁGICA ACONTECE AQUI!
                    }
                ]
            })
        });

        const dadosFrete = await resposta.json();
        res.json(dadosFrete);

    } catch (error) {
        res.status(500).json({ erro: "Falha ao consultar a transportadora." });
    }
});

// Agora o servidor aceita a porta que a nuvem escolher (process.env.PORT) ou usa a 3000 no seu PC
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend da TANJ rodando na porta ${PORT}!`);
});