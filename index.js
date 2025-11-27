// index.js
import express from "express";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Ruta para pruebas simples desde el navegador
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

// Ruta del Webhook para Dialogflow
app.post("/webhook", (req, res) => {
  console.log("📩 Webhook recibido");
  console.log("🧠 Body recibido:", JSON.stringify(req.body, null, 2));

  return res.json({
    fulfillmentText: "Webhook funcionando correctamente desde Render 🚀"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en puerto: ${PORT}`);
});
