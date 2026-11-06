import { useEffect, useState } from 'react';
import { AlertTriangle, ChevronRight, Search } from 'lucide-react';
import { api } from './api';
import { Arco } from './Mascota';

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
      <h1 className="text-4xl font-extrabold text-pino-700">Clientes</h1>
      <p className="text-tinta-600">Se crean solos cuando alguien reserva una cita.</p>

      {vacunas.length > 0 && (
        <div className="mt-5 rounded-3xl bg-mantequilla/50 p-5">
          <h2 className="flex items-center gap-2 font-bold text-tinta-900"><AlertTriangle size={18} /> Vacunas por renovar</h2>
          <ul className="mt-2 space-y-1">
            {vacunas.map((v) => {
              const vencida = v.proximaDosis.slice(0, 10) < hoy();
              return (
                <li key={v.id}>
                  <button type="button" onClick={() => alAbrirMascota(v.mascotaId)} className="text-left text-sm text-tinta-900 hover:underline">
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
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tinta-400" aria-hidden="true" />
        <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} maxLength={80} placeholder="Buscar por nombre, teléfono, correo o mascota"
          className="w-full rounded-xl border border-tinta-300 bg-white py-3 pl-10 pr-4 outline-none focus:border-pino-500 focus:ring-4 focus:ring-pino-100" />
      </label>

      {error && <p className="mt-4 text-red-600" role="alert">{error}</p>}

      <div className="mt-4 space-y-3">
        {!clientes && !error && <p className="py-10 text-center text-tinta-400">Cargando…</p>}
        {clientes?.length === 0 && <p className="rounded-2xl border border-dashed border-tinta-300 py-10 text-center text-tinta-500">No encontré clientes.</p>}
        {clientes?.map((c) => (
          <article key={c.id} className="rounded-3xl bg-white p-5">
            <h2 className="text-lg font-bold text-tinta-900">{c.nombre}</h2>
            <p className="text-sm text-tinta-500">{[c.telefono, c.email].filter(Boolean).join(' · ')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {c.mascotas.length === 0 && <span className="text-sm text-tinta-400">Sin mascotas registradas.</span>}
              {c.mascotas.map((m) => (
                <button key={m.id} type="button" onClick={() => alAbrirMascota(m.id)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-crema-100 py-1.5 pl-2 pr-3 text-sm font-bold text-tinta-900 hover:bg-crema-200">
                  <Arco especie={m.especie} nombre={m.nombre} className="h-10 w-9" /> {m.nombre} <span className="font-normal text-tinta-500">{m.especie}</span> <ChevronRight size={14} />
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
