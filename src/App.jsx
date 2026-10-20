import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import {
  PawPrint, Stethoscope, Syringe, Scissors, Siren, Clock, MapPin, Phone,
  CalendarCheck, CheckCircle2, Heart, ShieldCheck, ChevronDown, Send, Lock, MessageCircle,
} from 'lucide-react';
import { api } from './api';
import Login from './Login';
import Dashboard from './Dashboard';
import Asistente from './Asistente';

const SERVICIOS = [
  { icono: Stethoscope, titulo: 'Consulta general', texto: 'Revisión completa, diagnóstico y tratamiento para perros, gatos y otras mascotas.' },
  { icono: Syringe, titulo: 'Vacunación', texto: 'Plan de vacunas y desparasitación al día, con carné digital para tu mascota.' },
  { icono: Scissors, titulo: 'Peluquería', texto: 'Baño, corte y limpieza de oídos y uñas, con productos suaves para su piel.' },
  { icono: Siren, titulo: 'Urgencias', texto: 'Atención prioritaria cuando tu mascota lo necesita, todos los días.' },
];

const PREGUNTAS = [
  { q: '¿Necesito pedir cita?', a: 'Para consulta, vacunación y peluquería sí, así no esperas. Las urgencias se atienden sin cita.' },
  { q: '¿Atienden animales distintos a perros y gatos?', a: 'Sí, también conejos, aves y otras mascotas pequeñas. Cuéntanos en el formulario qué mascota tienes.' },
  { q: '¿Cuánto tardan en responder?', a: 'Respondemos las solicitudes el mismo día en horario de atención, por correo o por teléfono.' },
  { q: '¿Qué medios de pago reciben?', a: 'Efectivo, tarjeta, Nequi y transferencia.' },
];

const VACIO = { nombre: '', email: '', telefono: '', mascota: '', servicio: 'Consulta general', mensaje: '' };

function Pregunta({ q, a }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <div className="border-b border-stone-200 last:border-0">
      <button type="button" onClick={() => setAbierta(!abierta)} aria-expanded={abierta}
        className="flex w-full items-center justify-between gap-4 py-4 text-left font-semibold text-stone-800">
        {q}
        <ChevronDown size={18} className={`shrink-0 text-teal-600 transition ${abierta ? 'rotate-180' : ''}`} />
      </button>
      {abierta && <p className="pb-4 text-stone-600">{a}</p>}
    </div>
  );
}

