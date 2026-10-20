import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, LogOut, Inbox, CheckCircle2, Mail, Phone, RotateCcw, Clock, MessageCircle, Globe } from 'lucide-react';
import { api } from './api';

const FILTROS = [
  { valor: '', texto: 'Todas' },
  { valor: 'NUEVO', texto: 'Por atender' },
  { valor: 'ATENDIDO', texto: 'Atendidas' },
];

const fecha = (f) => new Date(f).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

// Panel del negocio: solicitudes de cita que llegan desde la página, con el
// conteo por estado y el botón para marcarlas como atendidas.
function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const salir = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  // Cambia cada vez que se marca una solicitud, para volver a cargar la lista.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    let vigente = true;
    api(`/api/mensajes${filtro ? `?estado=${filtro}` : ''}`, { token })
      .then((d) => {
        if (!vigente) return;
        setDatos(d);
        setError('');
      })
      .catch((err) => {
        if (!vigente) return;
        if (err.estado === 401) salir();
        else setError(err.message);
      });
    return () => {
      vigente = false;
    };
  }, [token, filtro, version, navigate, salir]);

  const cambiarEstado = async (id, estado) => {
    try {
      await api(`/api/mensajes/${id}`, { metodo: 'PATCH', datos: { estado }, token });
      setVersion((v) => v + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  const resumen = datos?.resumen || { NUEVO: 0, ATENDIDO: 0 };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <p className="flex items-center gap-2 text-lg font-extrabold text-teal-700">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 text-white"><PawPrint size={20} /></span>
            Panel de Huellitas
          </p>
          <button onClick={salir} className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        <h1 className="text-2xl font-extrabold text-stone-900">Solicitudes de cita</h1>
        <p className="text-stone-600">Lo que tus clientes envían desde la página y por WhatsApp.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-100 text-amber-600"><Inbox size={22} /></span>
            <div><p className="text-3xl font-extrabold">{resumen.NUEVO}</p><p className="text-sm text-stone-500">Por atender</p></div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 text-teal-600"><CheckCircle2 size={22} /></span>
            <div><p className="text-3xl font-extrabold">{resumen.ATENDIDO}</p><p className="text-sm text-stone-500">Atendidas</p></div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar solicitudes">
          {FILTROS.map((f) => (
            <button key={f.valor} onClick={() => setFiltro(f.valor)} aria-pressed={filtro === f.valor}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${filtro === f.valor ? 'bg-teal-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-100'}`}>
              {f.texto}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-red-600" role="alert">{error}</p>}

        <div className="mt-4 space-y-3">
          {!datos ? (
            <p className="py-10 text-center text-stone-400">Cargando…</p>
          ) : datos.mensajes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-stone-300 py-10 text-center text-stone-500">No hay solicitudes aquí.</p>
          ) : (
            datos.mensajes.map((m) => (
              <article key={m.id} className={`rounded-2xl bg-white p-5 shadow-sm ${m.estado === 'NUEVO' ? 'border-l-4 border-amber-400' : 'opacity-80'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-stone-900">{m.nombre}{m.mascota && <span className="font-normal text-stone-500"> · {m.mascota}</span>}</h2>
                    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
                      {!m.email.endsWith("@whatsapp") && <span className="inline-flex items-center gap-1"><Mail size={14} /> {m.email}</span>}
                      {m.telefono && <span className="inline-flex items-center gap-1"><Phone size={14} /> {m.telefono}</span>}
                      <span className="inline-flex items-center gap-1"><Clock size={14} /> {fecha(m.creadoEn)}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.origen === 'WHATSAPP' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700"><MessageCircle size={12} /> WhatsApp</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600"><Globe size={12} /> Página web</span>
                    )}
                    {m.servicio && <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">{m.servicio}</span>}
                  </div>
                </div>
                <p className="mt-3 text-stone-700">{m.mensaje}</p>
                <div className="mt-4">
                  {m.estado === 'NUEVO' ? (
                    <button onClick={() => cambiarEstado(m.id, 'ATENDIDO')} className="inline-flex items-center gap-1 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700">
                      <CheckCircle2 size={16} /> Marcar como atendida
                    </button>
                  ) : (
                    <button onClick={() => cambiarEstado(m.id, 'NUEVO')} className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-stone-500 hover:bg-stone-100">
                      <RotateCcw size={14} /> Atendida el {fecha(m.atendidoEn)} · deshacer
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
