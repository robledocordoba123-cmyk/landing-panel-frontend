import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PawPrint, LogIn, ArrowLeft, Coffee } from 'lucide-react';
import { api } from './api';

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

  const campo = 'mt-1 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100';

  return (
    <div className="grid min-h-screen place-items-center bg-stone-50 px-5">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"><ArrowLeft size={14} /> Volver a la página</Link>
        <form onSubmit={(e) => { e.preventDefault(); entrar({ email, password }); }} className="space-y-4 rounded-3xl bg-white p-8 shadow-xl shadow-stone-200">
          <div className="flex items-center gap-2 text-lg font-extrabold text-teal-700">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 text-white"><PawPrint size={20} /></span>
            Panel de Huellitas
          </div>
          <label className="block text-sm font-semibold text-stone-700">Correo
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={campo} />
          </label>
          <label className="block text-sm font-semibold text-stone-700">Contraseña
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={campo} />
          </label>
          {despertando && (
            <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <Coffee size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              El servidor estaba en reposo y está encendiendo. La primera entrada puede tardar hasta un minuto.
            </p>
          )}
          {error && <p className="text-sm font-medium text-red-600" role="alert">{error}</p>}
          <button type="submit" disabled={cargando} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-bold text-white transition hover:bg-teal-700 disabled:opacity-60">
            <LogIn size={18} /> {cargando ? 'Entrando…' : 'Iniciar sesión'}
          </button>
          {MODO_DEMO && (
            <button type="button" onClick={() => entrar(DEMO)} disabled={cargando}
              className="w-full rounded-xl border border-dashed border-amber-400 bg-amber-50 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-100">
              Entrar con la cuenta de demostración
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
