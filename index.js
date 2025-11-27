// index.js — Webhook oficial Bot PCN
import express from "express";
import bodyParser from "body-parser";
import { WebhookClient } from "dialogflow-fulfillment";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

// ----------------------
//  WEBHOOK ENDPOINT
// ----------------------
app.post("/webhook", (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });

  // ----------------------
  //  INTENT: Cálculo final
  // ----------------------
  function calculoFinal(agent) {
    const params = agent.parameters;

    // Obtenemos los valores enviados desde Dialogflow
    const md = parseFloat(params.md);
    const mo = parseFloat(params.mo);
    const ci = parseFloat(params.ci);
    const vmi = parseFloat(params.vmi);

    // Validación básica
    if ([md, mo, ci, vmi].some(v => isNaN(v))) {
      agent.add("Ocurrió un error leyendo los valores. Asegúrate de ingresar números válidos.");
      return;
    }

    // Fórmula PCN
    const total = md + mo + ci;
    const pcn = ((total - vmi) / total) * 100;

    agent.add(`📊 Cálculo completado.\n\nEl Porcentaje de Contenido Nacional (PCN) es: **${pcn.toFixed(2)}%**`);
  }

  // ----------------------
  // INTENT bienvenido desde Telegram para verificar conexión
  // ----------------------
  function bienvenida(agent) {
    agent.add("Webhook funcionando correctamente desde Render 🚀\n\nEscribe 'calcular pcn' para comenzar.");
  }

  // ----------------------
  // REGISTRO DE INTENTS
  // ----------------------
  let intentMap = new Map();
  intentMap.set("Verificacion-Webhook", bienvenida);
  intentMap.set("Calculo final", calculoFinal);

  agent.handleRequest(intentMap);
});

// ----------------------
// INICIAR SERVIDOR
// ----------------------
app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en puerto: ${PORT}`);
});
