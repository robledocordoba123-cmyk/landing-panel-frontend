import { vi } from 'vitest';

// Reemplaza fetch por respuestas fijas según método y ruta, y guarda cada petición
// para revisar qué envió la pantalla. Una ruta sin respuesta hace fallar la prueba.
export function apiFalsa(rutas) {
  const peticiones = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, opciones = {}) => {
    const metodo = opciones.method || 'GET';
    const ruta = String(url);
    peticiones.push({ metodo, ruta, cuerpo: opciones.body ? JSON.parse(opciones.body) : undefined });
    const clave = Object.keys(rutas).find((k) => {
      const [m, prefijo] = k.split(' ');
      return m === metodo && ruta.startsWith(prefijo);
    });
    if (!clave) throw new Error(`Petición sin respuesta en la prueba: ${metodo} ${ruta}`);
    const respuesta = typeof rutas[clave] === 'function' ? rutas[clave](ruta) : rutas[clave];
    const { estado = 200, cuerpo = respuesta } = respuesta?.estado ? respuesta : {};
    return new Response(JSON.stringify(cuerpo), { status: estado, headers: { 'Content-Type': 'application/json' } });
  });
  return peticiones;
}
