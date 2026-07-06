// index.js
// Servidor Express para recibir webhooks desde Make (Integromat)

const express = require("express");
const config = require("./configuracion");
const { procesarRotacionDemo } = require("./demoManager");

const app = express();
app.use(express.json());

// Endpoint que recibirá la llamada HTTP desde Make
app.post(config.webhookPath, (req, res) => {
  try {
    const { telefono, mensajeUsuario, cuentaSeleccionada, aliasBrubank } = req.body;

    // Validación básica
    if (!telefono || !mensajeUsuario) {
      return res.status(400).json({ error: "Faltan datos requeridos (telefono, mensajeUsuario)" });
    }

    console.log(`Mensaje recibido de ${telefono}: ${mensajeUsuario}`);
    
    let textoParaEnviar = "";
    let actualizarSheets = null;

    // 1. Detectar si el usuario pide DEMO
    if (mensajeUsuario === "1" || mensajeUsuario.toLowerCase().includes("demo")) {
      
      if (!cuentaSeleccionada || !cuentaSeleccionada.Usuario) {
        textoParaEnviar = config.mensajes.sinCuentas;
      } else {
        // Rotar cuenta usando demoManager
        const rotacion = procesarRotacionDemo(cuentaSeleccionada);
        
        textoParaEnviar = `¡Hola! Aquí tienes tu demo generada automáticamente:\n\n` +
                          `📺 *App Recomendada*: IPTV Smarters Pro\n` +
                          `👤 *Usuario*: ${rotacion.usuario}\n` +
                          `🔑 *Contraseña*: ${rotacion.nuevaContrasena}\n\n` +
                          `Disfruta del mejor contenido.`;
                          
        // Datos que Make deberá actualizar en Google Sheets
        actualizarSheets = {
          id: cuentaSeleccionada.ID,
          nuevaContrasena: rotacion.nuevaContrasena,
          nuevoContador: rotacion.nuevoContador,
          cambiarEnPanel: rotacion.debeActualizar
        };
      }
    } 
    // 2. Detectar si pide PRECIOS
    else if (mensajeUsuario === "2" || mensajeUsuario.toLowerCase().includes("precio")) {
      const alias = aliasBrubank || "alias.no.configurado";
      textoParaEnviar = `*Nuestros Planes:*\n` +
                        `- 1 Mes: $2,500 ARS\n` +
                        `- 3 Meses: $6,500 ARS\n\n` +
                        `Para pagar, transfiere al Alias: *${alias}* y envíame el comprobante.`;
    }
    // 3. Otros mensajes
    else {
      textoParaEnviar = `Bienvenido al sistema automatizado IPTV.\n` +
                        `Escribe *1* para pedir una Demo.\n` +
                        `Escribe *2* para ver Precios.`;
    }

    // Responder a Make
    // Make tomará esta respuesta JSON para continuar su flujo
    return res.status(200).json({
      success: true,
      telefono: telefono,
      textoParaEnviar: textoParaEnviar,
      actualizarSheets: actualizarSheets
    });

  } catch (error) {
    console.error("Error en el webhook:", error);
    return res.status(500).json({ 
      success: false, 
      textoParaEnviar: config.mensajes.errorGenerico 
    });
  }
});

const PORT = config.puerto;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de Webhook IPTV corriendo en puerto ${PORT}`);
  console.log(`📡 Endpoint listo en: http://localhost:${PORT}/webhook-bot`);
});
