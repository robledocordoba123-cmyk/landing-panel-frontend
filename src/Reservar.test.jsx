import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Reservar from './Reservar';
import { apiFalsa } from './pruebas/api-falsa';

const SERVICIOS = [
  { id: 1, nombre: 'Consulta general', duracionMin: 30, precioDesde: 60000, reservable: true },
  { id: 4, nombre: 'Urgencias', duracionMin: 30, precioDesde: 90000, reservable: false },
];
const INICIO = '2026-11-20T14:00:00.000Z';

const mostrar = () => render(<MemoryRouter><Reservar /></MemoryRouter>);

describe('Reservar una cita', () => {
  test('recorre los tres pasos y envía la autorización de datos', async () => {
    const peticiones = apiFalsa({
      'GET /api/servicios': SERVICIOS,
      'GET /api/disponibilidad': { fecha: '2026-11-20', cerrado: null, horarios: [{ inicio: INICIO, hora: '9:00 a. m.' }] },
      'POST /api/citas': { estado: 201, cuerpo: { id: 7, servicio: 'Consulta general', inicio: INICIO, estado: 'PENDIENTE', token: '7.firma' } },
    });
    const usuario = userEvent.setup();
    mostrar();

    // Las urgencias no se reservan: no aparecen como opción.
    expect(await screen.findByRole('button', { name: /Consulta general/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Urgencias/ })).not.toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: /Consulta general/ }));
    await usuario.click(await screen.findByRole('button', { name: '9:00 a. m.' }));
    await usuario.type(screen.getByLabelText('Tu nombre'), 'Laura Gómez');
    await usuario.type(screen.getByLabelText('Teléfono'), '300 000 0001');
    await usuario.type(screen.getByLabelText('Correo'), 'laura@correo.com');
    await usuario.type(screen.getByLabelText('Nombre de tu mascota'), 'Toby');
    await usuario.click(screen.getByRole('checkbox'));
    await usuario.click(screen.getByRole('button', { name: /Reservar cita/ }));

    expect(await screen.findByText('¡Tu cita quedó reservada!')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver mi cita' })).toHaveAttribute('href', '/mi-cita/7.firma');
    const envio = peticiones.find((p) => p.metodo === 'POST');
    expect(envio.cuerpo).toMatchObject({ servicioId: 1, inicio: INICIO, nombre: 'Laura Gómez', mascota: 'Toby', especie: 'Perro', autorizaDatos: true });
  });

  test('sin marcar la autorización, el navegador no deja enviar', async () => {
    const peticiones = apiFalsa({
      'GET /api/servicios': SERVICIOS,
      'GET /api/disponibilidad': { horarios: [{ inicio: INICIO, hora: '9:00 a. m.' }] },
    });
    const usuario = userEvent.setup();
    mostrar();
    await usuario.click(await screen.findByRole('button', { name: /Consulta general/ }));
    await usuario.click(await screen.findByRole('button', { name: '9:00 a. m.' }));
    expect(screen.getByRole('checkbox')).toBeRequired();
    await usuario.click(screen.getByRole('button', { name: /Reservar cita/ }));
    expect(peticiones.some((p) => p.metodo === 'POST')).toBe(false);
  });

  test('un día cerrado dice el motivo', async () => {
    apiFalsa({
      'GET /api/servicios': SERVICIOS,
      'GET /api/disponibilidad': { horarios: [], cerrado: 'Vacaciones del equipo' },
    });
    const usuario = userEvent.setup();
    mostrar();
    await usuario.click(await screen.findByRole('button', { name: /Consulta general/ }));
    expect(await screen.findByText('Ese día estamos cerrados: Vacaciones del equipo. Prueba con otro.')).toBeInTheDocument();
  });

  test('si otra persona toma el horario, lo explica y vuelve a los horarios', async () => {
    apiFalsa({
      'GET /api/servicios': SERVICIOS,
      'GET /api/disponibilidad': { horarios: [{ inicio: INICIO, hora: '9:00 a. m.' }] },
      'POST /api/citas': { estado: 409, cuerpo: { error: 'Alguien acaba de reservar ese horario. Elige otro, por favor.' } },
    });
    const usuario = userEvent.setup();
    mostrar();
    await usuario.click(await screen.findByRole('button', { name: /Consulta general/ }));
    await usuario.click(await screen.findByRole('button', { name: '9:00 a. m.' }));
    for (const [campo, valor] of [['Tu nombre', 'Ana'], ['Teléfono', '300 000 0002'], ['Correo', 'ana@correo.com'], ['Nombre de tu mascota', 'Lola']]) {
      await usuario.type(screen.getByLabelText(campo), valor);
    }
    await usuario.click(screen.getByRole('checkbox'));
    await usuario.click(screen.getByRole('button', { name: /Reservar cita/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Alguien acaba de reservar ese horario');
    expect(screen.getByText('¿Qué día?')).toBeInTheDocument();
  });
});
