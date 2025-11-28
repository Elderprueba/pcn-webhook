import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

// Endpoint principal para Telegram
app.post("/webhook", async (req, res) => {
  console.log("📩 Actualización recibida:", JSON.stringify(req.body, null, 2));

  const message = req.body.message?.text;
  const chatId = req.body.message?.chat?.id;

  // Si no hay mensaje, respondemos OK silencioso
  if (!message) return res.sendStatus(200);

  // Respuesta básica si el usuario no está enviando números todavía
  if (isNaN(message)) {
    return enviarMensajeTelegram(
      chatId,
      "👋 Hola, estoy listo para calcular el PCN. Escribe 'calcular' para iniciar."
    ).then(() => res.sendStatus(200));
  }

  // Si el usuario envía un número, podemos procesarlo después
  return enviarMensajeTelegram(chatId, "Recibí un valor numérico. Muy pronto calcularé el PCN.")
    .then(() => res.sendStatus(200));
});

// Función para enviar mensajes a Telegram
import axios from "axios";

async function enviarMensajeTelegram(chatId, texto) {
  const token = process.env.TELEGRAM_TOKEN;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  return axios.post(url, {
    chat_id: chatId,
    text: texto,
  });
}
app.listen(PORT, () => console.log(`🚀 Servidor activo en puerto: ${PORT}`));
