import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Validação do Webhook
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "meu_token_teste";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Recebendo mensagens do WhatsApp
app.post("/webhook", async (req, res) => {
  const entry = req.body.entry?.[0]?.changes?.[0]?.value?.messages;
  if (entry && entry[0]) {
    const msg = entry[0].text?.body;
    const from = entry[0].from;

    console.log("Mensagem recebida:", msg);

    // Envia a mensagem para o ChatGPT
    const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": Bearer ${process.env.OPENAI_API_KEY}
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: msg }]
      })
    }).then(r => r.json());

    const reply = gptResponse.choices[0].message.content;

    // Responde no WhatsApp
    await fetch(https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages, {
      method: "POST",
      headers: {
        "Authorization": Bearer ${process.env.WHATSAPP_TOKEN},
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        text: { body: reply }
      })
    });

    console.log("Resposta enviada:", reply);
  }

  res.sendStatus(200);
});

// Porta padrão do Render
app.listen(10000, () => console.log("🚀 Webhook rodando na porta 10000"));
