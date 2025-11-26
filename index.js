import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware para parsear JSON
app.use(bodyParser.json());

// Ruta principal para verificar funcionamiento
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente ✔️");
});

// Webhook Dialogflow
app.post("/webhook", (req, res) => {
  console.log("📩 Datos recibidos del webhook:", JSON.stringify(req.body, null, 2)); // log principal

  try {
    const parameters = req.body?.queryResult?.parameters;

    console.log("📌 Parámetros separados:", parameters);

    if (!parameters) {
      throw new Error("No llegaron parámetros desde Dialogflow");
    }

    const md = Number(parameters.md);
    const mo = Number(parameters.mo);
    const ci = Number(parameters.ci);
    const vmi = Number(parameters.vmi);

    console.log("📊 Valores numéricos:", { md, mo, ci, vmi });

    const CN = md + mo + ci;
    const PCN = ((CN - vmi) / CN) * 100;

    console.log("📐 Resultado CN:", CN);
    console.log("📐 Resultado PCN:", PCN);

    const responseMessage = `El Costo Neto (CN) es ${CN.toFixed(2)} y el Porcentaje de Contenido Nacional (PCN) es ${PCN.toFixed(2)}%`;

    return res.json({
      fulfillmentText: responseMessage,
    });

  } catch (error) {
    console.error("❌ Error en ejecución:", error);

    return res.json({
      fulfillmentText: "Ocurrió un error calculando el PCN. Verifica los valores enviados.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en puerto: ${PORT}`);
});

