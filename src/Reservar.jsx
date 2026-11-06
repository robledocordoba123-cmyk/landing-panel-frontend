import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarCheck, Clock } from 'lucide-react';
import { api } from './api';
import { Arco } from './Mascota';
import { DIAS_MAXIMOS, fechaHoy, fechaLarga, hora, sumarDias, useHorarios } from './horarios';

const DATOS_VACIOS = { nombre: '', email: '', telefono: '', mascota: '', especie: 'Perro', notas: '' };
const ESPECIES = ['Perro', 'Gato', 'Ave', 'Conejo', 'Otro'];
const campo = 'mt-1 w-full rounded-xl border border-tinta-300 bg-white px-4 py-3 text-tinta-800 outline-none transition focus:border-pino-500 focus:ring-4 focus:ring-pino-100';
const peso = (n) => `$${n.toLocaleString('es-CO')}`;

function Pasos({ actual }) {
  const pasos = ['Servicio', 'Día y hora', 'Tus datos'];
  return (
    <ol className="mt-5 grid grid-cols-3 gap-2 text-xs font-semibold" aria-label="Pasos para reservar">
      {pasos.map((p, i) => (
        <li key={p} aria-current={i === actual ? 'step' : undefined}
          className={`rounded-lg px-2 py-2 text-center ${i === actual ? 'bg-pino-700 text-crema-50' : i < actual ? 'bg-pino-100 text-pino-700' : 'bg-crema-200 text-tinta-600'}`}>
          {i + 1}. {p}
        </li>
      ))}
    </ol>
  );
}

