import { Component } from 'react';
import PantallaAviso from './PantallaAviso';

// Si un componente falla al dibujarse, React borraría toda la página y dejaría la
// pantalla en blanco. Esto la reemplaza por un aviso con salida. Los límites de error
// de React todavía solo existen como clases.
class LimiteDeError extends Component {
  state = { conError: false };

  static getDerivedStateFromError() {
    return { conError: true };
  }

  componentDidCatch(error, info) {
    console.error('Error al dibujar la página', error, info.componentStack);
  }

  render() {
    if (!this.state.conError) return this.props.children;
    return (
      <PantallaAviso especie="Gato" nombre="Misha" fondo="bg-lila" titulo="Algo se nos enredó.">
        <p className="mt-4 text-lg text-tinta-600" role="alert">La página tuvo un problema. Recargar suele arreglarlo; si vuelve a pasar, intenta de nuevo en un rato.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
          <button type="button" onClick={() => window.location.reload()} className="rounded-full bg-pino-700 px-6 py-3 font-bold text-crema-50 hover:bg-pino-600">Recargar</button>
          <a href="/" className="rounded-full bg-crema-50 px-6 py-3 font-bold text-tinta-800 hover:bg-crema-200">Ir al inicio</a>
        </div>
      </PantallaAviso>
    );
  }
}

export default LimiteDeError;
