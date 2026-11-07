// Datos para buscadores (schema.org): qué es el negocio y cuándo abre. El horario
// sale de la API, el mismo que se edita en el panel, así que nunca queda desfasado.
const DIAS = { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };
const hora = (m) => (m >= 1440 ? '23:59' : `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);

function DatosEstructurados({ jornadas }) {
  const datos = {
    '@context': 'https://schema.org',
    '@type': 'VeterinaryCare',
    name: 'Huellitas Veterinaria',
    description: 'Veterinaria de demostración en Medellín: consultas, vacunas, peluquería y urgencias, con reservas en línea.',
    url: 'https://huellitas-veterinaria.vercel.app/',
    image: 'https://huellitas-veterinaria.vercel.app/og.png',
    logo: 'https://huellitas-veterinaria.vercel.app/favicon.svg',
    areaServed: { '@type': 'City', name: 'Medellín' },
    priceRange: '$$',
    ...(jornadas && {
      openingHoursSpecification: jornadas
        .filter((j) => j.dia in DIAS && j.abierto)
        .map((j) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: DIAS[j.dia], opens: hora(j.abre), closes: hora(j.cierra) })),
    }),
  };
  return <script type="application/ld+json">{JSON.stringify(datos)}</script>;
}

export default DatosEstructurados;
