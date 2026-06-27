import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, config } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "El mensaje es requerido" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    // Si no hay API key configurada, devolvemos una respuesta simulada inteligente localmente
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return NextResponse.json({
        text: `🤖 *[Soporte AI - Simulado (Sin API Key)]*\n\nGracias por tu consulta: "${message}".\n\n_Para activar respuestas reales por IA, introduce una GEMINI_API_KEY válida en la sección de secretos._\n\nNuestros servicios IPTV son totalmente compatibles con Smart TVs (Samsung, LG, Android TV), Chromecast, Fire TV Stick, computadoras y celulares. Soportamos más de 10,000 canales en vivo, incluyendo deportes en Full HD y contenido premium sin cortes.`,
        isSimulated: true
      });
    }

    // Inicializamos el cliente de Google GenAI con la API key del servidor
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const pricesText = config 
      ? `Precios de planes: 1 Mes por ${config.price1Month || "$3500 ARS"}, 3 Meses por ${config.price3Months || "$9000 ARS"}. El alias de pago es: ${config.paymentAlias || "iptv.venta.mp"}.`
      : "Precios estándar: 1 Mes por $3500 ARS, 3 Meses por $9000 ARS. Alias de pago: iptv.venta.mp.";

    const systemInstruction = `
Eres el agente inteligente de atención automática para un servicio de IPTV premium.
Respondes consultas de clientes interesados en adquirir el servicio de forma amigable, atenta y concisa, en formato de mensaje de WhatsApp.
Usa emojis de manera natural y organizada.

Directrices importantes:
1. Responde de forma directa y al grano en un máximo de 2-3 párrafos cortos.
2. Si el cliente pregunta cómo comprar, recuérdale que puede presionar la opción '2' en el menú principal para ver los métodos de pago, o que te envíe el comprobante de pago directamente por aquí.
3. Si pregunta sobre compatibilidad de dispositivos, aclara que es compatible con: Smart TV (usando aplicaciones como Smartters Player, GSE IPTV, ibo Player), TV Boxes, Fire TV Stick, Celulares (Android/iOS) y PCs.
4. Si pregunta sobre canales, aclara que incluye más de 10,000 canales internacionales, deportes premium en vivo, ligas locales, series, películas y eventos de pago por evento (PPV).
5. Mantén un tono respetuoso, alegre y vendedor.
6. Información de precios actual: ${pricesText}

Recuerda: Responde como si fueses un bot de WhatsApp. No inventes enlaces raros.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error("Error en API de Gemini IPTV:", error);
    return NextResponse.json(
      { error: "Error procesando la solicitud de IA", details: error.message },
      { status: 500 }
    );
  }
}
