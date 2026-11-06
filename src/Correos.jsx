import { useEffect, useState } from 'react';
import { BellRing, Mail } from 'lucide-react';
import { api } from './api';

const TIPOS = { RESERVA: 'Reserva recibida', CONFIRMADA: 'Cita confirmada', REPROGRAMADA: 'Cita cambiada', RECORDATORIO: 'Recordatorio', CANCELADA: 'Cita cancelada' };
const ESTADOS = {
  ENVIADA: { texto: 'Enviado', clase: 'bg-green-100 text-green-800' },
  SIMULADA: { texto: 'Simulado', clase: 'bg-stone-100 text-stone-600' },
  FALLIDA: { texto: 'Falló', clase: 'bg-red-100 text-red-800' },
};
const fechaHora = (f) => new Date(f).toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'medium', timeStyle: 'short' });

// Registro de los correos a clientes y botón para los recordatorios de mañana.
function Correos({ token, alCaducarSesion }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    api('/api/notificaciones', { token })
      .then((d) => vigente && setDatos(d))
      .catch((err) => {
        if (!vigente) return;
        if (err.estado === 401) alCaducarSesion();
        else setError(err.message);
      });
    return () => {
      vigente = false;
    };
  }, [token, version, alCaducarSesion]);

  const enviarRecordatorios = async () => {
    setEnviando(true);
    setError('');
    setResultado('');
    try {
      const r = await api('/api/recordatorios', { metodo: 'POST', token });
      setResultado(r.revisadas ? `Listo: ${r.revisadas - r.fallidas} de ${r.revisadas} recordatorios procesados.` : 'No hay recordatorios pendientes para mañana.');
      setVersion((v) => v + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">Correos</h1>
          <p className="text-stone-600">Los avisos que reciben tus clientes sobre sus citas.</p>
        </div>
        <button type="button" onClick={enviarRecordatorios} disabled={enviando} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60">
          <BellRing size={16} /> {enviando ? 'Enviando…' : 'Enviar recordatorios de mañana'}
        </button>
      </div>

      {datos && !datos.envioReal && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Modo demostración: los correos quedan registrados aquí, pero no salen. Así nadie puede usar esta demo pública para escribirle a otra persona.
        </p>
      )}
      {resultado && <p className="mt-4 rounded-xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800" role="status">{resultado}</p>}
      {error && <p className="mt-4 text-red-600" role="alert">{error}</p>}

      <div className="mt-5 space-y-2">
        {!datos && !error && <p className="py-10 text-center text-stone-400">Cargando…</p>}
        {datos?.notificaciones.length === 0 && <p className="rounded-2xl border border-dashed border-stone-300 py-10 text-center text-stone-500">Todavía no hay correos.</p>}
        {datos?.notificaciones.map((n) => (
          <article key={n.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white p-4 shadow-sm">
            <div>
              <p className="flex items-center gap-2 font-bold text-stone-900"><Mail size={15} className="text-teal-600" /> {TIPOS[n.tipo]} <span className="font-normal text-stone-500">· {n.cita.mascota.nombre}</span></p>
              <p className="text-sm text-stone-500">{n.destinatario} · {fechaHora(n.creadoEn)}</p>
              {n.detalle && <p className="text-sm text-red-600">{n.detalle}</p>}
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${ESTADOS[n.estado].clase}`}>{ESTADOS[n.estado].texto}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Correos;
