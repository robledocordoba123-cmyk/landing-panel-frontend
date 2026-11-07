import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, CalendarX } from 'lucide-react';
import { api } from './api';
import { Marca } from './Marca';
import { Arco } from './Mascota';
import { DIAS_MAXIMOS, fechaHoy, fechaLarga, hora, sumarDias, useHorarios } from './horarios';

const ESTADOS = {
  PENDIENTE: { texto: 'Pendiente de confirmar', clase: 'bg-mantequilla text-tinta-900' },
  CONFIRMADA: { texto: 'Confirmada', clase: 'bg-menta text-tinta-900' },
  ATENDIDA: { texto: 'Atendida', clase: 'bg-green-100 text-green-800' },
  NO_ASISTIO: { texto: 'No asistió', clase: 'bg-red-100 text-red-800' },
  CANCELADA: { texto: 'Cancelada', clase: 'bg-tinta-200 text-tinta-600' },
};

const campo = 'mt-1 w-full rounded-xl border border-tinta-300 bg-white px-4 py-3 text-tinta-800 outline-none focus:border-pino-500 focus:ring-4 focus:ring-pino-100';

function CambiarFecha({ token, cita, alCambiar, alCerrar }) {
  const [fecha, setFecha] = useState(fechaHoy());
  const [version, setVersion] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const { cargando, horarios, cerrado, error: errorHorarios } = useHorarios(cita.servicioId, fecha, version);
  const hoy = fechaHoy();

  const cambiar = async (inicio) => {
    setEnviando(true);
    setError('');
    try {
      alCambiar(await api(`/api/mi-cita/${token}/cambiar`, { metodo: 'POST', datos: { inicio } }));
    } catch (err) {
      setError(err.message);
      setVersion((v) => v + 1);
      setEnviando(false);
    }
  };

  return (
    <div className="mt-5 border-t border-tinta-200 pt-5">
      <label className="block text-sm font-semibold text-tinta-700">¿Qué día prefieres?
        <input type="date" value={fecha} min={hoy} max={sumarDias(hoy, DIAS_MAXIMOS)} onChange={(e) => setFecha(e.target.value)} className={campo} />
      </label>
      {(error || errorHorarios) && <p className="mt-3 text-sm font-medium text-red-600" role="alert">{error || errorHorarios}</p>}
      {cargando && <p className="py-4 text-center text-tinta-500">Buscando horarios libres…</p>}
      {!cargando && !errorHorarios && horarios.length === 0 && <p className="mt-3 text-tinta-500">{cerrado ? `Ese día estamos cerrados: ${cerrado}. Prueba con otro.` : 'No quedan horarios libres ese día. Prueba con otro.'}</p>}
      {!cargando && horarios.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {horarios.map((h) => (
            <button key={h.inicio} type="button" disabled={enviando} onClick={() => cambiar(h.inicio)}
              className="rounded-xl border border-tinta-200 px-2 py-2 text-sm font-semibold text-tinta-700 transition hover:border-pino-500 hover:bg-pino-50 disabled:opacity-50">
              {h.hora}
            </button>
          ))}
        </div>
      )}
      <button type="button" onClick={alCerrar} className="mt-4 text-sm font-semibold text-tinta-600 underline">Dejar la cita como está</button>
    </div>
  );
}

// Página a la que llega el cliente desde su correo o desde la reserva.
function MiCita() {
  const { token } = useParams();
  const [cita, setCita] = useState(null);
  const [error, setError] = useState('');
  const [modo, setModo] = useState(null); // 'cambiar' | 'cancelar'
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let vigente = true;
    api(`/api/mi-cita/${token}`)
      .then((d) => vigente && setCita(d))
      .catch((err) => vigente && setError(err.message));
    return () => {
      vigente = false;
    };
  }, [token]);

  const actualizar = useCallback((nueva) => {
    setCita(nueva);
    setModo(null);
  }, []);

  const cancelar = async () => {
    setEnviando(true);
    setError('');
    try {
      actualizar(await api(`/api/mi-cita/${token}/cancelar`, { metodo: 'POST' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const estado = cita && ESTADOS[cita.estado];

  return (
    <div className="grid min-h-screen place-items-center bg-crema-100 px-5 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-tinta-500 hover:text-tinta-800"><ArrowLeft size={14} /> Ir a la página</Link>
        <main className="rounded-[2rem] bg-crema-50 p-6 md:p-8">
          <Marca />
          {!cita && !error && <p className="py-8 text-center text-tinta-500">Cargando… Si la demo estaba en reposo, puede tardar hasta un minuto.</p>}
          {error && <p className="mt-4 text-sm font-medium text-red-600" role="alert">{error}</p>}
          {cita && (
            <>
              <div className="mt-5 flex items-center gap-4">
                <Arco especie={cita.especie} nombre={cita.mascota} className="h-24 w-20" />
                <div>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${estado.clase}`}>{estado.texto}</span>
                  <h1 className="mt-1 text-3xl font-extrabold text-pino-700">{cita.mascota}</h1>
                  <p className="text-tinta-600">{cita.servicio}</p>
                </div>
              </div>
              <p className="mt-2 font-semibold text-tinta-800 first-letter:uppercase">{fechaLarga(cita.inicio)}, {hora(cita.inicio)}</p>

              {cita.sePuedeGestionar && !modo && (
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  <button type="button" onClick={() => setModo('cambiar')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-pino-600 py-3 font-bold text-white hover:bg-pino-700"><CalendarClock size={18} /> Cambiar fecha</button>
                  <button type="button" onClick={() => setModo('cancelar')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-tinta-100 py-3 font-bold text-tinta-700 hover:bg-tinta-200"><CalendarX size={18} /> Cancelar cita</button>
                </div>
              )}

              {modo === 'cambiar' && <CambiarFecha token={token} cita={cita} alCambiar={actualizar} alCerrar={() => setModo(null)} />}

              {modo === 'cancelar' && (
                <div className="mt-5 rounded-xl bg-red-50 p-4">
                  <p className="font-semibold text-red-800">¿Seguro que quieres cancelar esta cita?</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" disabled={enviando} onClick={cancelar} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">{enviando ? 'Cancelando…' : 'Sí, cancelar'}</button>
                    <button type="button" onClick={() => setModo(null)} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-tinta-700">No, conservarla</button>
                  </div>
                </div>
              )}

              {!cita.sePuedeGestionar && cita.estado !== 'CANCELADA' && ['PENDIENTE', 'CONFIRMADA'].includes(cita.estado) && (
                <p className="mt-5 text-sm text-tinta-600">Falta poco para tu cita: para cambiarla, llámanos.</p>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default MiCita;
