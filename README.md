# Huellitas Veterinaria · Landing page con panel (frontend)

Página web para un negocio local (una veterinaria **ficticia**, creada como proyecto de portafolio) donde los clientes piden cita desde el celular, y un **panel privado** donde el negocio ve las solicitudes y las marca como atendidas.

## Qué incluye

- **Landing page adaptable al celular:** servicios, horarios, preguntas frecuentes y botón "Pedir cita" siempre a la vista.
- **Formulario de cita** con validación (nombre, correo, teléfono, mascota, servicio y mensaje) y mensajes claros de error o de éxito.
- **Panel del negocio** con login: contador de solicitudes por atender y atendidas, filtros, y botón para marcar como atendida o deshacer.
- La sesión vence sola y, si el token ya no sirve, el panel devuelve al login.

## Tecnologías

React 19 · Vite · Tailwind CSS 4 · React Router · lucide-react

## Cómo correrlo

```bash
npm install
npm run dev        # http://localhost:5173 (la API debe estar en http://localhost:3001)
```

Variables (ver `.env.example`):

| Variable | Para qué |
|---|---|
| `VITE_API_URL` | Dirección de la API al publicar (en local no hace falta) |
| `VITE_MODO_DEMO` | `true` muestra en el login el botón de la cuenta de demostración |

## API

Backend en [landing-panel-backend](https://github.com/robledocordoba123-cmyk/landing-panel-backend).

---
Diseño y desarrollo: Manuela Córdoba Robledo.
