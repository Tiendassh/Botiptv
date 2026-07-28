// index.js
// Servidor Express para recibir webhooks desde Make (Integromat)

require('dotenv').config();
const express = require("express");
const { createClient } = require('@supabase/supabase-js');
const config = require("./configuracion");

// Inicializar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const { procesarRotacionDemo } = require("./demoManager");

const app = express();
app.use(express.json());

// ==========================================
// RUTA 1: TRAER AJUSTES (Para el Front-End / App)
// ==========================================
app.get('/obtener-configuracion', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('configuracion') // Nombre real en minúsculas
            .select('Dato, Valor'); // Columnas reales con mayúscula inicial

        if (error) throw error;

        // Mapeamos los datos para estructurarlos de forma simple
        const configMap = {};
        data.forEach(item => { 
            configMap[item.Dato] = item.Valor; 
        });

        return res.status(200).json({
            linkPlataforma: configMap['link_plataforma'],
            precioMes: configMap['precio_mes'],
            alias_mercado_pago: configMap['alias_mercado_pago']
        });
    } catch (error) {
        console.error("Error en /obtener-configuracion:", error);
        return res.status(500).json({ error: 'Error al conectar con la base de datos.' });
    }
});

// ==========================================
// RUTA 2: ENTREGAR CUENTA DEMO (Rotativa)
// ==========================================
app.post('/solicitar-demo', async (req, res) => {
    try {
        // 1. Buscamos la cuenta con menos usos de tu tabla DEMO
        const { data: cuentas, error: errCuenta } = await supabase
            .from('DEMO') // Tu tabla real completamente en MAYÚSCULAS
            .select('*')
            .order('contador_usos', { ascending: true })
            .limit(1);

        if (errCuenta || !cuentas || cuentas.length === 0) {
            return res.status(404).json({ error: 'No hay cuentas demo disponibles.' });
        }

        const cuentaSeleccionada = cuentas[0];

        // LÓGICA: Sumamos un uso a esa cuenta específica
        let nuevoContador = Number(cuentaSeleccionada.contador_usos) + 1;

        // 2. Guardamos la actualización usando el "iD" (con la D minúscula)
        const { error: errUpdate } = await supabase
            .from('DEMO')
            .update({ contador_usos: nuevoContador })
            .eq('iD', cuentaSeleccionada.iD); // Filtramos por el iD exacto

        if (errUpdate) throw errUpdate;

        // 3. Le mandamos la información de acceso limpia a la App de Android
        return res.status(200).json({
            usuario: cuentaSeleccionada.usuario,
            contrasena: cuentaSeleccionada.contraseña // Mapeado con la 'ñ' real
        });

    } catch (error) {
        console.error("Error en /solicitar-demo:", error);
        return res.status(500).json({ error: 'Error al procesar la cuenta demo.' });
    }
});

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
    // 2. Detectar si pide PLAN 1 MES
    else if (mensajeUsuario === "2" || mensajeUsuario.toLowerCase().includes("1 mes")) {
      const alias = aliasBrubank || "iptv.venta.mp";
      textoParaEnviar = `💳 *INSTRUCTIVO PARA ABONAR - PLAN 1 MES PREMIUM* 📺\n\n` +
                        `💵 *Monto a abonar:* $3,500 ARS\n` +
                        `📱 *Alias Mercado Pago:* *${alias}*\n` +
                        `👉 *Titular:* IPTV Ventas S.A.\n\n` +
                        `📌 *Instrucciones:*\n` +
                        `1. Transfiere $3,500 ARS al Alias *${alias}*.\n` +
                        `2. Envía la foto de tu comprobante en este chat o escribe *4* ("Ya efectué el pago").\n` +
                        `3. La IA Gemini comprobará tu transferencia y creará tu usuario final al instante.`;
    }
    // 3. Detectar si pide PLAN 3 MESES
    else if (mensajeUsuario === "3" || mensajeUsuario.toLowerCase().includes("3 meses")) {
      const alias = aliasBrubank || "iptv.venta.mp";
      textoParaEnviar = `💳 *INSTRUCTIVO PARA ABONAR - PLAN 3 MESES PREMIUM* 📺\n\n` +
                        `💵 *Monto a abonar:* $9,000 ARS (¡Descuento especial!)\n` +
                        `📱 *Alias Mercado Pago:* *${alias}*\n` +
                        `👉 *Titular:* IPTV Ventas S.A.\n\n` +
                        `📌 *Instrucciones:*\n` +
                        `1. Transfiere $9,000 ARS al Alias *${alias}*.\n` +
                        `2. Envía la foto de tu comprobante en este chat o escribe *4* ("Ya efectué el pago").\n` +
                        `3. La IA Gemini comprobará tu transferencia y creará tu usuario final al instante.`;
    }
    // 4. Detectar si dice YA EFECTUÉ EL PAGO
    else if (mensajeUsuario === "4" || mensajeUsuario.toLowerCase().includes("pago") || mensajeUsuario.toLowerCase().includes("pague")) {
      textoParaEnviar = `💳 *¡Excelente! Vamos a activar tu Usuario Final Premium.* 🚀\n\n` +
                        `📸 Por favor, *adjunta la foto o captura de tu comprobante de pago* aquí mismo en el chat.\n\n` +
                        `🤖 La Inteligencia Artificial analizará tu transferencia y creará tus credenciales al instante.`;
    }
    // 5. Otros mensajes / Menú
    else {
      textoParaEnviar = `Bienvenido al sistema automatizado IPTV 📺.\n\n` +
                        `1️⃣ Escribe *1* para Pedir una Demo.\n` +
                        `2️⃣ Escribe *2* para Contratar 1 Mes.\n` +
                        `3️⃣ Escribe *3* para Contratar 3 Meses.\n` +
                        `4️⃣ Escribe *4* si *Ya efectuaste el pago* (Enviar comprobante).\n` +
                        `5️⃣ Escribe *5* para Guías de Instalación.`;
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