// Reserva en tres pasos: servicio, horario libre y datos de contacto.
function Reservar() {
  const [servicios, setServicios] = useState(null);
  const [errorServicios, setErrorServicios] = useState('');
  const [servicio, setServicio] = useState(null);
  const [fecha, setFecha] = useState(fechaHoy());
  const [inicio, setInicio] = useState(null);
  const [datos, setDatos] = useState(DATOS_VACIOS);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [reservada, setReservada] = useState(null);
  // Sube cuando alguien gana un horario, para traer otra vez los libres.
  const [version, setVersion] = useState(0);

  const { cargando, horarios, error: errorHorarios } = useHorarios(servicio?.id, fecha, version);

  useEffect(() => {
    let vigente = true;
    api('/api/servicios')
      .then((lista) => vigente && setServicios(lista.filter((s) => s.reservable)))
      .catch((err) => vigente && setErrorServicios(err.message));
    return () => {
      vigente = false;
    };
  }, []);

  const hoy = fechaHoy();
  const paso = !servicio ? 0 : !inicio ? 1 : 2;

  const cambiar = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });

  const reiniciar = () => {
    setServicio(null);
    setInicio(null);
    setFecha(fechaHoy());
    setDatos(DATOS_VACIOS);
    setReservada(null);
    setError('');
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      setReservada(await api('/api/citas', { metodo: 'POST', datos: { ...datos, servicioId: servicio.id, inicio } }));
    } catch (err) {
      setError(err.message);
      if (err.estado === 409) {
        setInicio(null);
        setVersion((v) => v + 1);
      }
    } finally {
      setEnviando(false);
    }
  };

  if (reservada) {
    return (
      <div className="mt-6 rounded-2xl bg-pino-50 p-6 text-center" role="status">
        <Arco especie={datos.especie} nombre={datos.mascota} className="mx-auto h-28 w-24" />
        <p className="mt-3 text-lg font-bold text-pino-800">¡Tu cita quedó reservada!</p>
        <p className="mt-1 font-semibold text-pino-800">{reservada.servicio}</p>
        <p className="text-pino-700 first-letter:uppercase">{fechaLarga(reservada.inicio)}, {hora(reservada.inicio)}</p>
        <p className="mt-2 text-sm text-pino-700">Te escribiremos al confirmarla. Guarda este enlace por si necesitas cancelarla o cambiarla:</p>
        <Link to={`/mi-cita/${reservada.token}`} className="mt-2 inline-block rounded-xl bg-pino-600 px-4 py-2 text-sm font-bold text-white hover:bg-pino-700">Ver mi cita</Link>
        <button type="button" onClick={reiniciar} className="mt-4 block w-full text-sm font-semibold text-pino-700 underline">Reservar otra cita</button>
      </div>
    );
  }

  return (
    <div>
      <Pasos actual={paso} />

      {paso === 0 && (
        <div className="mt-5">
          {errorServicios && <p className="text-sm font-medium text-red-600" role="alert">{errorServicios}</p>}
          {!servicios && !errorServicios && <p className="py-6 text-center text-tinta-500">Cargando servicios… Si la demo estaba en reposo, puede tardar hasta un minuto.</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            {servicios?.map((s) => (
              <button key={s.id} type="button" onClick={() => setServicio(s)}
                className="rounded-2xl bg-white p-4 text-left ring-1 ring-tinta-200 transition hover:ring-2 hover:ring-mandarina-500">
                <span className="block font-bold text-tinta-900">{s.nombre}</span>
                <span className="mt-1 flex items-center gap-1 text-sm text-tinta-500"><Clock size={14} /> {s.duracionMin} min · desde {peso(s.precioDesde)}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-tinta-500">¿Es una urgencia? Ven directamente: las urgencias se atienden sin cita.</p>
        </div>
      )}

      {paso === 1 && (
        <div className="mt-5">
          <button type="button" onClick={() => setServicio(null)} className="inline-flex items-center gap-1 text-sm font-semibold text-pino-700"><ArrowLeft size={14} /> {servicio.nombre}</button>
          <label className="mt-3 block text-sm font-semibold text-tinta-700">¿Qué día?
            <input type="date" value={fecha} min={hoy} max={sumarDias(hoy, DIAS_MAXIMOS)} onChange={(e) => setFecha(e.target.value)} className={campo} />
          </label>
          {error && <p className="mt-3 text-sm font-medium text-red-600" role="alert">{error}</p>}
          {errorHorarios && <p className="mt-3 text-sm font-medium text-red-600" role="alert">{errorHorarios}</p>}
          {cargando && <p className="py-6 text-center text-tinta-500">Buscando horarios libres…</p>}
          {!cargando && !errorHorarios && horarios.length === 0 && (
            <p className="mt-4 rounded-xl border border-dashed border-tinta-300 px-4 py-6 text-center text-tinta-500">No quedan horarios libres ese día. Prueba con otro.</p>
          )}
          {!cargando && horarios.length > 0 && (
            <>
              <p className="mt-4 text-sm font-semibold text-tinta-700">Horarios libres</p>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {horarios.map((h) => (
                  <button key={h.inicio} type="button" onClick={() => { setError(''); setInicio(h.inicio); }}
                    className="rounded-xl border border-tinta-200 px-2 py-2 text-sm font-semibold text-tinta-700 transition hover:border-pino-500 hover:bg-pino-50">
                    {h.hora}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {paso === 2 && (
        <form onSubmit={enviar} className="mt-5 grid gap-4 sm:grid-cols-2">
          <button type="button" onClick={() => setInicio(null)} className="inline-flex items-center gap-1 text-sm font-semibold text-pino-700 sm:col-span-2">
            <ArrowLeft size={14} /> <span className="first-letter:uppercase">{servicio.nombre}: {fechaLarga(inicio)}, {hora(inicio)}</span>
          </button>
          <label className="text-sm font-semibold text-tinta-700">Tu nombre
            <input name="nombre" value={datos.nombre} onChange={cambiar} required minLength={2} maxLength={80} autoComplete="name" className={campo} />
          </label>
          <label className="text-sm font-semibold text-tinta-700">Teléfono
            <input type="tel" name="telefono" value={datos.telefono} onChange={cambiar} required autoComplete="tel" className={campo} />
          </label>
          <label className="text-sm font-semibold text-tinta-700">Correo
            <input type="email" name="email" value={datos.email} onChange={cambiar} required autoComplete="email" className={campo} />
          </label>
          <label className="text-sm font-semibold text-tinta-700">Nombre de tu mascota
            <input name="mascota" value={datos.mascota} onChange={cambiar} required maxLength={60} className={campo} />
          </label>
          <label className="text-sm font-semibold text-tinta-700">¿Qué animal es?
            <select name="especie" value={datos.especie} onChange={cambiar} className={campo}>
              {ESPECIES.map((e) => <option key={e}>{e}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-tinta-700 sm:col-span-2">¿Algo que debamos saber? <span className="font-normal text-tinta-400">(opcional)</span>
            <textarea name="notas" value={datos.notas} onChange={cambiar} maxLength={500} rows={3} className={campo} />
          </label>
          {error && <p className="text-sm font-medium text-red-600 sm:col-span-2" role="alert">{error}</p>}
          <button type="submit" disabled={enviando}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-pino-600 py-3 font-bold text-white transition hover:bg-pino-700 disabled:opacity-60 sm:col-span-2">
            <CalendarCheck size={18} /> {enviando ? 'Reservando…' : 'Reservar cita'}
          </button>
        </form>
      )}
    </div>
  );
}

export default Reservar;
