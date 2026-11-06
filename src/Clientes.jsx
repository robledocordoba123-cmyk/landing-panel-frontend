import { useEffect, useState } from 'react';
import { AlertTriangle, ChevronRight, PawPrint, Search, User } from 'lucide-react';
import { api } from './api';

const hoy = () => new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
const fechaCorta = (f) => new Date(f).toLocaleDateString('es-CO', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' });
const MS_ESPERA_BUSQUEDA = 300;

// Lista de clientes con buscador, y aviso de vacunas vencidas o por vencer.
function Clientes({ token, alAbrirMascota, alCaducarSesion }) {
  const [busqueda, setBusqueda] = useState('');
  const [clientes, setClientes] = useState(null);
  const [vacunas, setVacunas] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    // Espera a que dejen de escribir, para no consultar por cada letra.
    const espera = setTimeout(() => {
      api(`/api/clientes?q=${encodeURIComponent(busqueda)}`, { token })
        .then((d) => {
          if (!vigente) return;
          setClientes(d);
          setError('');
        })
        .catch((err) => {
          if (!vigente) return;
          if (err.estado === 401) alCaducarSesion();
          else setError(err.message);
        });
    }, MS_ESPERA_BUSQUEDA);
    return () => {
      vigente = false;
      clearTimeout(espera);
    };
  }, [busqueda, token, alCaducarSesion]);

  useEffect(() => {
    let vigente = true;
    api('/api/vacunas/por-vencer', { token })
      .then((d) => vigente && setVacunas(d))
      .catch(() => {}); // Es un aviso: si falla, la lista de clientes sigue sirviendo.
    return () => {
      vigente = false;
    };
  }, [token]);

  return (
    <section>
      <h1 className="text-2xl font-extrabold text-stone-900">Clientes</h1>
      <p className="text-stone-600">Se crean solos cuando alguien reserva una cita.</p>

      {vacunas.length > 0 && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="flex items-center gap-2 font-bold text-amber-900"><AlertTriangle size={18} /> Vacunas por renovar</h2>
          <ul className="mt-2 space-y-1">
            {vacunas.map((v) => {
              const vencida = v.proximaDosis.slice(0, 10) < hoy();
              return (
                <li key={v.id}>
                  <button type="button" onClick={() => alAbrirMascota(v.mascotaId)} className="text-left text-sm text-amber-900 hover:underline">
                    <span className="font-bold">{v.mascota.nombre}</span> · {v.nombre} · {vencida ? 'venció' : 'vence'} el {fechaCorta(v.proximaDosis)}
                    {' '}· {v.mascota.cliente.nombre}{v.mascota.cliente.telefono && ` (${v.mascota.cliente.telefono})`}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <label className="relative mt-5 block">
        <span className="sr-only">Buscar clientes</span>
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden="true" />
        <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} maxLength={80} placeholder="Buscar por nombre, teléfono, correo o mascota"
          className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-4 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100" />
      </label>

      {error && <p className="mt-4 text-red-600" role="alert">{error}</p>}

      <div className="mt-4 space-y-3">
        {!clientes && !error && <p className="py-10 text-center text-stone-400">Cargando…</p>}
        {clientes?.length === 0 && <p className="rounded-2xl border border-dashed border-stone-300 py-10 text-center text-stone-500">No encontré clientes.</p>}
        {clientes?.map((c) => (
          <article key={c.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 font-bold text-stone-900"><User size={16} className="text-teal-600" /> {c.nombre}</h2>
            <p className="text-sm text-stone-500">{[c.telefono, c.email].filter(Boolean).join(' · ')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {c.mascotas.length === 0 && <span className="text-sm text-stone-400">Sin mascotas registradas.</span>}
              {c.mascotas.map((m) => (
                <button key={m.id} type="button" onClick={() => alAbrirMascota(m.id)}
                  className="inline-flex items-center gap-1 rounded-xl bg-teal-50 px-3 py-1.5 text-sm font-bold text-teal-800 hover:bg-teal-100">
                  <PawPrint size={14} /> {m.nombre} <span className="font-normal text-teal-700">· {m.especie}</span> <ChevronRight size={14} />
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Clientes;
