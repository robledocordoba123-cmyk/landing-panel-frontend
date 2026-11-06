// Mascotas ilustradas a mano para Huellitas, en SVG: son parte de la marca, pesan
// casi nada y no dependen de fotos de banco. Todas comparten trazo y ojos para
// verse como una misma familia. El tono cambia según el nombre de la mascota.
const TINTA = '#1B2A26';
const LENGUA = '#F58E8E';
const OREJA_INTERNA = '#F9B9A7';

const PELAJES = {
  Perro: [
    { base: '#D99A5B', oreja: '#9C5F2E', claro: '#F6DFC0' },
    { base: '#F1E4CF', oreja: '#B88A5B', claro: '#FFF7EA' },
    { base: '#5B4436', oreja: '#3A2A22', claro: '#C9A98C' },
  ],
  Gato: [
    { base: '#F2A65A', oreja: '#D98338', claro: '#FFE9D2' },
    { base: '#8D94A3', oreja: '#6A7180', claro: '#E9ECF2' },
    { base: '#3B3A44', oreja: '#26252D', claro: '#8B8A96' },
  ],
  Conejo: [
    { base: '#F5EDE1', oreja: '#E6D6C2', claro: '#FFFFFF' },
    { base: '#C9B19A', oreja: '#A88D74', claro: '#F0E4D6' },
  ],
  Ave: [
    { base: '#3FB68B', oreja: '#2B8F6B', claro: '#FFE27A' },
    { base: '#4C9BE8', oreja: '#2F75BF', claro: '#FFE27A' },
    { base: '#F2685C', oreja: '#CC4438', claro: '#FFE27A' },
  ],
  Otro: [
    { base: '#E3B98A', oreja: '#C4935F', claro: '#FFF3E2' },
    { base: '#BFA2DB', oreja: '#9A7CBD', claro: '#F3EAFB' },
  ],
};

const COLLARES = ['#F56A2B', '#6C5CE7', '#E0457B', '#1D4A40'];

// El mismo nombre da siempre el mismo tono, para reconocer a cada mascota.
function tonoDe(nombre = '') {
  return [...nombre].reduce((suma, letra) => suma + letra.charCodeAt(0), 0);
}

function Ojos({ izq = 80, der = 120, y = 98 }) {
  return (
    <>
      <circle cx={izq} cy={y} r="7.5" fill={TINTA} />
      <circle cx={der} cy={y} r="7.5" fill={TINTA} />
      <circle cx={izq + 2.5} cy={y - 2.5} r="2.6" fill="#fff" />
      <circle cx={der + 2.5} cy={y - 2.5} r="2.6" fill="#fff" />
    </>
  );
}

function Collar({ color, y = 158 }) {
  return (
    <>
      <rect x="56" y={y} width="88" height="13" rx="6.5" fill={color} />
      <circle cx="100" cy={y + 21} r="9" fill="#FFCB57" stroke={TINTA} strokeWidth="2.5" />
      <path d={`M96 ${y + 21}h8`} stroke={TINTA} strokeWidth="2.5" strokeLinecap="round" />
    </>
  );
}

function Perro({ p, collar }) {
  return (
    <>
      <path d="M58 200c0-34 18-48 42-48s42 14 42 48z" fill={p.base} />
      <Collar color={collar} />
      <rect x="50" y="46" width="100" height="112" rx="48" fill={p.base} />
      <path d="M100 46c26 0 44 16 48 40-16 2-30-8-34-22-2 10-6 16-14 20z" fill={p.claro} opacity=".55" />
      <path d="M56 62C28 58 18 96 30 124c8 16 28 6 30-18 1-14 2-30-4-44z" fill={p.oreja} />
      <path d="M144 62c28-4 38 34 26 62-8 16-28 6-30-18-1-14-2-30 4-44z" fill={p.oreja} />
      <ellipse cx="100" cy="128" rx="33" ry="26" fill={p.claro} />
      <Ojos y={96} />
      <path d="M88 113c0-5 24-5 24 0 0 6-8 11-12 11s-12-5-12-11z" fill={TINTA} />
      <path d="M100 124v9M84 133c6 8 26 8 32 0" fill="none" stroke={TINTA} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M92 137h16v9c0 11-16 11-16 0z" fill={LENGUA} />
    </>
  );
}

