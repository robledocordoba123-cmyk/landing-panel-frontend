import PantallaAviso from './PantallaAviso';

// Página 404. El noindex (en MetaPagina) evita que los buscadores guarden direcciones que no existen.
function NoEncontrada() {
  return (
    <PantallaAviso especie="Perro" nombre="Toby" fondo="bg-mantequilla" titulo="Esta página se nos escapó.">
      <p className="mt-4 text-lg text-tinta-600">Toby la buscó por todo el parque y no apareció. Puede que el enlace esté mal escrito.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
        <a href="/" className="rounded-full bg-pino-700 px-6 py-3 font-bold text-crema-50 hover:bg-pino-600">Volver al inicio</a>
        <a href="/#cita" className="rounded-full bg-mandarina-500 px-6 py-3 font-bold text-tinta-900 hover:bg-mandarina-400">Reservar una cita</a>
      </div>
    </PantallaAviso>
  );
}

export default NoEncontrada;
