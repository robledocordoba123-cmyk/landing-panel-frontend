import { useEffect, useState } from 'react';
import { CalendarX, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from './api';
import { fechaHoy } from './horarios';

const campo = 'mt-1 w-full rounded-xl border border-tinta-300 bg-white px-3 py-2 text-tinta-800 outline-none focus:border-pino-500 focus:ring-4 focus:ring-pino-100';
const boton = 'rounded-xl bg-pino-600 px-4 py-2 text-sm font-bold text-white hover:bg-pino-700 disabled:opacity-60';
const botonSuave = 'rounded-xl bg-crema-100 px-3 py-2 text-sm font-bold text-tinta-700 hover:bg-crema-200';
const pesos = (n) => `$${n.toLocaleString('es-CO')}`;
const LUGARES = { CONSULTORIO: 'Consultorio', PELUQUERIA: 'Peluquería' };
const NOMBRE_DIA = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo', 7: 'Festivos' };
const ORDEN_DIAS = [1, 2, 3, 4, 5, 6, 0, 7];
const DURACIONES = Array.from({ length: 16 }, (_, i) => (i + 1) * 15);
const MINUTOS = Array.from({ length: 49 }, (_, i) => i * 30);
const NUEVO = { nombre: '', detalle: '', precioDesde: 0, duracionMin: 30, recurso: 'CONSULTORIO', reservable: true, activo: true };

function textoHora(m) {
  const h = Math.floor(m / 60) % 24;
  return `${h % 12 || 12}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'a. m.' : 'p. m.'}`;
}
const fechaHora = (f) => new Date(f).toLocaleString('es-CO', { timeZone: 'America/Bogota', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
const fechaDia = (f) => new Date(`${f}T12:00:00-05:00`).toLocaleDateString('es-CO', { timeZone: 'America/Bogota', weekday: 'long', day: 'numeric', month: 'long' });

// Error de la API con la lista de citas que impiden el cambio.
function ErrorConCitas({ error }) {
  if (!error) return null;
  return (
    <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800" role="alert">
      <p className="font-semibold">{error.mensaje}</p>
      {error.conflictos?.length > 0 && (
        <ul className="mt-2 list-disc pl-5">
          {error.conflictos.map((c) => <li key={c.id}>{fechaHora(c.inicio)} · {c.mascota} · {c.servicio}</li>)}
        </ul>
      )}
    </div>
  );
}

const leerError = (err) => ({ mensaje: err.message, conflictos: err.cuerpo?.conflictos });

function FormularioServicio({ inicial, alGuardar, alCancelar }) {
  const [datos, setDatos] = useState(inicial);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const cambiar = (e) => {
    const { name, value, type, checked } = e.target;
    setDatos({ ...datos, [name]: type === 'checkbox' ? checked : ['precioDesde', 'duracionMin'].includes(name) ? Number(value) : value });
  };

  const guardar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    const { id, nombre, detalle, precioDesde, duracionMin, recurso, reservable, activo } = datos;
    try {
      await api(id ? `/api/servicios/${id}` : '/api/servicios', { metodo: id ? 'PATCH' : 'POST', datos: { nombre, detalle, precioDesde, duracionMin, recurso, reservable, activo } });
      alGuardar();
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={guardar} className="mt-3 grid gap-3 rounded-2xl bg-crema-50 p-4 sm:grid-cols-2">
      <label className="text-sm font-semibold text-tinta-700">Nombre
        <input name="nombre" value={datos.nombre} onChange={cambiar} required minLength={2} maxLength={60} className={campo} />
      </label>
      <label className="text-sm font-semibold text-tinta-700">Descripción corta
        <input name="detalle" value={datos.detalle} onChange={cambiar} required minLength={3} maxLength={120} className={campo} />
      </label>
      <label className="text-sm font-semibold text-tinta-700">Precio desde (COP)
        <input type="number" name="precioDesde" value={datos.precioDesde} onChange={cambiar} required min={0} max={10000000} step={1000} className={campo} />
      </label>
      <label className="text-sm font-semibold text-tinta-700">Duración
        <select name="duracionMin" value={datos.duracionMin} onChange={cambiar} className={campo}>
          {DURACIONES.map((d) => <option key={d} value={d}>{d} minutos</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold text-tinta-700">Dónde se atiende
        <select name="recurso" value={datos.recurso} onChange={cambiar} className={campo}>
          {Object.entries(LUGARES).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
        </select>
      </label>
      <div className="flex flex-col justify-end gap-2 text-sm text-tinta-700">
        <label className="flex items-center gap-2"><input type="checkbox" name="reservable" checked={datos.reservable} onChange={cambiar} className="h-4 w-4 accent-pino-600" /> Se reserva en línea</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="activo" checked={datos.activo} onChange={cambiar} className="h-4 w-4 accent-pino-600" /> Se ofrece (si no, se oculta de la página)</label>
      </div>
      {error && <p className="text-sm font-medium text-red-700 sm:col-span-2" role="alert">{error}</p>}
      <p className="text-sm text-tinta-500 sm:col-span-2">Cambiar la duración no mueve las citas ya reservadas.</p>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={enviando} className={boton}>{enviando ? 'Guardando…' : 'Guardar'}</button>
        <button type="button" onClick={alCancelar} className={botonSuave}>Cancelar</button>
      </div>
    </form>
  );
}

function Servicios({ alCaducarSesion }) {
  const [servicios, setServicios] = useState(null);
  const [editando, setEditando] = useState(null); // id, 'nuevo' o null
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    api('/api/servicios/todos')
      .then((d) => vigente && setServicios(d))
      .catch((err) => {
        if (!vigente) return;
        if (err.estado === 401) alCaducarSesion();
        else setError(err.message);
      });
    return () => {
      vigente = false;
    };
  }, [version, alCaducarSesion]);

  const guardado = () => {
    setEditando(null);
    setVersion((v) => v + 1);
  };

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-pino-700">Servicios y precios</h2>
          <p className="text-tinta-600">Lo que ven los clientes al reservar y el asistente de WhatsApp.</p>
        </div>
        <button type="button" onClick={() => setEditando('nuevo')} className={`${boton} inline-flex items-center gap-2`}><Plus size={16} /> Agregar</button>
      </div>
      {error && <p className="mt-3 text-red-700" role="alert">{error}</p>}
      {editando === 'nuevo' && <FormularioServicio inicial={NUEVO} alGuardar={guardado} alCancelar={() => setEditando(null)} />}
      <ul className="mt-4 divide-y divide-tinta-200 rounded-3xl bg-white px-5">
        {!servicios && !error && <li className="py-6 text-center text-tinta-400">Cargando…</li>}
        {servicios?.map((s) => (
          <li key={s.id} className="py-4">
            <div className={`flex flex-wrap items-start justify-between gap-3 ${s.activo ? '' : 'opacity-60'}`}>
              <div>
                <h3 className="font-bold text-tinta-900">
                  {s.nombre}
                  {!s.activo && <span className="ml-2 rounded-full bg-tinta-200 px-2 py-0.5 text-xs font-bold text-tinta-700">Oculto</span>}
                  {s.activo && !s.reservable && <span className="ml-2 rounded-full bg-mantequilla px-2 py-0.5 text-xs font-bold text-tinta-900">Sin cita en línea</span>}
                </h3>
                <p className="text-sm text-tinta-500">{s.detalle} · desde {pesos(s.precioDesde)} · {s.duracionMin} min · {LUGARES[s.recurso]} · {s._count.citas} {s._count.citas === 1 ? 'cita' : 'citas'}</p>
              </div>
              {editando !== s.id && (
                <button type="button" onClick={() => setEditando(s.id)} className={`${botonSuave} inline-flex items-center gap-1`}><Pencil size={14} /> Editar</button>
              )}
            </div>
            {editando === s.id && <FormularioServicio inicial={s} alGuardar={guardado} alCancelar={() => setEditando(null)} />}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Horario({ horario, alCambiar }) {
  const [jornadas, setJornadas] = useState(horario.jornadas);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [guardado, setGuardado] = useState(false);

  const cambiar = (dia, cambios) => {
    setGuardado(false);
    setJornadas(jornadas.map((j) => (j.dia === dia ? { ...j, ...cambios } : j)));
  };

  const guardar = async () => {
    setEnviando(true);
    setError(null);
    try {
      alCambiar(await api('/api/horario', { metodo: 'PUT', datos: { jornadas } }));
      setGuardado(true);
    } catch (err) {
      setError(leerError(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-extrabold text-pino-700">Horario de atención</h2>
      <p className="text-tinta-600">Define cuándo se pueden reservar citas. Los festivos de Colombia se calculan solos.</p>
      <div className="mt-4 rounded-3xl bg-white p-5">
        <div className="divide-y divide-tinta-100">
          {ORDEN_DIAS.map((dia) => {
            const j = jornadas.find((x) => x.dia === dia);
            return (
              <div key={dia} className="grid grid-cols-[6.5rem_1fr] items-center gap-3 py-2 sm:grid-cols-[7rem_7rem_1fr]">
                <span className="font-semibold text-tinta-900">{NOMBRE_DIA[dia]}</span>
                <label className="flex items-center gap-2 text-sm text-tinta-700">
                  <input type="checkbox" checked={j.abierto} onChange={(e) => cambiar(dia, { abierto: e.target.checked })} className="h-4 w-4 accent-pino-600" /> Abierto
                </label>
                <div className={`col-span-2 flex flex-wrap items-center gap-2 text-sm sm:col-span-1 ${j.abierto ? '' : 'invisible'}`}>
                  <label className="sr-only" htmlFor={`abre-${dia}`}>Abre el {NOMBRE_DIA[dia]}</label>
                  <select id={`abre-${dia}`} value={j.abre} onChange={(e) => cambiar(dia, { abre: Number(e.target.value) })} className="rounded-xl border border-tinta-300 bg-white px-2 py-1.5">
                    {MINUTOS.slice(0, -1).map((m) => <option key={m} value={m}>{textoHora(m)}</option>)}
                  </select>
                  a
                  <label className="sr-only" htmlFor={`cierra-${dia}`}>Cierra el {NOMBRE_DIA[dia]}</label>
                  <select id={`cierra-${dia}`} value={j.cierra} onChange={(e) => cambiar(dia, { cierra: Number(e.target.value) })} className="rounded-xl border border-tinta-300 bg-white px-2 py-1.5">
                    {MINUTOS.slice(1).map((m) => <option key={m} value={m}>{m === 1440 ? 'Medianoche' : textoHora(m)}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
        <ErrorConCitas error={error} />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={guardar} disabled={enviando} className={boton}>{enviando ? 'Guardando…' : 'Guardar horario'}</button>
          {guardado && <p className="text-sm text-pino-700" role="status">Guardado. Así lo ven los clientes: {horario.lineas.join(' · ')}</p>}
        </div>
      </div>
    </section>
  );
}

function DiasCerrados({ horario, alCambiar }) {
  const [fecha, setFecha] = useState('');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (peticion) => {
    setEnviando(true);
    setError(null);
    try {
      alCambiar(await peticion());
      return true;
    } catch (err) {
      setError(leerError(err));
      return false;
    } finally {
      setEnviando(false);
    }
  };

  const cerrar = async (e) => {
    e.preventDefault();
    if (await enviar(() => api('/api/cierres', { metodo: 'POST', datos: { fecha, motivo } }))) {
      setFecha('');
      setMotivo('');
    }
  };

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-extrabold text-pino-700">Días cerrados</h2>
      <p className="text-tinta-600">Vacaciones, inventario o capacitaciones. Ese día nadie puede reservar y el motivo se muestra al cliente.</p>
      <form onSubmit={cerrar} className="mt-4 grid gap-3 rounded-3xl bg-white p-5 sm:grid-cols-[11rem_1fr_auto] sm:items-end">
        <label className="text-sm font-semibold text-tinta-700">Fecha
          <input type="date" value={fecha} min={fechaHoy()} onChange={(e) => setFecha(e.target.value)} required className={campo} />
        </label>
        <label className="text-sm font-semibold text-tinta-700">Motivo
          <input value={motivo} onChange={(e) => setMotivo(e.target.value)} required minLength={3} maxLength={80} placeholder="Ej.: vacaciones del equipo" className={campo} />
        </label>
        <button type="submit" disabled={enviando} className={`${boton} inline-flex items-center justify-center gap-2 py-2.5`}><CalendarX size={16} /> Cerrar ese día</button>
      </form>
      <ErrorConCitas error={error} />
      <ul className="mt-3 space-y-2">
        {horario.cierres.length === 0 && <li className="text-sm text-tinta-500">No hay días cerrados programados.</li>}
        {horario.cierres.map((c) => (
          <li key={c.fecha} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
            <span><span className="font-semibold text-tinta-900 first-letter:uppercase">{fechaDia(c.fecha)}</span> <span className="text-tinta-500">· {c.motivo}</span></span>
            <button type="button" disabled={enviando} onClick={() => enviar(() => api(`/api/cierres/${c.fecha}`, { metodo: 'DELETE' }))} aria-label={`Abrir de nuevo el ${fechaDia(c.fecha)}`} className="rounded-lg p-2 text-tinta-500 hover:bg-crema-100 hover:text-red-700"><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Ajustes del negocio, solo para administración.
function Ajustes({ alCaducarSesion }) {
  const [horario, setHorario] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    api('/api/horario')
      .then((d) => vigente && setHorario(d))
      .catch((err) => vigente && setError(err.message));
    return () => {
      vigente = false;
    };
  }, []);

  return (
    <section>
      <h1 className="text-4xl font-extrabold text-pino-700">Ajustes del negocio</h1>
      <p className="text-tinta-600">Los cambios se aplican de una vez en la página, la reserva y el asistente de WhatsApp.</p>
      <Servicios alCaducarSesion={alCaducarSesion} />
      {error && <p className="mt-6 text-red-700" role="alert">{error}</p>}
      {horario && (
        <>
          <Horario horario={horario} alCambiar={setHorario} />
          <DiasCerrados horario={horario} alCambiar={setHorario} />
        </>
      )}
    </section>
  );
}

export default Ajustes;
