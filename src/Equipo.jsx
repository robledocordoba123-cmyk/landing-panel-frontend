import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { api } from './api';
import Paginador from './Paginador';

const ROLES = { ADMIN: 'Administración', VETERINARIO: 'Veterinario', RECEPCION: 'Recepción' };
const ACCIONES = {
  LOGIN: 'Entró al panel',
  LOGIN_FALLIDO: 'Intento fallido de entrada',
  LOGOUT: 'Cerró sesión',
  CLAVE_CAMBIADA: 'Cambió su contraseña',
  HISTORIA_VISTA: 'Abrió una historia clínica',
  HISTORIA_ESCRITA: 'Registró una atención',
  VACUNA_REGISTRADA: 'Registró una vacuna',
  VACUNA_BORRADA: 'Borró una vacuna',
  CLIENTE_EDITADO: 'Editó un cliente',
  DATOS_SUPRIMIDOS: 'Suprimió datos de un cliente',
  CITA_ESTADO: 'Cambió el estado de una cita',
  USUARIO_CREADO: 'Creó una cuenta',
  USUARIO_EDITADO: 'Editó una cuenta',
  HORARIO_EDITADO: 'Cambió el horario',
  CIERRE_CREADO: 'Cerró un día',
  CIERRE_BORRADO: 'Volvió a abrir un día',
  SERVICIO_CREADO: 'Creó un servicio',
  SERVICIO_EDITADO: 'Editó un servicio',
};
const campo = 'mt-1 w-full rounded-xl border border-tinta-300 bg-white px-3 py-2 text-tinta-800 outline-none focus:border-pino-500 focus:ring-4 focus:ring-pino-100';
const VACIO = { nombre: '', email: '', rol: 'RECEPCION', password: '' };
const fechaHora = (f) => new Date(f).toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'medium', timeStyle: 'short' });

function Bitacora({ alCaducarSesion }) {
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    api(`/api/bitacora?pagina=${pagina}`)
      .then((d) => vigente && setDatos(d))
      .catch((err) => {
        if (!vigente) return;
        if (err.estado === 401) alCaducarSesion();
        else setError(err.message);
      });
    return () => {
      vigente = false;
    };
  }, [pagina, alCaducarSesion]);

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold text-pino-700">Bitácora</h2>
        {datos && <Paginador pagina={datos.pagina} paginas={datos.paginas} alCambiar={setPagina} />}
      </div>
      <p className="text-tinta-600">Quién hizo qué. No se puede modificar ni borrar.</p>
      {error && <p className="mt-3 text-red-700" role="alert">{error}</p>}
      <ul className="mt-4 divide-y divide-tinta-200 rounded-3xl bg-white px-5">
        {datos?.registros.map((r) => (
          <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-x-4 py-3">
            <span className="font-semibold text-tinta-900">{ACCIONES[r.accion] || r.accion}{r.detalle && <span className="font-normal text-tinta-500"> · {r.detalle}</span>}</span>
            <span className="text-sm text-tinta-500">{r.usuarioEmail || 'Sin cuenta'} · {fechaHora(r.creadoEn)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Cuentas del equipo, solo para administración.
function Equipo({ usuario, alCaducarSesion }) {
  const [cuentas, setCuentas] = useState(null);
  const [error, setError] = useState('');
  const [formulario, setFormulario] = useState(false);
  const [datos, setDatos] = useState(VACIO);
  const [enviando, setEnviando] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    api('/api/usuarios')
      .then((d) => vigente && setCuentas(d))
      .catch((err) => {
        if (!vigente) return;
        if (err.estado === 401) alCaducarSesion();
        else setError(err.message);
      });
    return () => {
      vigente = false;
    };
  }, [version, alCaducarSesion]);

  const cambiar = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });

  const crear = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await api('/api/usuarios', { metodo: 'POST', datos });
      setDatos(VACIO);
      setFormulario(false);
      setVersion((v) => v + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const actualizar = async (cuenta, cambios) => {
    setError('');
    try {
      await api(`/api/usuarios/${cuenta.id}`, { metodo: 'PATCH', datos: { nombre: cuenta.nombre, rol: cuenta.rol, activo: cuenta.activo, ...cambios } });
    } catch (err) {
      setError(err.message);
    }
    setVersion((v) => v + 1);
  };

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-4xl font-extrabold text-pino-700">Equipo</h1>
          <p className="text-tinta-600">Cada persona con su cuenta y solo lo que necesita ver.</p>
        </div>
        <button type="button" onClick={() => setFormulario(!formulario)} className="inline-flex items-center gap-2 rounded-xl bg-pino-600 px-4 py-2 text-sm font-bold text-white hover:bg-pino-700"><UserPlus size={16} /> Agregar</button>
      </div>

      {error && <p className="mt-4 text-red-700" role="alert">{error}</p>}

      {formulario && (
        <form onSubmit={crear} className="mt-5 grid gap-3 rounded-3xl bg-white p-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-tinta-700">Nombre
            <input name="nombre" value={datos.nombre} onChange={cambiar} required minLength={2} maxLength={80} className={campo} />
          </label>
          <label className="text-sm font-semibold text-tinta-700">Correo
            <input type="email" name="email" value={datos.email} onChange={cambiar} required className={campo} />
          </label>
          <label className="text-sm font-semibold text-tinta-700">Rol
            <select name="rol" value={datos.rol} onChange={cambiar} className={campo}>
              {Object.entries(ROLES).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-tinta-700">Contraseña inicial
            <input type="password" name="password" value={datos.password} onChange={cambiar} required minLength={12} autoComplete="new-password" className={campo} />
          </label>
          <button type="submit" disabled={enviando} className="rounded-xl bg-pino-600 py-2.5 font-bold text-white hover:bg-pino-700 disabled:opacity-60 sm:col-span-2">{enviando ? 'Creando…' : 'Crear cuenta'}</button>
        </form>
      )}

      <div className="mt-5 space-y-3">
        {!cuentas && !error && <p className="py-10 text-center text-tinta-400">Cargando…</p>}
        {cuentas?.map((c) => (
          <article key={c.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-3xl p-5 ${c.activo ? 'bg-white' : 'border border-dashed border-tinta-300 bg-crema-50'}`}>
            <div>
              <h2 className="text-lg font-bold text-tinta-900">{c.nombre}{c.id === usuario.id && <span className="font-sans text-sm font-normal text-tinta-500"> · Tú</span>}{!c.activo && <span className="ml-2 rounded-full bg-tinta-200 px-2 py-0.5 font-sans text-xs font-bold text-tinta-700">Inactiva</span>}</h2>
              <p className="text-sm text-tinta-500">{c.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor={`rol-${c.id}`}>Rol de {c.nombre}</label>
              <select id={`rol-${c.id}`} value={c.rol} onChange={(e) => actualizar(c, { rol: e.target.value })} className="rounded-xl border border-tinta-300 bg-white px-3 py-2 text-sm">
                {Object.entries(ROLES).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
              </select>
              <button type="button" onClick={() => actualizar(c, { activo: !c.activo })} className="rounded-xl bg-crema-100 px-3 py-2 text-sm font-bold text-tinta-700 hover:bg-crema-200">{c.activo ? 'Desactivar' : 'Activar'}</button>
            </div>
          </article>
        ))}
      </div>

      <Bitacora alCaducarSesion={alCaducarSesion} />
    </section>
  );
}

export default Equipo;
