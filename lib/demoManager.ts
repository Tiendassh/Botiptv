// lib/demoManager.ts
// Módulo para procesar la rotación de contraseñas de las cuentas demo fijas

export interface CuentaActual {
  id?: string | number;
  usuario?: string;
  contrasena?: string;
  Contrasena_Actual?: string;
  Contador_Usos?: string | number;
  contador_usos?: string | number;
}

/**
 * Procesa la rotación de usos de la cuenta seleccionada.
 * Si el nuevo contador es múltiplo de 3 (3, 6, 9...), genera una nueva contraseña
 * aleatoria de 6 caracteres y marca debeCambiarEnPanel como true.
 */
export function procesarRotacionDemo(cuentaActual: CuentaActual) {
  const id = cuentaActual?.id || "";
  const usuario = cuentaActual?.usuario || "";
  let contrasena = cuentaActual?.contrasena || cuentaActual?.Contrasena_Actual || "";
  
  // Extraer el contador con soporte para ambas nomenclaturas (Google Sheets y locales)
  const contadorRaw = cuentaActual?.Contador_Usos !== undefined 
    ? cuentaActual.Contador_Usos 
    : (cuentaActual?.contador_usos !== undefined ? cuentaActual.contador_usos : 0);
    
  let contadorUsos = parseInt(String(contadorRaw), 10);
  if (isNaN(contadorUsos)) {
    contadorUsos = 0;
  }
  
  let debeCambiarEnPanel = false;
  
  // Incrementar Contador_Usos por 1
  const nuevoContador = contadorUsos + 1;
  
  // Cada vez que es múltiplo de 3 (3, 6, 9...), generamos nueva contraseña
  if (nuevoContador > 0 && nuevoContador % 3 === 0) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomPass = "";
    for (let i = 0; i < 6; i++) {
      randomPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    contrasena = randomPass;
    debeCambiarEnPanel = true;
  }
  
  return {
    id,
    usuario,
    contrasena,
    nuevoContador,
    debeCambiarEnPanel
  };
}
