import { useEffect, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Globe, Mail, MessageCircle, Phone } from 'lucide-react';
import { api } from './api';
import AtencionForm from './AtencionForm';
import AgendaSemana from './AgendaSemana';
import { lunesDe } from './horarios';
import { Arco } from './Mascota';

const ESTADOS = {
  PENDIENTE: { texto: 'Pendiente', clase: 'bg-mantequilla text-tinta-900' },
  CONFIRMADA: { texto: 'Confirmada', clase: 'bg-menta text-tinta-900' },
  ATENDIDA: { texto: 'Atendida', clase: 'bg-green-100 text-green-800' },
  NO_ASISTIO: { texto: 'No asistió', clase: 'bg-red-100 text-red-800' },
  CANCELADA: { texto: 'Cancelada', clase: 'bg-tinta-200 text-tinta-600' },
};

// Botones según el estado. "yaEmpezo" evita ofrecer lo que la API rechazaría.
function acciones(estado, yaEmpezo, clinica) {
  if (estado === 'PENDIENTE') return [{ estado: 'CONFIRMADA', texto: 'Confirmar', principal: true }, { estado: 'CANCELADA', texto: 'Cancelar' }];
  if (estado !== 'CONFIRMADA') return [];
  if (!yaEmpezo) return [{ estado: 'CANCELADA', texto: 'Cancelar' }];
  return [...(clinica ? [{ atender: true, estado: 'ATENDER', texto: 'Atender', principal: true }] : []), { estado: 'NO_ASISTIO', texto: 'No asistió' }, { estado: 'CANCELADA', texto: 'Cancelar' }];
}

const fechaHoy = () => new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
const sumarDias = (fecha, dias) => new Date(new Date(`${fecha}T00:00:00Z`).getTime() + dias * 86400000).toISOString().slice(0, 10);
const fechaLarga = (fecha) => new Date(`${fecha}T12:00:00-05:00`).toLocaleDateString('es-CO', { timeZone: 'America/Bogota', weekday: 'long', day: 'numeric', month: 'long' });
const hora = (inicio) => new Date(inicio).toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: 'numeric', minute: '2-digit' });

