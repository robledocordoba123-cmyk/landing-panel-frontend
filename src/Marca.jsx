// Logo de Huellitas: una huella cuya almohadilla es un arco, como los marcos
// donde se asoman las mascotas.
function Huella({ className = '' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 44V33a12 12 0 0 1 24 0v11a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2z" transform="translate(0 -1)" />
      <ellipse cx="7.5" cy="20" rx="4.5" ry="6" transform="rotate(-18 7.5 20)" />
      <ellipse cx="18" cy="10" rx="4.5" ry="6.5" transform="rotate(-6 18 10)" />
      <ellipse cx="30" cy="10" rx="4.5" ry="6.5" transform="rotate(6 30 10)" />
      <ellipse cx="40.5" cy="20" rx="4.5" ry="6" transform="rotate(18 40.5 20)" />
    </svg>
  );
}

function Marca({ claro = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight ${claro ? 'text-crema-50' : 'text-pino-700'} ${className}`}>
      <Huella className="h-7 w-7 text-mandarina-500" />
      huellitas
    </span>
  );
}

export { Huella, Marca };
