import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Marca } from './Marca';

const VERSION = 'Noviembre de 2026';

// Política de tratamiento de datos (Ley 1581 de 2012). Huellitas es un negocio
// ficticio: un negocio real debe completarla con sus datos y revisarla con un abogado.
function Privacidad() {
  return (
    <div className="min-h-screen bg-crema-100 px-5 py-10">
      <main className="mx-auto max-w-2xl">
        <Marca />
        <Link to="/" className="mt-6 flex items-center gap-1 text-sm font-medium text-tinta-500 hover:text-tinta-900"><ArrowLeft size={14} /> Volver a la página</Link>
        <h1 className="mt-6 text-4xl font-extrabold leading-tight text-pino-700">Política de tratamiento de datos</h1>
        <p className="mt-2 text-sm text-tinta-500">Versión: {VERSION}. Huellitas Veterinaria es un negocio ficticio de demostración.</p>

        <div className="mt-8 space-y-6 text-tinta-700">
          <section>
            <h2 className="text-xl font-bold text-tinta-900">Qué datos usamos</h2>
            <p className="mt-1">Tu nombre, correo y teléfono, los datos de tu mascota y lo que nos cuentes al reservar. El equipo registra la historia clínica de cada atención.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-tinta-900">Para qué</h2>
            <p className="mt-1">Para agendar y confirmar tus citas, enviarte recordatorios, atender a tu mascota y responder tus preguntas. No vendemos tus datos ni los usamos para publicidad de terceros.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-tinta-900">Tus derechos</h2>
            <p className="mt-1">Según la Ley 1581 de 2012 puedes conocer, actualizar y rectificar tus datos, pedir prueba de tu autorización, revocarla y solicitar que los suprimamos. También puedes presentar quejas ante la Superintendencia de Industria y Comercio.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-tinta-900">Quién puede verlos</h2>
            <p className="mt-1">Solo el equipo, según su función: recepción ve los datos de contacto, y el diagnóstico solo lo ven el veterinario y la administración. Cada acceso a una historia queda registrado.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-tinta-900">Cuánto tiempo los guardamos</h2>
            <p className="mt-1">Mientras seas cliente. Si pides suprimirlos, borramos tus datos personales; los registros clínicos de la mascota se conservan sin identificarte.</p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Privacidad;