function Gato({ p, collar }) {
  return (
    <>
      <path d="M58 200c0-34 18-48 42-48s42 14 42 48z" fill={p.base} />
      <Collar color={collar} />
      <path d="M52 92 46 28c-1-6 5-9 10-6l44 30z" fill={p.base} />
      <path d="m148 92 6-64c1-6-5-9-10-6l-44 30z" fill={p.base} />
      <path d="m60 66-4-30 26 18z" fill={OREJA_INTERNA} />
      <path d="m140 66 4-30-26 18z" fill={OREJA_INTERNA} />
      <ellipse cx="100" cy="106" rx="57" ry="52" fill={p.base} />
      <path d="M100 56v14M84 60l3 12M116 60l-3 12" stroke={p.oreja} strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="100" cy="128" rx="27" ry="20" fill={p.claro} />
      <Ojos izq={76} der={124} y={102} />
      <path d="m94 120 12 0-6 7z" fill={LENGUA} stroke={LENGUA} strokeWidth="3" strokeLinejoin="round" />
      <path d="M100 128c-1 8-9 9-14 5M100 128c1 8 9 9 14 5" fill="none" stroke={TINTA} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M58 122 30 116M58 132l-27 4M142 122l28-6M142 132l27 4" stroke={TINTA} strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

function Conejo({ p, collar }) {
  return (
    <>
      <path d="M58 200c0-34 18-48 42-48s42 14 42 48z" fill={p.base} />
      <Collar color={collar} />
      <rect x="62" y="-6" width="30" height="96" rx="15" fill={p.base} transform="rotate(-8 77 42)" />
      <rect x="108" y="-6" width="30" height="96" rx="15" fill={p.base} transform="rotate(8 123 42)" />
      <rect x="71" y="8" width="12" height="70" rx="6" fill={OREJA_INTERNA} transform="rotate(-8 77 42)" />
      <rect x="117" y="8" width="12" height="70" rx="6" fill={OREJA_INTERNA} transform="rotate(8 123 42)" />
      <ellipse cx="100" cy="112" rx="52" ry="48" fill={p.base} />
      <circle cx="68" cy="124" r="11" fill={OREJA_INTERNA} opacity=".6" />
      <circle cx="132" cy="124" r="11" fill={OREJA_INTERNA} opacity=".6" />
      <Ojos izq={78} der={122} y={106} />
      <path d="m93 122 14 0-7 7z" fill={LENGUA} stroke={LENGUA} strokeWidth="3" strokeLinejoin="round" />
      <path d="M100 129v6" stroke={TINTA} strokeWidth="3" strokeLinecap="round" />
      <rect x="91" y="135" width="18" height="13" rx="3" fill="#fff" stroke={TINTA} strokeWidth="2.5" />
      <path d="M100 135v13" stroke={TINTA} strokeWidth="2.5" />
    </>
  );
}

function Ave({ p }) {
  return (
    <>
      <path d="M100 42c-4-14 2-26 12-30-1 10 2 16 6 20 2-10 8-16 16-18-3 12-3 22-10 34z" fill={p.oreja} />
      <path d="M46 200c0-30 4-56 10-82 6-34 26-62 52-62 30 0 46 26 46 58 0 34 4 60 2 86z" fill={p.base} />
      <path d="M120 200c-4-26 0-54 18-74 10 22 16 50 16 74z" fill={p.oreja} />
      <ellipse cx="92" cy="170" rx="30" ry="34" fill={p.claro} opacity=".85" />
      <circle cx="84" cy="96" r="20" fill="#fff" />
      <circle cx="84" cy="96" r="8" fill={TINTA} />
      <circle cx="87" cy="93" r="2.8" fill="#fff" />
      <path d="M56 104c-16 2-26 14-22 30 3 10 14 12 18 4 2-6 6-10 14-12z" fill="#FFCB57" stroke={TINTA} strokeWidth="3" strokeLinejoin="round" />
    </>
  );
}

function Otro({ p, collar }) {
  return (
    <>
      <ellipse cx="100" cy="176" rx="62" ry="52" fill={p.base} />
      <circle cx="56" cy="74" r="20" fill={p.oreja} />
      <circle cx="144" cy="74" r="20" fill={p.oreja} />
      <circle cx="56" cy="74" r="10" fill={OREJA_INTERNA} />
      <circle cx="144" cy="74" r="10" fill={OREJA_INTERNA} />
      <ellipse cx="100" cy="112" rx="60" ry="54" fill={p.base} />
      <ellipse cx="58" cy="130" rx="20" ry="17" fill={p.claro} />
      <ellipse cx="142" cy="130" rx="20" ry="17" fill={p.claro} />
      <Ojos izq={78} der={122} y={104} />
      <path d="m94 120 12 0-6 7z" fill={LENGUA} stroke={LENGUA} strokeWidth="3" strokeLinejoin="round" />
      <path d="M100 127c-1 7-8 8-12 4M100 127c1 7 8 8 12 4" fill="none" stroke={TINTA} strokeWidth="3" strokeLinecap="round" />
      <rect x="66" y="166" width="68" height="11" rx="5.5" fill={collar} />
    </>
  );
}

const FIGURAS = { Perro, Gato, Conejo, Ave, Otro };

// nombre: define el tono. etiqueta: texto para lectores de pantalla (sin él, es decorativa).
function Mascota({ especie = 'Otro', nombre = '', etiqueta, className = '' }) {
  const Figura = FIGURAS[especie] || Otro;
  const tonos = PELAJES[especie] || PELAJES.Otro;
  const tono = tonoDe(nombre);
  return (
    <svg viewBox="0 0 200 200" className={className} role={etiqueta ? 'img' : undefined} aria-label={etiqueta} aria-hidden={etiqueta ? undefined : true}>
      <Figura p={tonos[tono % tonos.length]} collar={COLLARES[tono % COLLARES.length]} />
    </svg>
  );
}

const FONDOS = ['bg-mantequilla', 'bg-lila', 'bg-menta', 'bg-cielo', 'bg-durazno'];

// Marco en forma de arco, el sello visual de Huellitas: la mascota se asoma.
function Arco({ especie, nombre, etiqueta, fondo, className = '' }) {
  const color = fondo || FONDOS[tonoDe(nombre) % FONDOS.length];
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-t-full ${color} ${className}`}>
      <Mascota especie={especie} nombre={nombre} etiqueta={etiqueta} className="absolute bottom-0 left-1/2 w-[112%] max-w-none -translate-x-1/2" />
    </span>
  );
}

export { Arco, Mascota };
