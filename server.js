mport express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Porta que o Render exige
const PORT = process.env.PORT || 10000;

// Webhook de verificação (necessário pro WhatsApp API validar o endpoint)
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "meu_token_verificacao"; // você pode trocar esse valor

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook para receber mensagens do WhatsApp
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    if (body.object) {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0]?.value?.messages;

      if (changes && changes[0]) {
        const msg = changes[0].text.body;
        const from = changes[0].from;

        console.log("Mensagem recebida:", msg);

        // 1. Envia para a API da OpenAI
        const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: Bearer ${process.env.OPENAI_API_KEY},
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: msg }],
          }),
        }).then((r) => r.json());

        const reply = gptResponse.choices[0].message.content;

        // 2. Responde no WhatsApp
        await fetch(https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages, {
          method: "POST",
          headers: {
            "Authorization": Bearer ${process.env.WHATSAPP_TOKEN},
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            text: { body: reply },
          }),
        });

        console.log("Resposta enviada:", reply);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Erro no webhook:", error);
    res.sendStatus(500);
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(Webhook rodando na porta ${PORT});
});
