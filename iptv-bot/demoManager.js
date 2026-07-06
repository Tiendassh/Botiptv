// demoManager.js
// Lógica para rotar contraseñas de las cuentas fijas (Demo1 y Demo2)

/**
 * Procesa la cuenta obtenida desde Make y rota su contraseña si es necesario.
 * @param {Object} cuentaActual - Objeto que viene desde Make (Google Sheets)
 * @returns {Object} { nuevaContrasena, nuevoContador, debeActualizar }
 */
function procesarRotacionDemo(cuentaActual) {
  if (!cuentaActual || !cuentaActual.Usuario) {
    throw new Error("Datos de cuenta inválidos");
  }

  const usuario = cuentaActual.Usuario;
  let contrasena = cuentaActual.Contrasena_Actual || "";
  
  let contadorUsos = parseInt(cuentaActual.Contador_Usos, 10);
  if (isNaN(contadorUsos)) {
    contadorUsos = 0;
  }

  let debeActualizar = false;
  
  // Incrementar contador
  const nuevoContador = contadorUsos + 1;

  // Si el contador es múltiplo de 3, generamos nueva contraseña
  if (nuevoContador > 0 && nuevoContador % 3 === 0) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomPass = "";
    for (let i = 0; i < 6; i++) {
      randomPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    contrasena = randomPass;
    debeActualizar = true; // Indica que se debe cambiar en el panel real
  }

  return {
    usuario,
    nuevaContrasena: contrasena,
    nuevoContador,
    debeActualizar
  };
}

module.exports = {
  procesarRotacionDemo
};
