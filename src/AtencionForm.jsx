import { useState } from 'react';
import { Stethoscope } from 'lucide-react';
import { api } from './api';

const campo = 'mt-1 w-full rounded-xl border border-tinta-300 bg-white px-3 py-2 text-tinta-800 outline-none focus:border-pino-500 focus:ring-4 focus:ring-pino-100';
const numero = (v) => (v === '' ? undefined : Number(v));

// Registra una atención en la historia clínica. Si viene de una cita, la API
// marca esa cita como atendida en la misma operación.
function AtencionForm({ mascotaId, citaId, motivoInicial = '', alGuardar, alCancelar }) {
  const [datos, setDatos] = useState({ motivo: motivoInicial, diagnostico: '', tratamiento: '', pesoKg: '', temperaturaC: '' });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const cambiar = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await api(`/api/mascotas/${mascotaId}/atenciones`, {
        metodo: 'POST',
        datos: { ...datos, citaId, pesoKg: numero(datos.pesoKg), temperaturaC: numero(datos.temperaturaC) },
      });
      alGuardar();
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="mt-3 grid gap-3 rounded-xl bg-tinta-50 p-4 sm:grid-cols-2">
      <label className="text-sm font-semibold text-tinta-700 sm:col-span-2">Motivo
        <input name="motivo" value={datos.motivo} onChange={cambiar} required minLength={3} maxLength={300} className={campo} />
      </label>
      <label className="text-sm font-semibold text-tinta-700">Peso (kg)
        <input type="number" name="pesoKg" value={datos.pesoKg} onChange={cambiar} min="0.01" max="200" step="0.01" className={campo} />
      </label>
      <label className="text-sm font-semibold text-tinta-700">Temperatura (°C)
        <input type="number" name="temperaturaC" value={datos.temperaturaC} onChange={cambiar} min="30" max="45" step="0.1" className={campo} />
      </label>
      <label className="text-sm font-semibold text-tinta-700 sm:col-span-2">Diagnóstico
        <textarea name="diagnostico" value={datos.diagnostico} onChange={cambiar} maxLength={2000} rows={2} className={campo} />
      </label>
      <label className="text-sm font-semibold text-tinta-700 sm:col-span-2">Tratamiento
        <textarea name="tratamiento" value={datos.tratamiento} onChange={cambiar} maxLength={2000} rows={2} className={campo} />
      </label>
      {error && <p className="text-sm font-medium text-red-600 sm:col-span-2" role="alert">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={enviando} className="inline-flex items-center gap-2 rounded-xl bg-pino-600 px-4 py-2 text-sm font-bold text-white hover:bg-pino-700 disabled:opacity-60">
          <Stethoscope size={16} /> {enviando ? 'Guardando…' : 'Guardar atención'}
        </button>
        <button type="button" onClick={alCancelar} className="rounded-xl bg-tinta-200 px-4 py-2 text-sm font-bold text-tinta-700 hover:bg-tinta-300">Cancelar</button>
      </div>
    </form>
  );
}

export default AtencionForm;
