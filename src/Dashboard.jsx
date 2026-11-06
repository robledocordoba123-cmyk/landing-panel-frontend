import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Inbox, CheckCircle2, Mail, Phone, RotateCcw, Clock, MessageCircle, Globe, CalendarDays, Users, Send } from 'lucide-react';
import { api } from './api';
import Agenda from './Agenda';
import { Marca } from './Marca';
import { Arco } from './Mascota';
import Clientes from './Clientes';
import Correos from './Correos';
import FichaMascota from './FichaMascota';

const SECCIONES = [
  { valor: 'agenda', texto: 'Agenda', icono: CalendarDays },
  { valor: 'clientes', texto: 'Clientes', icono: Users },
  { valor: 'mensajes', texto: 'Mensajes', icono: Inbox },
  { valor: 'correos', texto: 'Correos', icono: Send },
];

const FILTROS = [
  { valor: '', texto: 'Todas' },
  { valor: 'NUEVO', texto: 'Por atender' },
  { valor: 'ATENDIDO', texto: 'Atendidas' },
];

const fecha = (f) => new Date(f).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

// Panel del negocio: la agenda de citas y los mensajes que llegan desde la
// página y por WhatsApp (preguntas, urgencias y pedidos de hablar con alguien).
function Dashboard() {
  const [seccion, setSeccion] = useState('agenda');
  const [mascotaAbierta, setMascotaAbierta] = useState(null);
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

  const irA = (nueva) => {
    setMascotaAbierta(null);
    setSeccion(nueva);
  };

  return (
    <div className="min-h-screen bg-crema-100 lg:grid lg:grid-cols-[15rem_1fr] print:block print:bg-white">
      <aside className="relative overflow-hidden bg-pino-700 text-crema-50 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col print:hidden">
        <div className="flex items-center justify-between px-5 py-4 lg:py-6">
          <Marca claro />
          <button onClick={salir} className="inline-flex items-center gap-1 rounded-lg p-2 text-sm font-semibold text-pino-200 hover:text-white lg:hidden" aria-label="Cerrar sesión"><LogOut size={18} /></button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] lg:flex-col lg:px-3" aria-label="Secciones del panel">
          {SECCIONES.map(({ valor, texto, icono: Icono }) => (
            <button key={valor} type="button" onClick={() => irA(valor)} aria-current={seccion === valor ? 'page' : undefined}
              className={`inline-flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition ${seccion === valor ? 'bg-crema-50 text-pino-700' : 'text-pino-200 hover:bg-pino-600 hover:text-white'}`}>
              <Icono size={18} /> {texto}
              {valor === 'mensajes' && resumen.NUEVO > 0 && <span className="ml-auto rounded-full bg-mandarina-500 px-2 text-xs text-tinta-900">{resumen.NUEVO}</span>}
            </button>
          ))}
        </nav>
        <div className="mt-auto hidden lg:block">
          <button onClick={salir} className="mx-3 mb-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-pino-200 hover:text-white"><LogOut size={16} /> Cerrar sesión</button>
          <div className="asomarse flex items-end gap-2 px-5" aria-hidden="true">
            <Arco especie="Gato" nombre="Misha" fondo="bg-lila" className="h-24 w-20" />
            <Arco especie="Perro" nombre="Toby" fondo="bg-mantequilla" className="h-32 w-24" />
          </div>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-4xl px-5 py-8 lg:px-10 lg:py-10 print:max-w-none print:p-0">
        {mascotaAbierta && <FichaMascota token={token} mascotaId={mascotaAbierta} alVolver={() => setMascotaAbierta(null)} alCaducarSesion={salir} />}
        {!mascotaAbierta && seccion === 'agenda' && <Agenda token={token} alAbrirMascota={setMascotaAbierta} alCaducarSesion={salir} />}
        {!mascotaAbierta && seccion === 'clientes' && <Clientes token={token} alAbrirMascota={setMascotaAbierta} alCaducarSesion={salir} />}
        {!mascotaAbierta && seccion === 'correos' && <Correos token={token} alCaducarSesion={salir} />}
        {!mascotaAbierta && seccion === 'mensajes' && (
        <>
        <h1 className="text-4xl font-extrabold text-pino-700">Mensajes</h1>
        <p className="text-tinta-600">Preguntas, urgencias y pedidos de atención que llegan desde la página y por WhatsApp.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl bg-white p-5">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-mantequilla text-tinta-900"><Inbox size={22} /></span>
            <div><p className="text-3xl font-extrabold">{resumen.NUEVO}</p><p className="text-sm text-tinta-500">Por atender</p></div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white p-5">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-menta text-tinta-900"><CheckCircle2 size={22} /></span>
            <div><p className="text-3xl font-extrabold">{resumen.ATENDIDO}</p><p className="text-sm text-tinta-500">Atendidas</p></div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar mensajes">
          {FILTROS.map((f) => (
            <button key={f.valor} onClick={() => setFiltro(f.valor)} aria-pressed={filtro === f.valor}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${filtro === f.valor ? 'bg-pino-600 text-white' : 'bg-white text-tinta-600 hover:bg-tinta-100'}`}>
              {f.texto}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-red-600" role="alert">{error}</p>}

        <div className="mt-4 space-y-3">
          {!datos ? (
            <p className="py-10 text-center text-tinta-400">Cargando…</p>
          ) : datos.mensajes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-tinta-300 py-10 text-center text-tinta-500">No hay mensajes aquí.</p>
          ) : (
            datos.mensajes.map((m) => (
              <article key={m.id} className={`rounded-2xl bg-white p-5 ${m.estado === 'NUEVO' ? 'border-l-4 border-mandarina-500' : 'opacity-80'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-tinta-900">{m.nombre}{m.mascota && <span className="font-normal text-tinta-500"> · {m.mascota}</span>}</h2>
                    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-tinta-500">
                      {!m.email.endsWith("@whatsapp") && <span className="inline-flex items-center gap-1"><Mail size={14} /> {m.email}</span>}
                      {m.telefono && <span className="inline-flex items-center gap-1"><Phone size={14} /> {m.telefono}</span>}
                      <span className="inline-flex items-center gap-1"><Clock size={14} /> {fecha(m.creadoEn)}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.origen === 'WHATSAPP' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700"><MessageCircle size={12} /> WhatsApp</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-tinta-100 px-3 py-1 text-xs font-bold text-tinta-600"><Globe size={12} /> Página web</span>
                    )}
                    {m.servicio && <span className="rounded-full bg-pino-50 px-3 py-1 text-xs font-bold text-pino-700">{m.servicio}</span>}
                  </div>
                </div>
                <p className="mt-3 text-tinta-700">{m.mensaje}</p>
                <div className="mt-4">
                  {m.estado === 'NUEVO' ? (
                    <button onClick={() => cambiarEstado(m.id, 'ATENDIDO')} className="inline-flex items-center gap-1 rounded-xl bg-pino-600 px-4 py-2 text-sm font-bold text-white hover:bg-pino-700">
                      <CheckCircle2 size={16} /> Marcar como atendida
                    </button>
                  ) : (
                    <button onClick={() => cambiarEstado(m.id, 'NUEVO')} className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-tinta-500 hover:bg-tinta-100">
                      <RotateCcw size={14} /> Atendida el {fecha(m.atendidoEn)} · deshacer
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
        </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
