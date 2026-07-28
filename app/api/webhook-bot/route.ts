import { NextRequest, NextResponse } from "next/server";
import { procesarRotacionDemo } from "@/lib/demoManager";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telefono, mensajeUsuario, cuentaSeleccionada, aliasBrubank } = body;

    if (!mensajeUsuario) {
      return NextResponse.json({ error: "mensajeUsuario es requerido" }, { status: 400 });
    }

    const textNormalized = String(mensajeUsuario).toLowerCase().trim();

    // 1. Caso: Menú principal
    if (textNormalized === "hola" || textNormalized === "menu" || textNormalized === "menú" || textNormalized === "inicio") {
      const menuMsg = `👋 ¡Hola! Te doy la bienvenida a nuestro servicio de *IPTV Premium* 📺.\n\nElige una opción enviando el número correspondiente:\n\n1️⃣ *Pedir Demo Gratuita* (prueba de 2 horas)\n2️⃣ *Contratar 1 Mes* ($3,500 ARS)\n3️⃣ *Contratar 3 Meses* ($9,000 ARS - ¡Descuento!)\n4️⃣ *Ya efectué el pago* (Mandar comprobante / Crear usuario final)\n5️⃣ *Guías de instalación y soporte*\n\n_Escribe tu duda y la IA Gemini te asistirá._`;
      
      return NextResponse.json({
        success: true,
        accion: "enviar_menu",
        textoParaEnviar: menuMsg
      });
    }

    // 2. Caso: Demo Gratuita
    if (textNormalized.includes("demo") || textNormalized === "1") {
      const cuenta = cuentaSeleccionada || { id: 1, usuario: "demo_default", contrasena: "123456", Contador_Usos: 0 };
      const resultado = procesarRotacionDemo(cuenta);

      const textoParaEnviar = `📺 *¡Demo gratuita generada con éxito!* 🎉\n\nAquí tienes tus credenciales de acceso válidas por *2 horas*:\n\n👤 *Usuario:* \`${resultado.usuario}\`\n🔑 *Contraseña:* \`${resultado.contrasena}\`\n\n📱 *Guía de instalación:* https://guias-iptv.com/instalacion\n🔢 *Código Downloader:* 82541\n\n_Recuerda que si deseas contratar un plan mensual, escribe 2 o 3._`;

      let avisoAdmin = "";
      if (resultado.debeCambiarEnPanel) {
        avisoAdmin = `⚠️ *AVISO ADMINISTRADOR:* La cuenta demo con ID ${resultado.id} (Usuario: ${resultado.usuario}) ha alcanzado un múltiplo de 3 usos. Nueva contraseña: *${resultado.contrasena}*.`;
      }

      return NextResponse.json({
        success: true,
        accion: "actualizar_demo",
        textoParaEnviar,
        avisoAdmin,
        idCuenta: resultado.id,
        nuevaContrasena: resultado.contrasena,
        nuevoContador: resultado.nuevoContador
      });
    }

    // 3. Caso: Contratar 1 Mes
    if (textNormalized === "2" || textNormalized.includes("1 mes") || textNormalized.includes("un mes")) {
      const currentAlias = aliasBrubank || "iptv.venta.mp";
      const instructivoMsg = `💳 *INSTRUCTIVO PARA ABONAR - PLAN 1 MES PREMIUM* 📺\n\n💵 *Monto a abonar:* $3,500 ARS (1 Mes completo de servicio)\n\n📱 *Datos para Transferir (Mercado Pago / Banco):*\n👉 *Alias Mercado Pago:* \`${currentAlias}\`\n👉 *Titular:* IPTV Ventas S.A.\n\n📌 *Instrucciones para activar tu cuenta:*\n1. Ingresa a Mercado Pago o tu App Bancaria y transfiere $3,500 ARS al Alias \`${currentAlias}\`.\n2. Una vez realizada la transferencia, selecciona la opción *4 ("Ya efectué el pago")* o envía la captura de pantalla de tu comprobante por aquí.\n3. La Inteligencia Artificial Gemini verificará tu transferencia y creará tu **Usuario Final Premium** al instante.`;
      
      return NextResponse.json({
        success: true,
        accion: "enviar_precios_1m",
        textoParaEnviar: instructivoMsg
      });
    }

    // 4. Caso: Contratar 3 Meses
    if (textNormalized === "3" || textNormalized.includes("3 meses") || textNormalized.includes("tres meses")) {
      const currentAlias = aliasBrubank || "iptv.venta.mp";
      const instructivo3mMsg = `💳 *INSTRUCTIVO PARA ABONAR - PLAN 3 MESES PREMIUM* 📺\n\n💵 *Monto a abonar:* $9,000 ARS (3 Meses con Descuento Especial)\n\n📱 *Datos para Transferir (Mercado Pago / Banco):*\n👉 *Alias Mercado Pago:* \`${currentAlias}\`\n👉 *Titular:* IPTV Ventas S.A.\n\n📌 *Instrucciones para activar tu cuenta:*\n1. Ingresa a Mercado Pago o tu App Bancaria y transfiere $9,000 ARS al Alias \`${currentAlias}\`.\n2. Una vez realizada la transferencia, selecciona la opción *4 ("Ya efectué el pago")* o envía la captura de pantalla de tu comprobante por aquí.\n3. La Inteligencia Artificial Gemini verificará tu transferencia y creará tu **Usuario Final Premium** al instante.`;
      
      return NextResponse.json({
        success: true,
        accion: "enviar_precios_3m",
        textoParaEnviar: instructivo3mMsg
      });
    }

    // 5. Caso: Ya efectué el pago / Crear usuario final
    if (textNormalized === "4" || textNormalized.includes("pague") || textNormalized.includes("pagué") || textNormalized.includes("efectue") || textNormalized.includes("efectué") || textNormalized.includes("comprobante") || textNormalized.includes("usuario final")) {
      const pedirComprobanteMsg = `💳 *¡Excelente! Vamos a activar tu Usuario Final Premium.* 🚀\n\n📸 Por favor, **adjunta la foto o captura de pantalla de tu comprobante de pago** aquí mismo en el chat.\n\n🤖 Nuestra *Inteligencia Artificial Gemini* analizará tu captura al instante y generará tus credenciales de acceso automáticamente.`;

      return NextResponse.json({
        success: true,
        accion: "pedir_comprobante",
        textoParaEnviar: pedirComprobanteMsg
      });
    }

    // 6. Caso: Guías de instalación
    if (textNormalized === "5" || textNormalized.includes("guia") || textNormalized.includes("guía") || textNormalized.includes("soporte")) {
      const guiasMsg = `🛠️ *Guías de Instalación y Soporte* ⚙️\n\nInstala nuestro servicio IPTV en cualquier dispositivo de forma simple:\n\n🔥 *Fire TV Stick / TV Box:* \n1. Descarga la app *Downloader* desde la tienda de Amazon.\n2. Ingresa el código Downloader: \`82541\` para bajar la app oficial.\n\n📺 *Smart TV (Samsung/LG):*\nDescarga la app *Smartters Player Lite* o *ibo Player* desde la tienda oficial.\n\n🌐 *Manual web de instalación:* https://guias-iptv.com/instalacion`;
      
      return NextResponse.json({
        success: true,
        accion: "enviar_guias",
        textoParaEnviar: guiasMsg
      });
    }

    // 5. Caso: Soporte con Gemini AI (si está disponible en las variables de entorno)
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      try {
        const ai = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const systemInstruction = `
Eres el agente inteligente de atención automática para un servicio de IPTV premium.
Respondes consultas de clientes interesados en adquirir el servicio de forma amigable, atenta y concisa, en formato de WhatsApp.
Usa emojis de manera natural y organizada.

Directrices importantes:
1. Responde de forma directa y al grano en un máximo de 2-3 párrafos cortos.
2. Si el cliente pregunta cómo comprar, recuérdale que puede presionar la opción '2' en el menú principal para ver los métodos de pago, o que te envíe el comprobante de pago directamente por aquí.
3. Si pregunta sobre compatibilidad de dispositivos, aclara que es compatible con: Smart TV, TV Boxes, Fire TV Stick, Celulares (Android/iOS) y PCs.
4. Si pregunta sobre canales, aclara que incluye más de 10,000 canales internacionales, deportes premium en vivo, ligas locales, series y películas.
5. Mantén un tono respetuoso, alegre y vendedor.
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: mensajeUsuario,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        return NextResponse.json({
          success: true,
          accion: "enviar_ai",
          textoParaEnviar: response.text
        });
      } catch (geminiError: any) {
        console.error("Error al consultar Gemini en Webhook-Bot:", geminiError);
      }
    }

    // Respuesta inteligente simulada por defecto (si Gemini no está disponible o falla)
    const textSimulated = `🤖 *[Soporte AI - Simulado]*\n\nGracias por tu consulta sobre: "${mensajeUsuario}".\n\nNuestros servicios IPTV son 100% compatibles con Smart TVs (Samsung/LG), Fire Stick, TV Box, celulares y PCs. Ofrecemos más de 10,000 canales en vivo, incluyendo todo el fútbol argentino premium, contenido en HD/4K, películas y series de estreno.\n\nEscribe *menu* para ver las opciones automáticas de Demo Gratuita (1) o Datos de Pago (2).`;

    return NextResponse.json({
      success: true,
      accion: "enviar_no_reconocido",
      textoParaEnviar: textSimulated
    });

  } catch (error: any) {
    console.error("Error en Webhook-Bot Endpoint:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
