import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, PawPrint, SendHorizontal, CheckCheck, Info, RotateCcw } from 'lucide-react';
import { api } from './api';

// Simulador del asistente de WhatsApp de Huellitas. Habla con el mismo motor
// que atiende el WhatsApp real (POST /api/bot/simulador), así cualquiera lo
// prueba sin instalar nada. Cada pestaña es una conversación distinta.
const nuevaSesion = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
const hora = () => new Date().toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
const ATAJOS = ['Hola', '1', '2', '3', '4'];

// WhatsApp usa *texto* para negrita: se muestra igual aquí.
function Texto({ children }) {
  return children.split(/(\*[^*\n]+\*)/g).map((parte, i) =>
    parte.startsWith('*') && parte.endsWith('*') ? <strong key={i}>{parte.slice(1, -1)}</strong> : <span key={i}>{parte}</span>
  );
}

function Burbuja({ de, texto, hora: h }) {
  const mia = de === 'yo';
  return (
    <div className={`flex ${mia ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] whitespace-pre-line rounded-xl px-3 py-2 text-[15px] leading-snug text-stone-900 shadow-sm ${mia ? 'rounded-tr-none bg-[#d9fdd3]' : 'rounded-tl-none bg-white'}`}>
        <Texto>{texto}</Texto>
        <span className="ml-2 inline-flex translate-y-1 items-center gap-0.5 float-right text-[11px] text-stone-500">
          {h} {mia && <CheckCheck size={14} className="text-sky-500" />}
        </span>
      </div>
    </div>
  );
}

function Asistente() {
  const [sesion, setSesion] = useState(nuevaSesion);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const [error, setError] = useState('');
  const fin = useRef(null);

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, escribiendo]);

  const enviar = async (contenido) => {
    const limpio = contenido.trim();
    if (!limpio || escribiendo) return;
    setError('');
    setTexto('');
    setMensajes((m) => [...m, { de: 'yo', texto: limpio, hora: hora() }]);
    setEscribiendo(true);
    try {
      const { respuestas } = await api('/api/bot/simulador', { metodo: 'POST', datos: { sesion, texto: limpio } });
      for (const r of respuestas) {
        await new Promise((ok) => setTimeout(ok, 450));
        setMensajes((m) => [...m, { de: 'bot', texto: r, hora: hora() }]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setEscribiendo(false);
    }
  };

  const reiniciar = () => {
    setSesion(nuevaSesion());
    setMensajes([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-stone-100 px-4 py-6">
      <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-2">
        <section className="lg:pt-10">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"><ArrowLeft size={14} /> Volver a la página</Link>
          <h1 className="mt-4 text-3xl font-extrabold text-stone-900">Asistente de WhatsApp</h1>
          <p className="mt-3 text-stone-600">
            Así atiende Huellitas por WhatsApp: responde servicios y horarios, <strong>agenda citas</strong> y pasa la conversación a una persona cuando hace falta. Las citas que agenda llegan solas al panel del negocio.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-stone-600">
            <li>• Escribe <strong>Hola</strong> o usa los atajos de abajo.</li>
            <li>• Prueba pedir una cita: te pedirá nombre, mascota, servicio y correo.</li>
            <li>• Escribe <strong>cancelar</strong> en cualquier momento para empezar de nuevo.</li>
          </ul>
          <p className="mt-6 flex gap-2 rounded-xl bg-white p-4 text-sm text-stone-500">
            <Info size={18} className="shrink-0 text-teal-600" />
            Este simulador usa el mismo motor que el bot de WhatsApp real. Negocio ficticio de demostración.
          </p>
        </section>

        {/* Teléfono */}
        <section className="mx-auto w-full max-w-sm overflow-hidden rounded-[2.2rem] border-8 border-stone-900 bg-[#efeae2] shadow-2xl">
          <header className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-500"><PawPrint size={20} /></span>
            <div className="flex-1">
              <p className="font-semibold leading-tight">Huellitas Veterinaria</p>
              <p className="text-xs text-emerald-100">{escribiendo ? 'escribiendo…' : 'en línea'}</p>
            </div>
            <button type="button" onClick={reiniciar} title="Nueva conversación" aria-label="Nueva conversación" className="rounded-full p-2 hover:bg-white/10"><RotateCcw size={18} /></button>
          </header>

          <div className="h-[460px] space-y-2 overflow-y-auto px-3 py-4" aria-live="polite">
            {mensajes.length === 0 && (
              <p className="mx-auto w-fit rounded-lg bg-[#fff5c4] px-3 py-1.5 text-center text-xs text-stone-600">Escribe un mensaje para empezar 👋</p>
            )}
            {mensajes.map((m, i) => <Burbuja key={i} {...m} />)}
            {escribiendo && <div className="w-fit rounded-xl rounded-tl-none bg-white px-3 py-2 text-stone-400 shadow-sm">• • •</div>}
            <div ref={fin} />
          </div>

          {error && <p className="bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">{error}</p>}

          <div className="flex gap-1.5 overflow-x-auto bg-[#efeae2] px-3 pb-2">
            {ATAJOS.map((a) => (
              <button key={a} type="button" onClick={() => enviar(a)} disabled={escribiendo}
                className="shrink-0 rounded-full border border-teal-600/30 bg-white px-3 py-1 text-sm font-medium text-teal-700 disabled:opacity-50">
                {a}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); enviar(texto); }} className="flex items-center gap-2 bg-[#f0f2f5] px-3 py-2">
            <label htmlFor="mensaje-bot" className="sr-only">Mensaje</label>
            <input id="mensaje-bot" value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={500} placeholder="Escribe un mensaje"
              className="flex-1 rounded-full bg-white px-4 py-2.5 text-[15px] outline-none" />
            <button type="submit" disabled={escribiendo || !texto.trim()} aria-label="Enviar"
              className="grid h-11 w-11 place-items-center rounded-full bg-[#00a884] text-white disabled:opacity-50">
              <SendHorizontal size={20} />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Asistente;
