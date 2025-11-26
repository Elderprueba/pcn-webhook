// index.js — reemplaza todo el contenido anterior por este archivo
import express from "express";

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware para parsear JSON entrante
app.use(express.json());

/**
 * Helper: intentar extraer parámetros md, mo, ci, vmi desde:
 * 1) req.body.queryResult.parameters
 * 2) cualquiera de req.body.queryResult.outputContexts[].parameters
 * Devuelve un objeto con valores numéricos (o undefined si no se encontraron).
 */
function extractParameters(body) {
  const qr = body?.queryResult ?? {};
  // 1) parámetros directos
  let p = qr.parameters ?? {};

  // Si viene vacío, buscar en outputContexts (ej. contexto pcn-data)
  if (!p || Object.keys(p).length === 0) {
    const contexts = qr.outputContexts ?? [];
    for (const ctx of contexts) {
      const cp = ctx.parameters ?? {};
      // buscar si alguno de los campos esperados existe en ese contexto
      if (
        cp.md !== undefined ||
        cp.mo !== undefined ||
        cp.ci !== undefined ||
        cp.vmi !== undefined ||
        cp["md.original"] !== undefined ||
        cp["mo.original"] !== undefined ||
        cp["ci.original"] !== undefined ||
        cp["vmi.original"] !== undefined
      ) {
        p = cp;
        break;
      }
    }
  }

  // Normalizar y parsear números (manejar formas md / md.original)
  const getNum = (obj, name) => {
    if (!obj) return undefined;
    const raw = obj[name] ?? obj[`${name}.original`] ?? obj[name.toUpperCase()];
    const n = raw === "" || raw === null || raw === undefined ? NaN : Number(raw);
    return Number.isFinite(n) ? n : undefined;
  };

  const md = getNum(p, "md");
  const mo = getNum(p, "mo");
  const ci = getNum(p, "ci");
  const vmi = getNum(p, "vmi");

  return { md, mo, ci, vmi };
}

// Ruta de verificación simple
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente ✔️");
});

// Webhook que Dialogflow llamará
app.post("/webhook", (req, res) => {
  try {
    console.log("📩 Datos recibidos del webhook:", JSON.stringify(req.body, null, 2));

    const params = extractParameters(req.body);
    console.log("📌 Parámetros separados (numéricos si aplican):", params);

    const { md, mo, ci, vmi } = params;

    // Si no hay parámetros numéricos válidos, damos una respuesta amistosa y no lanzamos error
    if (
      md === undefined &&
      mo === undefined &&
      ci === undefined &&
      vmi === undefined
    ) {
      // Respuesta cuando el intent no trae parámetros (por ejemplo saludo)
      return res.json({
        fulfillmentText:
          "Hola — estoy listo para calcular el PCN. Por favor proporciona los valores de materiales directos (md), mano de obra (mo), costos indirectos (ci) y valor de materiales importados (vmi).",
      });
    }

    // Validar que tengamos todos los números necesarios
    if (
      typeof md !== "number" ||
      typeof mo !== "number" ||
      typeof ci !== "number" ||
      typeof vmi !== "number" ||
      !isFinite(md) ||
      !isFinite(mo) ||
      !isFinite(ci) ||
      !isFinite(vmi)
    ) {
      return res.json({
        fulfillmentText:
          "No pude leer correctamente los números. Asegúrate de enviar valores numéricos para md, mo, ci y vmi.",
      });
    }

    // Calculo
    const CN = md + mo + ci;

    // Evitar división por cero
    if (CN === 0) {
      return res.json({
        fulfillmentText: "El Costo Neto (CN) es cero, no puedo calcular el porcentaje.",
      });
    }

    const PCN = ((CN - vmi) / CN) * 100;

    console.log("📊 Valores numéricos:", { md, mo, ci, vmi, CN, PCN });

    const responseMessage = `📐 Resultado:\nCosto Neto (CN) = ${CN.toFixed(
      2
    )}\nPorcentaje de Contenido Nacional (PCN) = ${PCN.toFixed(2)}%`;

    return res.json({
      fulfillmentText: responseMessage,
    });
  } catch (err) {
    console.error("❌ Error en ejecución:", err);
    return res.json({
      fulfillmentText:
        "Ocurrió un error calculando el PCN. Por favor intenta de nuevo o revisa los valores proporcionados.",
    });
  }
});

// Escuchar puerto asignado por Render (o el default)
app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en puerto: ${PORT}`);
});
