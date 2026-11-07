import { useEffect, useState } from 'react';
import { api } from './api';
import { lunesDe, sumarDias } from './horarios';

// Borde de color por estado; el estado también va escrito para no depender del color.
const ESTADOS = {
  PENDIENTE: { texto: 'Pendiente', borde: 'border-mantequilla' },
  CONFIRMADA: { texto: 'Confirmada', borde: 'border-menta' },
  ATENDIDA: { texto: 'Atendida', borde: 'border-green-600' },
  NO_ASISTIO: { texto: 'No asistió', borde: 'border-red-500' },
  CANCELADA: { texto: 'Cancelada', borde: 'border-tinta-300' },
};

const hora = (inicio) => new Date(inicio).toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: 'numeric', minute: '2-digit' });
const cabecera = (fecha) => new Date(`${fecha}T12:00:00Z`).toLocaleDateString('es-CO', { timeZone: 'UTC', weekday: 'short', day: 'numeric' });

// Vista de la semana (lunes a domingo). Tocar un día abre su agenda completa.
function AgendaSemana({ fecha, hoy, alElegirDia, alCaducarSesion }) {
  const lunes = lunesDe(fecha);
  const [respuesta, setRespuesta] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    api(`/api/citas?desde=${lunes}&hasta=${sumarDias(lunes, 6)}`)
      .then((d) => {
        if (!vigente) return;
        setRespuesta(d);
        setError('');
      })
      .catch((err) => {
        if (!vigente) return;
        if (err.estado === 401) alCaducarSesion();
        else setError(err.message);
      });
    return () => {
      vigente = false;
    };
  }, [lunes, alCaducarSesion]);

  const citas = respuesta?.desde === lunes ? respuesta.citas : null;
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
  const delDia = (dia) => citas?.filter((c) => new Date(new Date(c.inicio).getTime() - 5 * 3600000).toISOString().slice(0, 10) === dia) ?? [];

  if (error) return <p className="mt-4 text-red-600" role="alert">{error}</p>;
  if (!citas) return <p className="py-10 text-center text-tinta-400">Cargando…</p>;

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-7 lg:gap-2">
      {dias.map((dia) => {
        const lista = delDia(dia);
        const activas = lista.filter((c) => c.estado !== 'CANCELADA').length;
        return (
          <section key={dia} className={`flex min-w-0 flex-col rounded-2xl p-2 ${dia === hoy ? 'bg-pino-50 ring-2 ring-pino-500' : 'bg-white'}`} aria-label={cabecera(dia)}>
            <button type="button" onClick={() => alElegirDia(dia)} className="rounded-xl px-2 py-1.5 text-left hover:bg-crema-100">
              <span className="block font-display text-sm font-bold capitalize text-tinta-900">{cabecera(dia)}</span>
              <span className="text-xs text-tinta-500">{activas} {activas === 1 ? 'cita' : 'citas'}</span>
            </button>
            <ul className="mt-1 space-y-1.5">
              {lista.map((c) => (
                <li key={c.id}>
                  <button type="button" onClick={() => alElegirDia(dia)} title={`${ESTADOS[c.estado].texto}: ${c.mascota.nombre}, ${c.servicio.nombre}`}
                    className={`w-full rounded-lg border-l-4 px-2 py-1.5 text-left text-xs hover:bg-crema-100 ${ESTADOS[c.estado].borde} ${c.estado === 'CANCELADA' ? 'bg-white line-through' : 'bg-crema-50'}`}>
                    <span className="block font-bold text-tinta-900">{hora(c.inicio)}</span>
                    <span className="block truncate text-tinta-700">{c.mascota.nombre} · {c.servicio.nombre}</span>
                    <span className="sr-only">{ESTADOS[c.estado].texto}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export default AgendaSemana;
