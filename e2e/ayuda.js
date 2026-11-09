// Primer día desde pasado mañana con horarios libres de consulta, según la API real.
// Así las pruebas no dependen de la hora en que corren (un domingo por la tarde, por
// ejemplo, ya no quedan horarios para hoy).
export async function diaConHorarios(request) {
  const servicios = await (await request.get('/api/servicios')).json();
  const consulta = servicios.find((s) => s.nombre === 'Consulta general');
  const hoy = new Date(Date.now() - 5 * 3600000);
  for (let i = 2; i < 30; i += 1) {
    const fecha = new Date(hoy.getTime() + i * 86400000).toISOString().slice(0, 10);
    const { horarios } = await (await request.get(`/api/disponibilidad?servicioId=${consulta.id}&fecha=${fecha}`)).json();
    if (horarios.length) return { fecha, hora: horarios[0].hora };
  }
  throw new Error('No hay horarios libres en el próximo mes');
}
