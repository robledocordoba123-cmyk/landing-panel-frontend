import { useEffect } from 'react';

const SITIO = 'https://huellitas-veterinaria.vercel.app';
const NOMBRE = 'Huellitas Veterinaria';

// Título de la pestaña y lo que ven los buscadores en cada página. Las páginas
// privadas (panel, login, enlace de una cita) piden no aparecer en Google; las
// públicas dicen cuál es su dirección oficial.
function MetaPagina({ titulo, ruta, privada = false }) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · ${NOMBRE}` : `${NOMBRE} · Reserva tu cita en Medellín`;
  }, [titulo]);
  return privada ? <meta name="robots" content="noindex, nofollow" /> : <link rel="canonical" href={`${SITIO}${ruta}`} />;
}

export default MetaPagina;
