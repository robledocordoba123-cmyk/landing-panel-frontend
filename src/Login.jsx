import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Coffee, LogIn } from 'lucide-react';
import { api } from './api';
import { Marca } from './Marca';
import { Arco } from './Mascota';

// En la demo pública se muestra la cuenta de prueba (VITE_MODO_DEMO=true).
const MODO_DEMO = import.meta.env.VITE_MODO_DEMO === 'true';
const DEMO = { email: 'admin@huellitas.demo', password: 'Huellitas2026!' };

// El plan gratuito del hosting apaga la API tras un rato sin uso y tarda cerca
// de un minuto en encender: si la respuesta se demora, se explica por qué.
const MS_ANTES_DE_AVISAR = 4000;

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [despertando, setDespertando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!cargando) return undefined;
    const temporizador = setTimeout(() => setDespertando(true), MS_ANTES_DE_AVISAR);
    return () => {
      clearTimeout(temporizador);
      setDespertando(false);
    };
  }, [cargando]);

  const entrar = async (credenciales) => {
    setError('');
    setCargando(true);
    try {
      const { token } = await api('/api/login', { metodo: 'POST', datos: credenciales });
      localStorage.setItem('token', token);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const campo = 'mt-1.5 w-full rounded-xl border border-tinta-300 bg-white px-4 py-3 outline-none transition focus:border-pino-500 focus:ring-4 focus:ring-pino-100';

  return (
    <div className="grid min-h-screen bg-crema-50 lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-pino-700 p-12 text-crema-50 lg:flex">
        <Marca claro />
        <div className="max-w-md">
          <h2 className="text-5xl font-extrabold leading-[1.05]">Todo el día de tus pacientes, en un solo lugar.</h2>
          <p className="mt-4 text-lg text-pino-200">Agenda, historias clínicas y vacunas de cada mascota.</p>
        </div>
        <div className="asomarse -mb-12 flex items-end gap-3" aria-hidden="true">
          <Arco especie="Gato" nombre="Misha" fondo="bg-lila" className="h-44 w-36" />
          <Arco especie="Perro" nombre="Toby" fondo="bg-mantequilla" className="h-60 w-44" />
          <Arco especie="Conejo" nombre="Copito" fondo="bg-menta" className="h-36 w-32" />
        </div>
      </aside>

      <main className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-tinta-500 hover:text-tinta-900"><ArrowLeft size={14} /> Volver a la página</Link>
          <div className="mt-8 lg:hidden"><Marca /></div>
          <h1 className="mt-6 text-3xl font-extrabold text-tinta-900">Entra a tu panel</h1>
          <p className="mt-1 text-tinta-600">Para el equipo de la veterinaria.</p>

          <form onSubmit={(e) => { e.preventDefault(); entrar({ email, password }); }} className="mt-8 space-y-4">
            <label className="block text-sm font-semibold text-tinta-700">Correo
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className={campo} />
            </label>
            <label className="block text-sm font-semibold text-tinta-700">Contraseña
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className={campo} />
            </label>
            {despertando && (
              <p className="flex items-start gap-2 rounded-xl bg-mandarina-100 px-3 py-2 text-sm text-mandarina-700">
                <Coffee size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                El servidor estaba en reposo y está encendiendo. La primera entrada puede tardar hasta un minuto.
              </p>
            )}
            {error && <p className="text-sm font-medium text-red-700" role="alert">{error}</p>}
            <button type="submit" disabled={cargando} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-pino-600 py-3 font-bold text-white transition hover:bg-pino-700 disabled:opacity-60">
              <LogIn size={18} /> {cargando ? 'Entrando…' : 'Iniciar sesión'}
            </button>
            {MODO_DEMO && (
              <button type="button" onClick={() => entrar(DEMO)} disabled={cargando}
                className="w-full rounded-xl bg-mantequilla py-3 text-sm font-bold text-tinta-900 transition hover:brightness-95 disabled:opacity-60">
                Probar con la cuenta de demostración
              </button>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}

export default Login;