// Citas de un día, con los cambios de estado que permite cada una.
function Agenda({ usuario, alAbrirMascota, alCaducarSesion }) {
  const clinica = usuario.rol !== 'RECEPCION';
  const [fecha, setFecha] = useState(fechaHoy());
  const [respuesta, setRespuesta] = useState(null);
  const [error, setError] = useState('');
  const [ocupada, setOcupada] = useState(null);
  const [atendiendo, setAtendiendo] = useState(null);
  const [version, setVersion] = useState(0);
  const [vista, setVista] = useState('dia');

  useEffect(() => {
    if (vista !== 'dia') return undefined;
    let vigente = true;
    api(`/api/citas?desde=${fecha}`)
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
  }, [fecha, version, vista, alCaducarSesion]);

  const cambiarEstado = async (id, estado) => {
    setOcupada(id);
    setError('');
    try {
      await api(`/api/citas/${id}/estado`, { metodo: 'PATCH', datos: { estado } });
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
  const paso = vista === 'semana' ? 7 : 1;
  const lunes = lunesDe(fecha);
  const titulo = vista === 'semana'
    ? `Semana del ${new Date(`${lunes}T12:00:00Z`).toLocaleDateString('es-CO', { timeZone: 'UTC', day: 'numeric', month: 'long' })} al ${new Date(`${sumarDias(lunes, 6)}T12:00:00Z`).toLocaleDateString('es-CO', { timeZone: 'UTC', day: 'numeric', month: 'long' })}`
    : `${fechaLarga(fecha)}${citas ? ` · ${activas} ${activas === 1 ? 'cita' : 'citas'}` : ''}`;
  const abrirDia = (dia) => {
    setFecha(dia);
    setVista('dia');
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-extrabold text-pino-700">Agenda</h1>
          <p className="text-tinta-600 first-letter:uppercase">{titulo}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full bg-white p-1" role="group" aria-label="Vista">
            {[['dia', 'Día'], ['semana', 'Semana']].map(([valor, texto]) => (
              <button key={valor} type="button" onClick={() => setVista(valor)} aria-pressed={vista === valor}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${vista === valor ? 'bg-pino-600 text-white' : 'text-tinta-600 hover:bg-crema-100'}`}>{texto}</button>
            ))}
          </div>
          <button type="button" onClick={() => setFecha(sumarDias(fecha, -paso))} aria-label={vista === 'semana' ? 'Semana anterior' : 'Día anterior'} className="grid h-10 w-10 place-items-center rounded-full bg-white text-tinta-600 hover:bg-crema-200"><ChevronLeft size={18} /></button>
          <button type="button" onClick={() => setFecha(fechaHoy())} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-tinta-600 hover:bg-crema-200">Hoy</button>
          <input type="date" value={fecha} onChange={(e) => e.target.value && setFecha(e.target.value)} aria-label="Elegir día" className="rounded-xl border border-tinta-200 bg-white px-3 py-2 text-sm text-tinta-700" />
          <button type="button" onClick={() => setFecha(sumarDias(fecha, paso))} aria-label={vista === 'semana' ? 'Semana siguiente' : 'Día siguiente'} className="grid h-10 w-10 place-items-center rounded-full bg-white text-tinta-600 hover:bg-crema-200"><ChevronRight size={18} /></button>
        </div>
      </div>

      {vista === 'semana' && <AgendaSemana fecha={fecha} hoy={fechaHoy()} alElegirDia={abrirDia} alCaducarSesion={alCaducarSesion} />}

      {vista === 'dia' && error && <p className="mt-4 text-red-600" role="alert">{error}</p>}

      {vista === 'dia' && (
      <div className="mt-5 space-y-3">
        {!citas && !error && <p className="py-10 text-center text-tinta-400">Cargando…</p>}
        {citas?.length === 0 && (
          <p className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-tinta-300 py-10 text-center text-tinta-500">
            <CalendarDays size={24} /> No hay citas este día.
          </p>
        )}
        {citas?.map((c) => {
          const estado = ESTADOS[c.estado];
          return (
            <article key={c.id} className={`grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-2 rounded-3xl bg-white p-4 sm:grid-cols-[5.5rem_1fr] sm:p-5 ${c.estado === 'CANCELADA' ? 'opacity-60' : ''}`}>
              <button type="button" onClick={() => alAbrirMascota(c.mascota.id)} aria-label={`Abrir la ficha de ${c.mascota.nombre}`} className="self-start">
                <Arco especie={c.mascota.especie} nombre={c.mascota.nombre} className="h-20 w-full sm:h-24" />
              </button>
              <div>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-sm font-bold text-mandarina-700">{hora(c.inicio)} · {c.servicio.duracionMin} min</p>
                    <h2 className="text-xl font-bold text-tinta-900">
                      <button type="button" onClick={() => alAbrirMascota(c.mascota.id)} className="hover:underline">{c.mascota.nombre}</button>
                      {' '}<span className="font-sans text-base font-normal text-tinta-500">{c.servicio.nombre}</span>
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {c.origen === 'WHATSAPP'
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-tinta-500"><MessageCircle size={13} /> WhatsApp</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-semibold text-tinta-500"><Globe size={13} /> Web</span>}
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${estado.clase}`}>{estado.texto}</span>
                  </div>
                </div>
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-tinta-500">
                  <span>{c.mascota.cliente.nombre}</span>
                  {c.mascota.cliente.telefono && <span className="inline-flex items-center gap-1"><Phone size={14} /> {c.mascota.cliente.telefono}</span>}
                  <span className="inline-flex items-center gap-1"><Mail size={14} /> {c.mascota.cliente.email}</span>
                </p>
                {c.notas && <p className="mt-2 text-tinta-700">{c.notas}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {acciones(c.estado, new Date(c.inicio) <= ahora, clinica).map((a) => (
                    <button key={a.estado} type="button" disabled={ocupada === c.id} onClick={() => (a.atender ? setAtendiendo(c.id) : cambiarEstado(c.id, a.estado))}
                      className={`rounded-xl px-3 py-1.5 text-sm font-bold transition disabled:opacity-50 ${a.principal ? 'bg-pino-600 text-white hover:bg-pino-700' : 'bg-crema-100 text-tinta-700 hover:bg-crema-200'}`}>
                      {a.texto}
                    </button>
                  ))}
                </div>
                {atendiendo === c.id && (
                  <AtencionForm mascotaId={c.mascota.id} citaId={c.id} motivoInicial={c.servicio.nombre}
                    alGuardar={() => { setAtendiendo(null); setVersion((v) => v + 1); }} alCancelar={() => setAtendiendo(null)} />
                )}
              </div>
            </article>
          );
        })}
      </div>
      )}
    </section>
  );
}

export default Agenda;
