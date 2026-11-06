import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, CalendarX, PawPrint } from 'lucide-react';
import { api } from './api';
import { DIAS_MAXIMOS, fechaHoy, fechaLarga, hora, sumarDias, useHorarios } from './horarios';

const ESTADOS = {
  PENDIENTE: { texto: 'Pendiente de confirmar', clase: 'bg-amber-100 text-amber-800' },
  CONFIRMADA: { texto: 'Confirmada', clase: 'bg-teal-100 text-teal-800' },
  ATENDIDA: { texto: 'Atendida', clase: 'bg-green-100 text-green-800' },
  NO_ASISTIO: { texto: 'No asistió', clase: 'bg-red-100 text-red-800' },
  CANCELADA: { texto: 'Cancelada', clase: 'bg-stone-200 text-stone-600' },
};

const campo = 'mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-800 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100';

function CambiarFecha({ token, cita, alCambiar, alCerrar }) {
  const [fecha, setFecha] = useState(fechaHoy());
  const [version, setVersion] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const { cargando, horarios, error: errorHorarios } = useHorarios(cita.servicioId, fecha, version);
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
    <div className="mt-5 border-t border-stone-200 pt-5">
      <label className="block text-sm font-semibold text-stone-700">¿Qué día prefieres?
        <input type="date" value={fecha} min={hoy} max={sumarDias(hoy, DIAS_MAXIMOS)} onChange={(e) => setFecha(e.target.value)} className={campo} />
      </label>
      {(error || errorHorarios) && <p className="mt-3 text-sm font-medium text-red-600" role="alert">{error || errorHorarios}</p>}
      {cargando && <p className="py-4 text-center text-stone-500">Buscando horarios libres…</p>}
      {!cargando && !errorHorarios && horarios.length === 0 && <p className="mt-3 text-stone-500">No quedan horarios libres ese día. Prueba con otro.</p>}
      {!cargando && horarios.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {horarios.map((h) => (
            <button key={h.inicio} type="button" disabled={enviando} onClick={() => cambiar(h.inicio)}
              className="rounded-xl border border-stone-200 px-2 py-2 text-sm font-semibold text-stone-700 transition hover:border-teal-500 hover:bg-teal-50 disabled:opacity-50">
              {h.hora}
            </button>
          ))}
        </div>
      )}
      <button type="button" onClick={alCerrar} className="mt-4 text-sm font-semibold text-stone-600 underline">Dejar la cita como está</button>
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
    <div className="grid min-h-screen place-items-center bg-stone-50 px-5 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"><ArrowLeft size={14} /> Ir a la página</Link>
        <main className="rounded-3xl bg-white p-6 shadow-xl shadow-stone-200 md:p-8">
          <p className="flex items-center gap-2 text-lg font-extrabold text-teal-700">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 text-white"><PawPrint size={20} /></span>
            Mi cita
          </p>
          {!cita && !error && <p className="py-8 text-center text-stone-500">Cargando… Si la demo estaba en reposo, puede tardar hasta un minuto.</p>}
          {error && <p className="mt-4 text-sm font-medium text-red-600" role="alert">{error}</p>}
          {cita && (
            <>
              <span className={`mt-5 inline-block rounded-full px-3 py-1 text-xs font-bold ${estado.clase}`}>{estado.texto}</span>
              <h1 className="mt-3 text-2xl font-extrabold text-stone-900">{cita.servicio}</h1>
              <p className="text-stone-600">Para {cita.mascota}</p>
              <p className="mt-2 font-semibold text-stone-800 first-letter:uppercase">{fechaLarga(cita.inicio)}, {hora(cita.inicio)}</p>

              {cita.sePuedeGestionar && !modo && (
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  <button type="button" onClick={() => setModo('cambiar')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-bold text-white hover:bg-teal-700"><CalendarClock size={18} /> Cambiar fecha</button>
                  <button type="button" onClick={() => setModo('cancelar')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-100 py-3 font-bold text-stone-700 hover:bg-stone-200"><CalendarX size={18} /> Cancelar cita</button>
                </div>
              )}

              {modo === 'cambiar' && <CambiarFecha token={token} cita={cita} alCambiar={actualizar} alCerrar={() => setModo(null)} />}

              {modo === 'cancelar' && (
                <div className="mt-5 rounded-xl bg-red-50 p-4">
                  <p className="font-semibold text-red-800">¿Seguro que quieres cancelar esta cita?</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" disabled={enviando} onClick={cancelar} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">{enviando ? 'Cancelando…' : 'Sí, cancelar'}</button>
                    <button type="button" onClick={() => setModo(null)} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-stone-700">No, conservarla</button>
                  </div>
                </div>
              )}

              {!cita.sePuedeGestionar && cita.estado !== 'CANCELADA' && ['PENDIENTE', 'CONFIRMADA'].includes(cita.estado) && (
                <p className="mt-5 text-sm text-stone-600">Falta poco para tu cita: para cambiarla, llámanos.</p>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default MiCita;
