import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

// TOKEN DEL BOT
const TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

// Memoria temporal por chat
const sessionData = {};

function sendMessage(chatId, text) {
  return fetch(TELEGRAM_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

app.post("/webhook", async (req, res) => {
  console.log("📩 Datos recibidos:", JSON.stringify(req.body, null, 2));

  const message = req.body.message;
  if (!message || !message.text) return res.sendStatus(200);

  const chatId = message.chat.id;
  const text = message.text.trim();

  // Si no existe sesión, se inicializa
  if (!sessionData[chatId]) {
    sessionData[chatId] = {
      step: 1,
      md: null,
      mo: null,
      ci: null,
      vmi: null,
    };

    await sendMessage(chatId, "Hola, iniciaré el cálculo del PCN.");
    await sendMessage(chatId, "¿Cuál es el valor de Materiales Directos (MD)?");
    return res.sendStatus(200);
  }

  const data = sessionData[chatId];

  switch (data.step) {
    case 1:
      data.md = Number(text);
      data.step = 2;
      await sendMessage(chatId, "Gracias. ¿Cuál es el valor de Mano de Obra (MO)?");
      break;

    case 2:
      data.mo = Number(text);
      data.step = 3;
      await sendMessage(chatId, "Perfecto. ¿Cuánto corresponde a Costos Indirectos (CI)?");
      break;

    case 3:
      data.ci = Number(text);
      data.step = 4;
      await sendMessage(chatId, "Bien. ¿Cuál es el valor de Materiales Importados (VMI)?");
      break;

    case 4:
      data.vmi = Number(text);

      const CN = data.md + data.mo + data.ci;
      const PCN = (CN / (CN + data.vmi)) * 100;

      await sendMessage(
        chatId,
        `📐 Resultado del Cálculo:\nCN = ${CN}\nPCN = ${PCN.toFixed(2)}%`
      );

      delete sessionData[chatId]; // limpia sesión
      break;
  }

  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`🚀 Servidor activo en puerto: ${PORT}`));
