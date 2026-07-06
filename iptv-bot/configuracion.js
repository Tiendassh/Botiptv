// configuracion.js
// IMPORTANTE: Estos valores deben coincidir con tu Google Sheets

module.exports = {
  puerto: process.env.PORT || 3000,
  webhookPath: '/webhook-bot', // Ruta donde Render recibirá los POST
  
  // Nombres de hojas en tu Google Sheets
  hojaCuentas: "Cuentas_Demo",
  hojaConfig: "Configuracion",

  // Campos que tu Make enviará en el JSON del POST
  camposRequeridos: ["telefono", "mensajeUsuario", "cuentaSeleccionada"],
  
  // Mensajes de error base (se pueden sobreescribir desde Sheets)
  mensajes: {
    errorGenerico: "Lo siento, hubo un error procesando tu solicitud.",
    sinCuentas: "En este momento no hay cuentas demo disponibles. Intenta más tarde.",
    mantenimiento: "El sistema de demos se encuentra en mantenimiento."
  }
};
