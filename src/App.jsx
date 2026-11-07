import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { CalendarCheck, CheckCircle2, ChevronDown, Clock, Lock, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { api } from './api';
import Login from './Login';
import Dashboard from './Dashboard';
import Asistente from './Asistente';
import Reservar from './Reservar';
import { Arco } from './Mascota';
import { Marca } from './Marca';
import MiCita from './MiCita';
import NoEncontrada from './NoEncontrada';
import Privacidad from './Privacidad';
import { useHorarioNegocio } from './horarios';

const SERVICIOS = [
  { titulo: 'Consulta general', texto: 'Revisión completa, diagnóstico y tratamiento para perros, gatos y otras mascotas.', especie: 'Gato', nombre: 'Misha', fondo: 'bg-lila' },
  { titulo: 'Vacunación', texto: 'Plan de vacunas y desparasitación al día, con aviso cuando toca la próxima dosis.', especie: 'Perro', nombre: 'Toby', fondo: 'bg-mantequilla' },
  { titulo: 'Peluquería', texto: 'Baño, corte y limpieza de oídos y uñas, con productos suaves para su piel.', especie: 'Conejo', nombre: 'Copito', fondo: 'bg-menta' },
  { titulo: 'Urgencias', texto: 'Atención prioritaria todos los días, sin cita. Si es grave, ven de una vez.', especie: 'Ave', nombre: 'Kiwi', fondo: 'bg-durazno' },
];

const PREGUNTAS = [
  { q: '¿Necesito pedir cita?', a: 'Para consulta, vacunación y peluquería sí, así no esperas. Las urgencias se atienden sin cita.' },
  { q: '¿Atienden animales distintos a perros y gatos?', a: 'Sí, también conejos, aves y otras mascotas pequeñas. Cuéntanos qué mascota tienes al reservar.' },
  { q: '¿Cómo confirmo mi cita?', a: 'Al reservar eliges el día y la hora, y te escribimos al confirmarla. Con el enlace de tu reserva puedes cancelarla o cambiarla hasta 2 horas antes.' },
  { q: '¿Qué medios de pago reciben?', a: 'Efectivo, tarjeta, Nequi y transferencia.' },
];

const VACIO = { nombre: '', email: '', mensaje: '', autorizaDatos: false };

// Mientras llega el horario real (la API puede estar despertando), se muestra el de siempre.
const HORARIO_INICIAL = ['Lunes a sábado: 8:00 a. m. – 7:00 p. m.', 'Domingos y festivos: 9:00 a. m. – 2:00 p. m.', 'Urgencias: todos los días'];

function Pregunta({ q, a }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <div className="border-b border-tinta-300">
      <button type="button" onClick={() => setAbierta(!abierta)} aria-expanded={abierta}
        className="flex w-full items-center justify-between gap-4 py-4 text-left font-semibold text-tinta-800">
        {q}
        <ChevronDown size={18} className={`shrink-0 text-mandarina-700 transition ${abierta ? 'rotate-180' : ''}`} />
      </button>
      {abierta && <p className="pb-4 text-tinta-600">{a}</p>}
    </div>
  );
}

