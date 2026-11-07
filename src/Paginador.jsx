import { ChevronLeft, ChevronRight } from 'lucide-react';

const boton = 'grid h-9 w-9 place-items-center rounded-full bg-white disabled:opacity-40';

// Anterior y siguiente de un listado largo.
function Paginador({ pagina, paginas, alCambiar }) {
  return (
    <div className="flex items-center gap-2 text-sm text-tinta-600">
      <button type="button" disabled={pagina <= 1} onClick={() => alCambiar(pagina - 1)} aria-label="Página anterior" className={boton}><ChevronLeft size={16} /></button>
      {pagina} de {paginas}
      <button type="button" disabled={pagina >= paginas} onClick={() => alCambiar(pagina + 1)} aria-label="Página siguiente" className={boton}><ChevronRight size={16} /></button>
    </div>
  );
}

export default Paginador;
