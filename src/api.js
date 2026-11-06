// Cliente de la API. Siempre usa rutas /api de la misma dirección: en desarrollo
// las redirige Vite y al publicar las redirige Vercel a la API. Así la cookie de
// sesión es del mismo sitio y el navegador la protege.
export async function api(ruta, { metodo = 'GET', datos } = {}) {
  let respuesta;
  try {
    respuesta = await fetch(ruta, {
      method: metodo,
      headers: datos ? { 'Content-Type': 'application/json' } : {},
      body: datos ? JSON.stringify(datos) : undefined,
    });
  } catch {
    throw new Error('No hay conexión con el servidor. Intenta de nuevo en un momento.');
  }
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    const error = new Error(cuerpo.error || 'Algo salió mal. Intenta de nuevo.');
    error.estado = respuesta.status;
    throw error;
  }
  return cuerpo;
}