function LandingPage() {
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

  const campo = 'w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100';

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      {/* Barra superior */}
      <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href="#inicio" className="flex items-center gap-2 text-lg font-extrabold text-teal-700">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 text-white"><PawPrint size={20} /></span>
            Huellitas
          </a>
          <div className="hidden items-center gap-7 text-sm font-medium text-stone-600 md:flex">
            <a href="#servicios" className="hover:text-teal-700">Servicios</a>
            <a href="#horarios" className="hover:text-teal-700">Horarios</a>
            <a href="#preguntas" className="hover:text-teal-700">Preguntas</a>
          </div>
          <a href="#cita" className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-stone-900 shadow-sm transition hover:bg-amber-300">
            Pedir cita
          </a>
        </nav>
      </header>

      {/* Inicio */}
      <section id="inicio" className="relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-teal-100 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
              <Heart size={14} /> Veterinaria en Medellín
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-stone-900 md:text-5xl">
              Cuidamos a tu mascota <span className="text-teal-600">como si fuera nuestra</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-stone-600">
              Consultas, vacunas, peluquería y urgencias en un solo lugar. Pide tu cita en un minuto y te confirmamos el mismo día.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#cita" className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 font-bold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700">
                <CalendarCheck size={18} /> Pedir cita
              </a>
              <a href="#servicios" className="rounded-xl border border-stone-300 bg-white px-6 py-3 font-semibold text-stone-700 transition hover:border-teal-400">
                Ver servicios
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-600">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-teal-600" /> Atención todos los días</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-teal-600" /> Perros, gatos y más</li>
            </ul>
          </div>

          {/* Ilustración hecha con CSS: no depende de imágenes externas */}
          <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
            <div className="grid aspect-square place-items-center rounded-[2.5rem] bg-gradient-to-br from-teal-500 to-teal-700 shadow-2xl shadow-teal-700/30">
              <PawPrint size={170} strokeWidth={1.4} className="text-white/90" />
            </div>
            <div className="absolute left-2 top-10 flex md:-left-6 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-600"><CalendarCheck size={20} /></span>
              <div>
                <p className="text-sm font-bold text-stone-800">Cita confirmada</p>
                <p className="text-xs text-stone-500">Toby · Vacunación · 9:00 a. m.</p>
              </div>
            </div>
            <div className="absolute -bottom-5 right-0 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-600"><ShieldCheck size={20} /></span>
              <div>
                <p className="text-sm font-bold text-stone-800">Vacunas al día</p>
                <p className="text-xs text-stone-500">Carné digital de tu mascota</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center text-3xl font-extrabold text-stone-900">Nuestros servicios</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-stone-600">Todo lo que tu mascota necesita para estar sana y feliz.</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICIOS.map(({ icono: Icono, titulo, texto }) => (
              <article key={titulo} className="rounded-2xl border border-stone-200 bg-stone-50 p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-600 text-white"><Icono size={22} /></span>
                <h3 className="mt-4 text-lg font-bold text-stone-900">{titulo}</h3>
                <p className="mt-2 text-sm text-stone-600">{texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Horarios y cita */}
      <section id="horarios" className="py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-extrabold text-stone-900">Horarios y ubicación</h2>
            <ul className="mt-8 space-y-5">
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-600"><Clock size={20} /></span>
                <div>
                  <p className="font-bold">Lunes a sábado</p>
                  <p className="text-stone-600">8:00 a. m. – 7:00 p. m.</p>
                  <p className="mt-1 font-bold">Domingos y festivos</p>
                  <p className="text-stone-600">9:00 a. m. – 2:00 p. m. · Urgencias todo el día</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-600"><MapPin size={20} /></span>
                <div>
                  <p className="font-bold">Dirección</p>
                  <p className="text-stone-600">Medellín, Antioquia (dirección de ejemplo)</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-600"><Phone size={20} /></span>
                <div>
                  <p className="font-bold">Teléfono</p>
                  <p className="text-stone-600">Número de ejemplo en la demo</p>
                </div>
              </li>
            </ul>
          </div>

          <div id="cita" className="scroll-mt-24 rounded-3xl bg-white p-6 shadow-xl shadow-stone-200 md:p-8 lg:col-span-3">
            <h2 className="text-2xl font-extrabold text-stone-900">Pide tu cita</h2>
            <p className="mt-1 text-stone-600">Déjanos tus datos y te confirmamos la hora el mismo día.</p>

            {estado === 'enviado' ? (
              <div className="mt-6 rounded-2xl bg-teal-50 p-6 text-center" role="status">
                <CheckCircle2 size={40} className="mx-auto text-teal-600" />
                <p className="mt-3 text-lg font-bold text-teal-800">¡Recibimos tu solicitud!</p>
                <p className="text-teal-700">Te escribiremos pronto para confirmar la cita.</p>
                <button type="button" onClick={() => setEstado('listo')} className="mt-4 text-sm font-semibold text-teal-700 underline">Enviar otra solicitud</button>
              </div>
            ) : (
              <form onSubmit={enviar} className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-stone-700">Tu nombre
                  <input name="nombre" value={form.nombre} onChange={cambiar} required minLength={2} maxLength={80} className={`${campo} mt-1`} />
                </label>
                <label className="text-sm font-semibold text-stone-700">Correo
                  <input type="email" name="email" value={form.email} onChange={cambiar} required className={`${campo} mt-1`} />
                </label>
                <label className="text-sm font-semibold text-stone-700">Teléfono <span className="font-normal text-stone-400">(opcional)</span>
                  <input type="tel" name="telefono" value={form.telefono} onChange={cambiar} className={`${campo} mt-1`} />
                </label>
                <label className="text-sm font-semibold text-stone-700">Tu mascota <span className="font-normal text-stone-400">(nombre y especie)</span>
                  <input name="mascota" value={form.mascota} onChange={cambiar} maxLength={60} placeholder="Ej.: Toby, perro" className={`${campo} mt-1`} />
                </label>
                <label className="text-sm font-semibold text-stone-700 sm:col-span-2">Servicio
                  <select name="servicio" value={form.servicio} onChange={cambiar} className={`${campo} mt-1`}>
                    {[...SERVICIOS.map((s) => s.titulo), 'Otro'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label className="text-sm font-semibold text-stone-700 sm:col-span-2">¿Qué necesitas?
                  <textarea name="mensaje" value={form.mensaje} onChange={cambiar} required minLength={5} maxLength={1000} rows={4} className={`${campo} mt-1`} />
                </label>
                {error && <p className="text-sm font-medium text-red-600 sm:col-span-2" role="alert">{error}</p>}
                <button type="submit" disabled={estado === 'enviando'}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-bold text-white transition hover:bg-teal-700 disabled:opacity-60 sm:col-span-2">
                  <Send size={18} /> {estado === 'enviando' ? 'Enviando…' : 'Enviar solicitud'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section id="preguntas" className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-center text-3xl font-extrabold text-stone-900">Preguntas frecuentes</h2>
          <div className="mt-10 rounded-2xl border border-stone-200 bg-stone-50 px-6">
            {PREGUNTAS.map((p) => <Pregunta key={p.q} {...p} />)}
          </div>
        </div>
      </section>

      {/* Botón flotante de WhatsApp: abre el asistente */}
      <Link to="/whatsapp" className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-[#25d366] px-5 py-3 font-bold text-white shadow-xl shadow-green-700/30 transition hover:scale-105">
        <MessageCircle size={22} /> <span className="hidden sm:inline">Escríbenos por WhatsApp</span>
      </Link>

      <footer className="bg-stone-900 py-10 text-stone-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm md:flex-row">
          <p className="flex items-center gap-2 font-bold text-white"><PawPrint size={18} /> Huellitas Veterinaria</p>
          <p>Sitio de demostración: negocio ficticio. Diseño y desarrollo: Manuela Córdoba.</p>
          <Link to="/login" className="inline-flex items-center gap-1 hover:text-white"><Lock size={14} /> Panel del negocio</Link>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
