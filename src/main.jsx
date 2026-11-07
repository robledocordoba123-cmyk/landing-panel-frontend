import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LimiteDeError from './LimiteDeError'

// Tras publicar una versión nueva, una pestaña abierta puede pedir partes que ya no
// existen: se recarga una vez para traer la versión nueva en vez de fallar.
window.addEventListener('vite:preloadError', (evento) => {
  try {
    if (sessionStorage.getItem('huellitas_recargada')) return
    sessionStorage.setItem('huellitas_recargada', '1')
  } catch {
    return
  }
  evento.preventDefault()
  window.location.reload()
})
window.addEventListener('load', () => {
  try {
    setTimeout(() => sessionStorage.removeItem('huellitas_recargada'), 10000)
  } catch {
    // Sin almacenamiento no hay nada que limpiar.
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LimiteDeError>
      <App />
    </LimiteDeError>
  </StrictMode>,
)
