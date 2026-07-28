import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Generar credenciales de usuario final IPTV
function generateFinalUserCredentials(prefix: string = "USER_") {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const randomPassDigits = Math.floor(100000 + Math.random() * 900000);
  return {
    usuarioFinal: `${prefix.toUpperCase()}${randomDigits}`,
    contrasenaFinal: `PASS_${randomPassDigits}`
  };
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, config, userPrefix = "VIP_" } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    // Si no hay API key o es placeholder, simulamos una verificación exitosa inteligente
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      const { usuarioFinal, contrasenaFinal } = generateFinalUserCredentials(userPrefix);
      const randomOpNum = Math.floor(100000000 + Math.random() * 900000000);

      return NextResponse.json({
        verified: true,
        isSimulated: true,
        monto: config?.price1Month || "$3,500 ARS",
        numeroOperacion: `MP-${randomOpNum}`,
        entidadOBanco: "Mercado Pago / Transferencia",
        usuarioFinal,
        contrasenaFinal,
        vencimiento: "30 Días Premium",
        motivo: "Comprobante verificado correctamente (Modo Simulación / Auto-Aprobación)"
      });
    }

    // Si se proporciona una imagen base64, llamamos a Gemini 3.6 Flash con la capacidad multimodal
    let cleanBase64 = imageBase64;
    let detectedMimeType = mimeType || "image/png";

    if (imageBase64 && imageBase64.includes(";base64,")) {
      const parts = imageBase64.split(";base64,");
      detectedMimeType = parts[0].replace("data:", "");
      cleanBase64 = parts[1];
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const promptText = `Analiza detenidamente esta imagen enviada por un cliente que afirma ser un comprobante de pago o transferencia bancaria/digital (por ejemplo de Mercado Pago, Brubank, Ualá, Banco Galicia, BBVA, etc.) para la contratación de un servicio de IPTV Premium.

Determina si la imagen corresponde a un comprobante auténtico y legible de transferencia realizada con éxito.

Reglas de evaluación:
1. esComprobanteValido: true si se distingue claramente que es una transferencia, pago o comprobante finalizado con éxito. false si no es un comprobante, si está en estado pendiente/rechazado, es borroso o ilegible, o es una imagen no relacionada.
2. monto: extrae el monto total del pago (ejemplo: "$3,500 ARS" o "$9,000 ARS"). Si no es visible, pon "No especificado".
3. numeroOperacion: extrae el código o número de transacción / referencia de la transferencia.
4. entidadOBanco: banco o billetera digital origen o destino (ej. Mercado Pago, Brubank, etc.).
5. motivo: breve resumen de por qué es válido o por qué fue rechazado.`;

    const imagePart = {
      inlineData: {
        mimeType: detectedMimeType,
        data: cleanBase64,
      }
    };

    const textPart = { text: promptText };

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [imagePart, textPart],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            esComprobanteValido: { type: Type.BOOLEAN },
            monto: { type: Type.STRING },
            numeroOperacion: { type: Type.STRING },
            entidadOBanco: { type: Type.STRING },
            motivo: { type: Type.STRING },
          },
          required: ["esComprobanteValido", "monto", "numeroOperacion", "entidadOBanco", "motivo"],
        },
        temperature: 0.2,
      }
    });

    const jsonText = response.text || "{}";
    let parsedResult: any = {};
    try {
      parsedResult = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error("Error parseando respuesta JSON de Gemini:", jsonText);
      parsedResult = { esComprobanteValido: false, motivo: "No se pudo estructurar el resultado" };
    }

    if (parsedResult.esComprobanteValido) {
      const { usuarioFinal, contrasenaFinal } = generateFinalUserCredentials(userPrefix);
      
      // Determinar vencimiento según el monto si aplica
      let vencimiento = "30 Días Premium (1 Mes)";
      if (parsedResult.monto && (parsedResult.monto.includes("9000") || parsedResult.monto.includes("9.000"))) {
        vencimiento = "90 Días Premium (3 Meses)";
      }

      return NextResponse.json({
        verified: true,
        monto: parsedResult.monto || config?.price1Month || "$3,500 ARS",
        numeroOperacion: parsedResult.numeroOperacion || "N/A",
        entidadOBanco: parsedResult.entidadOBanco || "Billetera Digital / Banco",
        usuarioFinal,
        contrasenaFinal,
        vencimiento,
        motivo: parsedResult.motivo || "Comprobante verificado automáticamente por la IA Gemini."
      });
    } else {
      return NextResponse.json({
        verified: false,
        motivo: parsedResult.motivo || "No se pudo verificar la validez del comprobante enviado.",
        monto: parsedResult.monto || "No detectado",
        numeroOperacion: parsedResult.numeroOperacion || "No detectado"
      });
    }

  } catch (error: any) {
    console.error("Error verificando comprobante con Gemini:", error);
    
    // Si la llamada multimodal falla (por ejemplo por formato de imagen), respondemos de forma graciosa permitiendo revisión manual
    return NextResponse.json({
      verified: false,
      error: "Error técnico al procesar la imagen con Gemini",
      motivo: "Se requiere revisión manual por parte del administrador.",
      details: error.message
    }, { status: 200 });
  }
}
