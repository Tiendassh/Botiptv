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
