import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { api } from './api';
import { fechaHoy, sumarDias } from './horarios';

const pesos = (n) => `$${n.toLocaleString('es-CO')}`;
const porcentaje = (p) => (p === null ? '—' : `${Math.round(p * 100)} %`);
const fechaCorta = (f, conAnio) => new Date(`${f}T12:00:00Z`).toLocaleDateString('es-CO', { timeZone: 'UTC', day: 'numeric', month: 'short', ...(conAnio ? { year: 'numeric' } : {}) });
const mes = (f) => new Date(`${f}T12:00:00Z`).toLocaleDateString('es-CO', { timeZone: 'UTC', month: 'short' });

function periodos() {
  const hoy = fechaHoy();
  const inicioMes = `${hoy.slice(0, 7)}-01`;
  const finMesPasado = sumarDias(inicioMes, -1);
  return [
    { valor: 'mes', texto: 'Este mes', desde: inicioMes, hasta: hoy },
    { valor: 'pasado', texto: 'Mes pasado', desde: `${finMesPasado.slice(0, 7)}-01`, hasta: finMesPasado },
    { valor: '90', texto: 'Últimos 90 días', desde: sumarDias(hoy, -89), hasta: hoy },
    { valor: 'anio', texto: 'Este año', desde: `${hoy.slice(0, 4)}-01-01`, hasta: hoy },
  ];
}

// Comparación con el periodo anterior: con flecha y texto, nunca solo con color.
function Cambio({ actual, anterior, puntos }) {
  if (anterior === null || actual === null) return <p className="mt-1 text-xs text-tinta-500">Sin datos para comparar</p>;
  const diferencia = puntos ? Math.round((actual - anterior) * 100) : actual - anterior;
  const relativo = !puntos && anterior ? Math.round((diferencia / anterior) * 100) : null;
  const Icono = diferencia > 0 ? ArrowUpRight : diferencia < 0 ? ArrowDownRight : Minus;
  const texto = puntos ? `${diferencia > 0 ? '+' : ''}${diferencia} puntos` : relativo !== null ? `${relativo > 0 ? '+' : ''}${relativo} %` : `${diferencia > 0 ? '+' : ''}${diferencia}`;
  return <p className="mt-1 inline-flex items-center gap-1 text-xs text-tinta-500"><Icono size={14} aria-hidden="true" /> {diferencia === 0 ? 'Igual' : texto} que el periodo anterior</p>;
}

function Indicador({ titulo, valor, cambio, nota }) {
  return (
    <div className="rounded-2xl bg-white p-5">
      <p className="text-sm font-semibold text-tinta-600">{titulo}</p>
      <p className="mt-1 font-display text-3xl font-extrabold text-tinta-900">{valor}</p>
      {cambio}
      {nota && <p className="mt-1 text-xs text-tinta-500">{nota}</p>}
    </div>
  );
}

const etiquetaPunto = (p, unidad) => (unidad === 'mes' ? mes(p.desde) : unidad === 'semana' ? `Sem. ${fechaCorta(p.desde)}` : fechaCorta(p.desde));

