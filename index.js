import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

// Endpoint principal para el Webhook de Telegram
app.post("/webhook", async (req, res) => {
  console.log("📩 Actualización recibida:", JSON.stringify(req.body, null, 2));

  const message = req.body.message?.text;
  const chatId = req.body.message?.chat?.id;

  // Si no hay mensaje, respondemos OK silencioso
  if (!message) return res.sendStatus(200);

  // Respuesta básica cuando el texto NO es un número
  if (isNaN(message)) {
    await enviarMensajeTelegram(
      chatId,
      "👋 Hola, estoy listo para calcular el PCN. Escribe 'calcular' para iniciar."
    );
    return res.sendStatus(200);
  }

  // Respuesta cuando el usuario envía un número
  await enviarMensajeTelegram(
    chatId,
    "📥 Recibí un valor numérico. Muy pronto calcularé el PCN paso a paso."
  );
  return res.sendStatus(200);
});

// Función para enviar mensajes a Telegram usando Axios
async function enviarMensajeTelegram(chatId, texto) {
  const token = process.env.TELEGRAM_TOKEN;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: texto,
    });
  } catch (error) {
    console.error("❌ Error enviando mensaje a Telegram:", error.response?.data || error.message);
  }
}

// Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en puerto: ${PORT}`);
});
