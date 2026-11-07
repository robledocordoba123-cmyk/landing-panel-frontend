import { Arco } from './Mascota';
import { Marca } from './Marca';

// Pantalla completa para cuando algo no sale como debía. No usa el enrutador: el
// aviso de error se muestra justo cuando la aplicación pudo haber fallado.
function PantallaAviso({ especie, nombre, fondo, titulo, children }) {
  return (
    <main className="flex min-h-screen flex-col bg-crema-100 px-5 py-8">
      <a href="/" aria-label="Huellitas, ir al inicio" className="self-start"><Marca /></a>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 py-10 text-center sm:flex-row sm:text-left">
        <Arco especie={especie} nombre={nombre} fondo={fondo} className="h-56 w-44 shrink-0" />
        <div>
          <h1 className="text-4xl font-extrabold leading-tight text-pino-700 sm:text-5xl">{titulo}</h1>
          {children}
        </div>
      </div>
    </main>
  );
}

export default PantallaAviso;
