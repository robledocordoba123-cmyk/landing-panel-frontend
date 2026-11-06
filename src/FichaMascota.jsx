import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Plus, Printer, Syringe, Trash2 } from 'lucide-react';
import { api } from './api';
import { Arco } from './Mascota';
import AtencionForm from './AtencionForm';

const campo = 'mt-1 w-full rounded-xl border border-tinta-300 bg-white px-3 py-2 text-tinta-800 outline-none focus:border-pino-500 focus:ring-4 focus:ring-pino-100';
const hoy = () => new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
// Las fechas sin hora llegan como medianoche UTC: se leen en UTC para no correr el día.
const fechaCorta = (f) => new Date(f).toLocaleDateString('es-CO', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' });
const fechaHora = (f) => new Date(f).toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'medium', timeStyle: 'short' });

function edad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const meses = Math.floor((Date.now() - new Date(fechaNacimiento).getTime()) / (30.44 * 86400000));
  if (meses < 12) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  const anios = Math.floor(meses / 12);
  return `${anios} ${anios === 1 ? 'año' : 'años'}`;
}

function VacunaForm({ mascotaId, alGuardar, alCancelar }) {
  const [datos, setDatos] = useState({ nombre: '', aplicadaEn: hoy(), proximaDosis: '', lote: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const cambiar = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await api(`/api/mascotas/${mascotaId}/vacunas`, { metodo: 'POST', datos });
      alGuardar();
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="mt-3 grid gap-3 rounded-xl bg-tinta-50 p-4 sm:grid-cols-2 print:hidden">
      <label className="text-sm font-semibold text-tinta-700">Vacuna
        <input name="nombre" value={datos.nombre} onChange={cambiar} required minLength={2} maxLength={80} className={campo} />
      </label>
      <label className="text-sm font-semibold text-tinta-700">Lote <span className="font-normal text-tinta-400">(opcional)</span>
        <input name="lote" value={datos.lote} onChange={cambiar} maxLength={40} className={campo} />
      </label>
      <label className="text-sm font-semibold text-tinta-700">Aplicada el
        <input type="date" name="aplicadaEn" value={datos.aplicadaEn} max={hoy()} onChange={cambiar} required className={campo} />
      </label>
      <label className="text-sm font-semibold text-tinta-700">Próxima dosis <span className="font-normal text-tinta-400">(opcional)</span>
        <input type="date" name="proximaDosis" value={datos.proximaDosis} min={datos.aplicadaEn} onChange={cambiar} className={campo} />
      </label>
      {error && <p className="text-sm font-medium text-red-600 sm:col-span-2" role="alert">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={enviando} className="rounded-xl bg-pino-600 px-4 py-2 text-sm font-bold text-white hover:bg-pino-700 disabled:opacity-60">{enviando ? 'Guardando…' : 'Guardar vacuna'}</button>
        <button type="button" onClick={alCancelar} className="rounded-xl bg-tinta-200 px-4 py-2 text-sm font-bold text-tinta-700 hover:bg-tinta-300">Cancelar</button>
      </div>
    </form>
  );
}

// Ficha de la mascota: datos, carné de vacunas (se puede imprimir) e historia.
function FichaMascota({ usuario, mascotaId, alVolver, alCaducarSesion }) {
  const clinica = usuario.rol !== 'RECEPCION';
  const [mascota, setMascota] = useState(null);
  const [error, setError] = useState('');
  const [formulario, setFormulario] = useState(null); // 'vacuna' | 'atencion'
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    api(`/api/mascotas/${mascotaId}`)
      .then((d) => vigente && setMascota(d))
      .catch((err) => {
        if (!vigente) return;
        if (err.estado === 401) alCaducarSesion();
        else setError(err.message);
      });
    return () => {
      vigente = false;
    };
  }, [mascotaId, version, alCaducarSesion]);

  const recargar = useCallback(() => {
    setFormulario(null);
    setVersion((v) => v + 1);
  }, []);

  const borrarVacuna = async (id) => {
    setError('');
    try {
      await api(`/api/vacunas/${id}`, { metodo: 'DELETE' });
      recargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const volver = <button type="button" onClick={alVolver} className="inline-flex items-center gap-1 text-sm font-semibold text-pino-700 print:hidden"><ArrowLeft size={14} /> Volver</button>;

  if (error && !mascota) return <div>{volver}<p className="mt-4 text-red-600" role="alert">{error}</p></div>;
  if (!mascota) return <p className="py-10 text-center text-tinta-400">Cargando…</p>;

  const datos = [mascota.especie, mascota.raza, mascota.sexo, edad(mascota.fechaNacimiento)].filter(Boolean).join(' · ');
  const estadoVacuna = (v) => {
    if (!v.proximaDosis) return null;
    return v.proximaDosis.slice(0, 10) < hoy() ? 'text-red-600 font-bold' : 'text-tinta-700';
  };

  return (
    <section>
      {volver}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Arco especie={mascota.especie} nombre={mascota.nombre} className="h-28 w-24" />
          <div>
            <h1 className="text-4xl font-extrabold text-pino-700">{mascota.nombre}</h1>
            <p className="text-tinta-600">{datos}</p>
            <p className="text-sm text-tinta-500">{mascota.cliente.nombre}{mascota.cliente.telefono && ` · ${mascota.cliente.telefono}`}</p>
          </div>
        </div>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-tinta-700 shadow-sm hover:bg-tinta-100 print:hidden">
          <Printer size={16} /> Imprimir carné
        </button>
      </div>

      {error && <p className="mt-4 text-red-600" role="alert">{error}</p>}

      <div className="mt-6 rounded-3xl bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-tinta-900"><Syringe size={18} className="text-mandarina-700" /> Carné de vacunas</h2>
          {clinica && <button type="button" onClick={() => setFormulario('vacuna')} className="inline-flex items-center gap-1 rounded-xl bg-pino-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-pino-700 print:hidden"><Plus size={14} /> Agregar</button>}
        </div>
        {formulario === 'vacuna' && <VacunaForm mascotaId={mascota.id} alGuardar={recargar} alCancelar={() => setFormulario(null)} />}
        {mascota.vacunas.length === 0 ? <p className="mt-3 text-tinta-500">Todavía no hay vacunas registradas.</p> : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="text-tinta-500"><tr><th className="py-2 pr-3 font-semibold">Vacuna</th><th className="py-2 pr-3 font-semibold">Aplicada</th><th className="py-2 pr-3 font-semibold">Próxima dosis</th><th className="py-2 pr-3 font-semibold">Lote</th><th className="print:hidden"><span className="sr-only">Acciones</span></th></tr></thead>
              <tbody>
                {mascota.vacunas.map((v) => (
                  <tr key={v.id} className="border-t border-tinta-100">
                    <td className="py-2 pr-3 font-semibold text-tinta-800">{v.nombre}</td>
                    <td className="py-2 pr-3 text-tinta-700">{fechaCorta(v.aplicadaEn)}</td>
                    <td className={`py-2 pr-3 ${estadoVacuna(v) || 'text-tinta-400'}`}>{v.proximaDosis ? fechaCorta(v.proximaDosis) : '—'}</td>
                    <td className="py-2 pr-3 text-tinta-500">{v.lote || '—'}</td>
                    <td className="py-2 text-right print:hidden">{clinica && <button type="button" onClick={() => borrarVacuna(v.id)} aria-label={`Borrar ${v.nombre}`} className="text-tinta-400 hover:text-red-600"><Trash2 size={16} /></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {clinica ? (
      <div className="mt-5 rounded-3xl bg-white p-5 print:hidden">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-tinta-900">Historia clínica</h2>
          <button type="button" onClick={() => setFormulario('atencion')} className="inline-flex items-center gap-1 rounded-xl bg-pino-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-pino-700"><Plus size={14} /> Registrar</button>
        </div>
        {formulario === 'atencion' && <AtencionForm mascotaId={mascota.id} alGuardar={recargar} alCancelar={() => setFormulario(null)} />}
        {mascota.atenciones.length === 0 ? <p className="mt-3 text-tinta-500">Todavía no hay atenciones registradas.</p> : (
          <ol className="mt-3 space-y-3">
            {mascota.atenciones.map((a) => (
              <li key={a.id} className="border-l-4 border-mandarina-400 pl-4">
                <p className="text-sm text-tinta-500">{fechaHora(a.fecha)}</p>
                <p className="font-bold text-tinta-900">{a.motivo}</p>
                {(a.pesoKg || a.temperaturaC) && <p className="text-sm text-tinta-600">{[a.pesoKg && `${a.pesoKg} kg`, a.temperaturaC && `${a.temperaturaC} °C`].filter(Boolean).join(' · ')}</p>}
                {a.diagnostico && <p className="mt-1 text-tinta-700"><span className="font-semibold">Diagnóstico:</span> {a.diagnostico}</p>}
                {a.tratamiento && <p className="text-tinta-700"><span className="font-semibold">Tratamiento:</span> {a.tratamiento}</p>}
                <p className="mt-1 text-xs text-tinta-400">Registró: {a.registradoPor}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
      ) : (
        <p className="mt-5 rounded-3xl bg-white p-5 text-tinta-600 print:hidden">La historia clínica solo la ven el veterinario y la administración.</p>
      )}
    </section>
  );
}

export default FichaMascota;
