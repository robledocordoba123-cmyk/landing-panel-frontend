import { useEffect, useState } from 'react';
import { api } from './api';

// La fecha de hoy en Colombia, aunque el navegador esté en otra zona horaria.
export const fechaHoy = () => new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
export const sumarDias = (fecha, dias) => new Date(new Date(`${fecha}T00:00:00Z`).getTime() + dias * 86400000).toISOString().slice(0, 10);
export const fechaLarga = (inicio) => new Date(inicio).toLocaleDateString('es-CO', { timeZone: 'America/Bogota', weekday: 'long', day: 'numeric', month: 'long' });
export const hora = (inicio) => new Date(inicio).toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: 'numeric', minute: '2-digit' });

export const DIAS_MAXIMOS = 60;

// Lista de horarios libres de un día. Cada consulta nueva vuelve a pedir la
// lista; la respuesta que llegue tarde de una consulta anterior se ignora.
export function useHorarios(servicioId, fecha, version) {
  const [resultado, setResultado] = useState({ clave: null, horarios: [], error: '' });
  const clave = servicioId && fecha ? `${servicioId}|${fecha}|${version}` : null;

  useEffect(() => {
    if (!clave) return undefined;
    let vigente = true;
    api(`/api/disponibilidad?servicioId=${servicioId}&fecha=${fecha}`)
      .then((d) => vigente && setResultado({ clave, horarios: d.horarios, error: '' }))
      .catch((err) => vigente && setResultado({ clave, horarios: [], error: err.message }));
    return () => {
      vigente = false;
    };
  }, [clave, servicioId, fecha]);

  const listo = resultado.clave === clave;
  return { cargando: Boolean(clave) && !listo, horarios: listo ? resultado.horarios : [], error: listo ? resultado.error : '' };
}
