# Huellitas Veterinaria · Landing page con panel (frontend)

Página web para un negocio local (una veterinaria **ficticia**, creada como proyecto de portafolio) donde los clientes reservan su cita eligiendo día y hora, y un **panel privado** donde el negocio maneja su agenda.

**Demo en vivo:** [huellitas-veterinaria.vercel.app](https://huellitas-veterinaria.vercel.app). Para ver el panel, abre "Panel del negocio" al final de la página y usa el botón "Entrar con la cuenta de demostración". El simulador de WhatsApp está en [/whatsapp](https://huellitas-veterinaria.vercel.app/whatsapp).

## Qué incluye

- **Landing page adaptable al celular:** servicios, horarios, preguntas frecuentes y botón "Pedir cita" siempre a la vista.
- **Reserva en tres pasos:** servicio, día y hora (solo horarios realmente libres) y datos de contacto.
- **Panel del negocio:** agenda por día, clientes con buscador, ficha de cada mascota con historia clínica y carné de vacunas para imprimir, aviso de vacunas por renovar y bandeja de mensajes.
- La sesión vence sola y, si el token ya no sirve, el panel devuelve al login.
- **Asistente de WhatsApp** (`/whatsapp`): simulador con apariencia de WhatsApp que habla con el mismo bot que atiende el WhatsApp real. Agenda citas, responde servicios y horarios, y pasa a una persona. Las citas que agenda llegan al panel con la etiqueta "WhatsApp".

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
| `VITE_MODO_DEMO` | `true` muestra en el login el botón de la cuenta de demostración y, en el formulario, el aviso de no escribir datos reales |

## API

Backend en [landing-panel-backend](https://github.com/robledocordoba123-cmyk/landing-panel-backend).

---
Diseño y desarrollo: Manuela Córdoba Robledo.

## Uso de inteligencia artificial

Este proyecto se desarrolló con apoyo de herramientas de IA (Claude Code). El diseño, las decisiones, la revisión del código y las pruebas son míos, y puedo explicar cada parte.
