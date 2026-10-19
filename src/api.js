// Cliente de la API. En desarrollo usa http://localhost:3001; al publicar se
// define VITE_API_URL con la dirección de la API (por ejemplo la de Render).
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function api(ruta, { metodo = 'GET', datos, token } = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${BASE}${ruta}`, {
      method: metodo,
      headers: {
        ...(datos ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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