function LandingPage() {
  const horario = useHorarioNegocio();
  const [form, setForm] = useState(VACIO);
  const [estado, setEstado] = useState('listo'); // listo | enviando | enviado
  const [error, setError] = useState('');

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setEstado('enviando');
    try {
      await api('/api/mensajes', { metodo: 'POST', datos: form });
      setEstado('enviado');
      setForm(VACIO);
    } catch (err) {
      setError(err.message);
      setEstado('listo');
    }
  };

  const campo = 'w-full rounded-xl border border-tinta-300 bg-white px-4 py-3 text-tinta-800 outline-none transition focus:border-pino-500 focus:ring-4 focus:ring-pino-100';

  return (
    <div className="min-h-screen bg-crema-100 text-tinta-800">
      <a href="#cita" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">Ir a reservar una cita</a>

      <header className="sticky top-0 z-20 bg-crema-100">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4" aria-label="Principal">
          <a href="#inicio" aria-label="Huellitas, ir al inicio"><Marca /></a>
          <div className="hidden items-center gap-8 text-sm font-semibold text-tinta-700 md:flex">
            <a href="#servicios" className="hover:text-mandarina-700">Servicios</a>
            <a href="#horarios" className="hover:text-mandarina-700">Horarios</a>
            <a href="#preguntas" className="hover:text-mandarina-700">Preguntas</a>
          </div>
          <a href="#cita" className="rounded-full bg-pino-700 px-5 py-2.5 text-sm font-bold text-crema-50 transition hover:bg-pino-600">
            Reservar cita
          </a>
        </nav>
      </header>

      {/* Inicio */}
      <section id="inicio" className="overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-end gap-10 px-5 pt-10 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[1.25fr_1fr] lg:gap-6 lg:pt-0">
          <div className="lg:self-center lg:pb-10">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-mandarina-700">Veterinaria en Medellín</p>
            <h1 className="mt-4 text-5xl font-extrabold leading-[0.98] text-pino-700 sm:text-6xl xl:text-7xl">
              Ellos te cuidan. Nosotros los cuidamos a ellos.
            </h1>
            <p className="mt-6 max-w-md text-lg text-tinta-600">Consultas, vacunas, peluquería y urgencias. Reservas en un minuto, sin llamar.</p>
            <a href="#cita" className="mt-8 inline-flex items-center gap-2 rounded-full bg-mandarina-500 px-7 py-4 font-bold text-tinta-900 transition hover:bg-mandarina-400">
              <CalendarCheck size={20} /> Elegir día y hora
            </a>
          </div>

          <div className="asomarse grid grid-cols-3 items-end gap-3" aria-hidden="true">
            <Arco especie="Gato" nombre="Misha" fondo="bg-lila" className="h-36 sm:h-52 lg:h-52" />
            <Arco especie="Perro" nombre="Toby" fondo="bg-mantequilla" className="h-48 sm:h-64 lg:h-72" />
            <Arco especie="Conejo" nombre="Copito" fondo="bg-menta" className="h-44 sm:h-56 lg:h-60" />
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="bg-pino-700 py-20 text-crema-50 md:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="max-w-2xl text-4xl font-extrabold leading-tight md:text-5xl">Lo que hacemos, bien hecho.</h2>
          <ul className="mt-12 divide-y divide-pino-500/40 border-y border-pino-500/40">
            {SERVICIOS.map(({ titulo, texto, especie, nombre, fondo }) => (
              <li key={titulo} className="grid items-center gap-4 py-6 md:grid-cols-[6rem_1fr_1.4fr]">
                <Arco especie={especie} nombre={nombre} fondo={fondo} className="h-20 w-20" />
                <h3 className="text-2xl font-bold">{titulo}</h3>
                <p className="text-pino-200">{texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Horarios y cita */}
      <section id="horarios" className="py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="text-4xl font-extrabold leading-tight text-pino-700">Cuándo y dónde</h2>
            <ul className="mt-8 space-y-5">
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mantequilla text-tinta-900"><Clock size={20} /></span>
                <dl>
                  {(horario || HORARIO_INICIAL).map((linea) => {
                    const [dias, horas] = linea.split(': ');
                    return (
                      <div key={linea} className="mb-1">
                        <dt className="font-bold">{dias}</dt>
                        <dd className="text-tinta-600 first-letter:uppercase">{horas}</dd>
                      </div>
                    );
                  })}
                </dl>
              </li>
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-lila text-tinta-900"><MapPin size={20} /></span>
                <div>
                  <p className="font-bold">Dirección</p>
                  <p className="text-tinta-600">Medellín, Antioquia (dirección de ejemplo)</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-menta text-tinta-900"><Phone size={20} /></span>
                <div>
                  <p className="font-bold">Teléfono</p>
                  <p className="text-tinta-600">Número de ejemplo en la demo</p>
                </div>
              </li>
            </ul>
          </div>

          <div id="cita" className="scroll-mt-24 rounded-[2rem] bg-crema-50 p-6 md:p-10 lg:col-span-3">
            <h2 className="text-3xl font-extrabold text-pino-700">Reserva tu cita</h2>
            <p className="mt-1 text-tinta-600">Elige el servicio, el día y la hora que te sirvan.</p>
            {/* En la demo pública cualquiera puede ver el panel: se pide no usar datos reales. */}
            {import.meta.env.VITE_MODO_DEMO === 'true' && (
              <p className="mt-3 rounded-xl bg-mantequilla/40 px-4 py-2 text-sm text-tinta-900">
                Esta es una demo pública: lo que envíes se ve en el panel de demostración. No escribas tu correo ni tu teléfono reales.
              </p>
            )}
            <Reservar />
          </div>
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section id="preguntas" className="bg-crema-50 py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-4xl font-extrabold text-pino-700">Preguntas que nos hacen</h2>
          <div className="mt-8 border-t border-tinta-300">
            {PREGUNTAS.map((p) => <Pregunta key={p.q} {...p} />)}
          </div>

          <div className="mt-12 rounded-[2rem] bg-crema-100 p-6 md:p-8">
            <h3 className="text-lg font-extrabold text-tinta-900">¿Tienes otra pregunta?</h3>
            <p className="text-tinta-600">Escríbenos y te respondemos por correo.</p>
            {estado === 'enviado' ? (
              <div className="mt-4 rounded-xl bg-pino-50 p-4 text-pino-800" role="status">
                <p className="flex items-center gap-2 font-bold"><CheckCircle2 size={18} /> ¡Recibimos tu mensaje!</p>
                <button type="button" onClick={() => setEstado('listo')} className="mt-1 text-sm font-semibold underline">Enviar otro</button>
              </div>
            ) : (
              <form onSubmit={enviar} className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-tinta-700">Tu nombre
                  <input name="nombre" value={form.nombre} onChange={cambiar} required minLength={2} maxLength={80} autoComplete="name" className={`${campo} mt-1`} />
                </label>
                <label className="text-sm font-semibold text-tinta-700">Correo
                  <input type="email" name="email" value={form.email} onChange={cambiar} required autoComplete="email" className={`${campo} mt-1`} />
                </label>
                <label className="text-sm font-semibold text-tinta-700 sm:col-span-2">Tu pregunta
                  <textarea name="mensaje" value={form.mensaje} onChange={cambiar} required minLength={5} maxLength={1000} rows={3} className={`${campo} mt-1`} />
                </label>
                <label className="flex items-start gap-2 text-sm text-tinta-700 sm:col-span-2">
                  <input type="checkbox" checked={form.autorizaDatos} onChange={(e) => setForm({ ...form, autorizaDatos: e.target.checked })} required className="mt-0.5 h-4 w-4 accent-pino-600" />
                  <span>Autorizo el tratamiento de mis datos según la <Link to="/privacidad" className="font-semibold underline">política de datos</Link>.</span>
                </label>
                {error && <p className="text-sm font-medium text-red-600 sm:col-span-2" role="alert">{error}</p>}
                <button type="submit" disabled={estado === 'enviando'}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-pino-600 py-3 font-bold text-white transition hover:bg-pino-700 disabled:opacity-60 sm:col-span-2">
                  <Send size={18} /> {estado === 'enviando' ? 'Enviando…' : 'Enviar pregunta'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Botón flotante: abre el asistente */}
      <Link to="/whatsapp" aria-label="Escríbenos por WhatsApp" className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-mantequilla px-5 py-3 font-bold text-tinta-900 shadow-lg transition hover:brightness-95">
        <MessageCircle size={20} /> <span className="hidden sm:inline">Escríbenos</span>
      </Link>

      <footer className="bg-pino-800 py-12 text-pino-200">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-5 md:flex-row md:items-center">
          <Marca claro />
          <p className="text-sm">Negocio ficticio de demostración. Diseño y desarrollo: Manuela Córdoba.</p>
          <div className="flex gap-5 text-sm font-semibold">
            <Link to="/privacidad" className="hover:text-white">Política de datos</Link>
            <Link to="/login" className="inline-flex items-center gap-1 hover:text-white"><Lock size={14} /> Panel del negocio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/whatsapp" element={<Asistente />} />
        <Route path="/mi-cita/:token" element={<MiCita />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
