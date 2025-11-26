import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente ✔️");
});

app.post("/webhook", (req, res) => {
  try {
    const params = req.body.sessionInfo.parameters;
    const md = Number(params.md);
    const mo = Number(params.mo);
    const ci = Number(params.ci);
    const vmi = Number(params.vmi);

    const CN = md + mo + ci;
    const PCN = ((CN - vmi) / CN) * 100;

    res.json({
      fulfillmentText: `El Costo Neto (CN) es ${CN.toFixed(2)} y el Porcentaje de Contenido Nacional (PCN) es ${PCN.toFixed(2)}%`
    });

  } catch (err) {
    res.json({
      fulfillmentText: "Ocurrió un error calculando el PCN. Revisa los valores enviados."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo en puerto: ${PORT}`));

app.post("/webhook", (req, res) => {
  console.log("BODY RECIBIDO DESDE DIALOGFLOW:", req.body);

  try {
    const { vmi, md, mo, ci } = req.body.queryResult.parameters;

    console.log("Valores recibidos:", vmi, md, mo, ci);

    const resultado = (vmi * md * mo * ci) / 10000;

    if (!resultado || isNaN(resultado)) {
      throw new Error("Valores inválidos en parámetros");
    }

    return res.json({
      fulfillmentText: `El resultado del PCN es: ${resultado}`
    });

  } catch (error) {
    console.error("Error en cálculo:", error.message);
    return res.json({
      fulfillmentText: "Ocurrió un error calculando el PCN. Revisa los valores enviados."
    });
  }
});