// Barras verticales de una sola serie. Cada barra muestra su detalle al pasar el
// mouse o al enfocarla con el teclado.
function GraficoCitas({ serie }) {
  const [activo, setActivo] = useState(null);
  const maximo = Math.max(1, ...serie.puntos.map((p) => p.citas));
  const n = serie.puntos.length;
  const cada = Math.ceil(n / 6); // pocas etiquetas en el eje para que no se pisen
  const unidad = { dia: 'día', semana: 'semana', mes: 'mes' }[serie.unidad];
  const punto = activo !== null ? serie.puntos[activo] : null;

  return (
    <figure className="rounded-3xl bg-white p-5">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-bold text-tinta-900">Citas por {unidad}</span>
        <span className="text-xs text-tinta-500">Sin contar las canceladas</span>
      </figcaption>
      <div className="relative mt-4 grid grid-cols-[2rem_1fr] gap-2">
        <div className="flex h-48 flex-col justify-between text-right text-xs text-tinta-500" aria-hidden="true">
          <span>{maximo}</span><span>0</span>
        </div>
        <div className="relative h-48 border-b border-tinta-300" onMouseLeave={() => setActivo(null)}>
          <div className="absolute inset-x-0 top-0 border-t border-dashed border-tinta-200" aria-hidden="true" />
          <div className="flex h-full items-end gap-0.5">
            {serie.puntos.map((p, i) => (
              <button key={p.desde} type="button" onMouseEnter={() => setActivo(i)} onFocus={() => setActivo(i)} onBlur={() => setActivo(null)}
                aria-label={`${etiquetaPunto(p, serie.unidad)}: ${p.citas} citas, ${p.atendidas} atendidas`}
                className="group flex h-full min-w-0 flex-1 items-end focus:outline-none">
                <span className={`mx-auto block w-full max-w-10 rounded-t-[4px] transition-colors ${activo === i ? 'bg-pino-700' : 'bg-pino-500'} group-focus-visible:ring-2 group-focus-visible:ring-mandarina-500`}
                  style={{ height: `${(p.citas / maximo) * 100}%`, minHeight: p.citas ? 2 : 0 }} />
              </button>
            ))}
          </div>
          {punto && (
            <div className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-tinta-900 px-3 py-2 text-xs text-crema-50 shadow-lg"
              style={{ left: `${((activo + 0.5) / n) * 100}%` }}>
              <p className="font-bold">{etiquetaPunto(punto, serie.unidad)}</p>
              <p>{punto.citas} citas · {punto.atendidas} atendidas</p>
            </div>
          )}
        </div>
        <div />
        <div className="relative h-5 text-xs text-tinta-500" aria-hidden="true">
          {serie.puntos.map((p, i) => (i % cada === 0 ? (
            <span key={p.desde} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${((i + 0.5) / n) * 100}%` }}>{etiquetaPunto(p, serie.unidad)}</span>
          ) : null))}
        </div>
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-semibold text-pino-700">Ver como tabla</summary>
        <table className="mt-2 w-full text-left">
          <thead><tr className="text-tinta-500"><th className="py-1 font-semibold">Periodo</th><th className="font-semibold">Citas</th><th className="font-semibold">Atendidas</th></tr></thead>
          <tbody>
            {serie.puntos.map((p) => <tr key={p.desde} className="border-t border-tinta-100"><td className="py-1">{etiquetaPunto(p, serie.unidad)}</td><td>{p.citas}</td><td>{p.atendidas}</td></tr>)}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

// Barras horizontales con su etiqueta y su número escritos: se leen sin el color.
function Barras({ titulo, filas }) {
  const maximo = Math.max(1, ...filas.map((f) => f.valor));
  return (
    <figure className="rounded-3xl bg-white p-5">
      <figcaption className="font-bold text-tinta-900">{titulo}</figcaption>
      {filas.length === 0 && <p className="mt-3 text-sm text-tinta-500">Sin citas en este periodo.</p>}
      <ul className="mt-3 space-y-3">
        {filas.map((f) => (
          <li key={f.etiqueta}>
            <div className="flex justify-between gap-3 text-sm"><span className="text-tinta-800">{f.etiqueta}</span><span className="font-semibold text-tinta-900">{f.texto}</span></div>
            <div className="mt-1 h-2 rounded-full bg-crema-100">
              <div className="h-2 rounded-full bg-pino-500" style={{ width: `${(f.valor / maximo) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}

// Reportes del negocio, solo para administración.
function Reportes({ alCaducarSesion }) {
  const opciones = periodos();
  const [periodo, setPeriodo] = useState('mes');
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const elegido = opciones.find((o) => o.valor === periodo);

  useEffect(() => {
    let vigente = true;
    api(`/api/reportes?desde=${elegido.desde}&hasta=${elegido.hasta}`)
      .then((d) => {
        if (!vigente) return;
        setDatos(d);
        setError('');
      })
      .catch((err) => {
        if (!vigente) return;
        if (err.estado === 401) alCaducarSesion();
        else setError(err.message);
      });
    return () => {
      vigente = false;
    };
  }, [elegido.desde, elegido.hasta, alCaducarSesion]);

  const r = datos?.desde === elegido.desde && datos?.hasta === elegido.hasta ? datos : null;

  return (
    <section>
      <h1 className="text-4xl font-extrabold text-pino-700">Reportes</h1>
      <p className="text-tinta-600">{fechaCorta(elegido.desde, true)} a {fechaCorta(elegido.hasta, true)}{r && `, comparado con ${fechaCorta(r.anterior.desde)} a ${fechaCorta(r.anterior.hasta, true)}`}.</p>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Periodo">
        {opciones.map((o) => (
          <button key={o.valor} type="button" onClick={() => setPeriodo(o.valor)} aria-pressed={periodo === o.valor}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${periodo === o.valor ? 'bg-pino-600 text-white' : 'bg-white text-tinta-600 hover:bg-tinta-100'}`}>
            {o.texto}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-red-700" role="alert">{error}</p>}
      {!r && !error && <p className="py-16 text-center text-tinta-400">Calculando…</p>}

      {r && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Indicador titulo="Citas" valor={r.citas} cambio={<Cambio actual={r.citas} anterior={r.anterior.citas} />} />
            <Indicador titulo="Atendidas" valor={r.atendidas} cambio={<Cambio actual={r.atendidas} anterior={r.anterior.atendidas} />} />
            <Indicador titulo="Ingresos estimados" valor={pesos(r.ingresos)} cambio={<Cambio actual={r.ingresos} anterior={r.anterior.ingresos} />} nota="Con el precio base de cada servicio atendido." />
            <Indicador titulo="Clientes nuevos" valor={r.clientesNuevos} cambio={<Cambio actual={r.clientesNuevos} anterior={r.anterior.clientesNuevos} />} />
            <Indicador titulo="No asistieron" valor={porcentaje(r.inasistencia)} cambio={<Cambio actual={r.inasistencia} anterior={r.anterior.inasistencia} puntos />} nota="De las citas que ya pasaron." />
            <Indicador titulo="Canceladas" valor={porcentaje(r.cancelacion)} cambio={<Cambio actual={r.cancelacion} anterior={r.anterior.cancelacion} puntos />} />
          </div>

          <div className="mt-6"><GraficoCitas serie={r.serie} /></div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Barras titulo="Servicios más pedidos" filas={r.porServicio.map((s) => ({ etiqueta: s.nombre, valor: s.citas, texto: `${s.citas} ${s.citas === 1 ? "cita" : "citas"} · ${pesos(s.ingresos)}` }))} />
            <Barras titulo="Por dónde reservan" filas={[
              { etiqueta: 'Página web', valor: r.porOrigen.WEB, texto: String(r.porOrigen.WEB) },
              { etiqueta: 'WhatsApp', valor: r.porOrigen.WHATSAPP, texto: String(r.porOrigen.WHATSAPP) },
            ]} />
          </div>
        </>
      )}
    </section>
  );
}

export default Reportes;
