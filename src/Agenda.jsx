import { useEffect, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Globe, Mail, MessageCircle, Phone } from 'lucide-react';
import { api } from './api';

const ESTADOS = {
  PENDIENTE: { texto: 'Pendiente', clase: 'bg-amber-100 text-amber-800' },
  CONFIRMADA: { texto: 'Confirmada', clase: 'bg-teal-100 text-teal-800' },
  ATENDIDA: { texto: 'Atendida', clase: 'bg-green-100 text-green-800' },
  NO_ASISTIO: { texto: 'No asistió', clase: 'bg-red-100 text-red-800' },
  CANCELADA: { texto: 'Cancelada', clase: 'bg-stone-200 text-stone-600' },
};

// Botones según el estado. "yaEmpezo" evita ofrecer lo que la API rechazaría.
function acciones(estado, yaEmpezo) {
  if (estado === 'PENDIENTE') return [{ estado: 'CONFIRMADA', texto: 'Confirmar', principal: true }, { estado: 'CANCELADA', texto: 'Cancelar' }];
  if (estado !== 'CONFIRMADA') return [];
  if (!yaEmpezo) return [{ estado: 'CANCELADA', texto: 'Cancelar' }];
  return [{ estado: 'ATENDIDA', texto: 'Marcar atendida', principal: true }, { estado: 'NO_ASISTIO', texto: 'No asistió' }, { estado: 'CANCELADA', texto: 'Cancelar' }];
}

const fechaHoy = () => new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
const sumarDias = (fecha, dias) => new Date(new Date(`${fecha}T00:00:00Z`).getTime() + dias * 86400000).toISOString().slice(0, 10);
const fechaLarga = (fecha) => new Date(`${fecha}T12:00:00-05:00`).toLocaleDateString('es-CO', { timeZone: 'America/Bogota', weekday: 'long', day: 'numeric', month: 'long' });
const hora = (inicio) => new Date(inicio).toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: 'numeric', minute: '2-digit' });

// Citas de un día, con los cambios de estado que permite cada una.
function Agenda({ token, alCaducarSesion }) {
  const [fecha, setFecha] = useState(fechaHoy());
  const [respuesta, setRespuesta] = useState(null);
  const [error, setError] = useState('');
  const [ocupada, setOcupada] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    api(`/api/citas?desde=${fecha}`, { token })
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
  }, [fecha, version, token, alCaducarSesion]);

  const cambiarEstado = async (id, estado) => {
    setOcupada(id);
    setError('');
    try {
      await api(`/api/citas/${id}/estado`, { metodo: 'PATCH', datos: { estado }, token });
    } catch (err) {
      if (err.estado === 401) return alCaducarSesion();
      setError(err.message);
    } finally {
      setOcupada(null);
      // También tras un error: otra persona pudo cambiar la cita.
      setVersion((v) => v + 1);
    }
  };

  const citas = respuesta?.desde === fecha ? respuesta.citas : null;
  const activas = citas?.filter((c) => c.estado !== 'CANCELADA').length ?? 0;
  const ahora = new Date();

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">Agenda</h1>
          <p className="text-stone-600 first-letter:uppercase">{fechaLarga(fecha)}{citas && ` · ${activas} ${activas === 1 ? 'cita' : 'citas'}`}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setFecha(sumarDias(fecha, -1))} aria-label="Día anterior" className="grid h-10 w-10 place-items-center rounded-xl bg-white text-stone-600 hover:bg-stone-100"><ChevronLeft size={18} /></button>
          <button type="button" onClick={() => setFecha(fechaHoy())} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100">Hoy</button>
          <input type="date" value={fecha} onChange={(e) => e.target.value && setFecha(e.target.value)} aria-label="Elegir día" className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700" />
          <button type="button" onClick={() => setFecha(sumarDias(fecha, 1))} aria-label="Día siguiente" className="grid h-10 w-10 place-items-center rounded-xl bg-white text-stone-600 hover:bg-stone-100"><ChevronRight size={18} /></button>
        </div>
      </div>

      {error && <p className="mt-4 text-red-600" role="alert">{error}</p>}

      <div className="mt-5 space-y-3">
        {!citas && !error && <p className="py-10 text-center text-stone-400">Cargando…</p>}
        {citas?.length === 0 && (
          <p className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-stone-300 py-10 text-center text-stone-500">
            <CalendarDays size={24} /> No hay citas este día.
          </p>
        )}
        {citas?.map((c) => {
          const estado = ESTADOS[c.estado];
          return (
            <article key={c.id} className={`grid gap-3 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-[6rem_1fr] ${c.estado === 'CANCELADA' ? 'opacity-60' : ''}`}>
              <p className="font-extrabold text-teal-700">{hora(c.inicio)}<span className="block text-xs font-medium text-stone-400">{c.servicio.duracionMin} min</span></p>
              <div>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-bold text-stone-900">{c.mascota} <span className="font-normal text-stone-500">· {c.servicio.nombre}</span></h2>
                  <div className="flex flex-wrap gap-2">
                    {c.origen === 'WHATSAPP'
                      ? <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700"><MessageCircle size={12} /> WhatsApp</span>
                      : <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600"><Globe size={12} /> Página web</span>}
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${estado.clase}`}>{estado.texto}</span>
                  </div>
                </div>
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
                  <span>{c.nombre}</span>
                  {c.telefono && <span className="inline-flex items-center gap-1"><Phone size={14} /> {c.telefono}</span>}
                  <span className="inline-flex items-center gap-1"><Mail size={14} /> {c.email}</span>
                </p>
                {c.notas && <p className="mt-2 text-stone-700">{c.notas}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {acciones(c.estado, new Date(c.inicio) <= ahora).map((a) => (
                    <button key={a.estado} type="button" disabled={ocupada === c.id} onClick={() => cambiarEstado(c.id, a.estado)}
                      className={`rounded-xl px-3 py-1.5 text-sm font-bold transition disabled:opacity-50 ${a.principal ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}>
                      {a.texto}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Agenda;
