import { describe, expect, test, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Reportes from './Reportes';
import Ajustes from './Ajustes';
import { apiFalsa } from './pruebas/api-falsa';

const REPORTE = (ruta) => {
  const url = new URL(ruta, 'http://x');
  return {
    desde: url.searchParams.get('desde'), hasta: url.searchParams.get('hasta'),
    citas: 12, atendidas: 9, ingresos: 540000, clientesNuevos: 3, inasistencia: 0.1, cancelacion: 0.2,
    porEstado: {}, porServicio: [{ nombre: 'Consulta general', citas: 8, atendidas: 6, ingresos: 360000 }],
    porOrigen: { WEB: 9, WHATSAPP: 3 },
    serie: { unidad: 'dia', puntos: [{ desde: '2026-11-02', citas: 4, atendidas: 3 }, { desde: '2026-11-03', citas: 8, atendidas: 6 }] },
    anterior: { desde: '2026-10-01', hasta: '2026-10-31', citas: 10, atendidas: 9, ingresos: 600000, clientesNuevos: 3, inasistencia: 0.15, cancelacion: null },
  };
};

describe('Reportes', () => {
  test('muestra los indicadores con su comparación escrita, no solo con color', async () => {
    apiFalsa({ 'GET /api/reportes': REPORTE });
    render(<Reportes alCaducarSesion={vi.fn()} />);
    expect(await screen.findByText('$540.000')).toBeInTheDocument();
    expect(screen.getByText('+20 % que el periodo anterior')).toBeInTheDocument(); // 12 contra 10 citas
    expect(screen.getByText('-10 % que el periodo anterior')).toBeInTheDocument(); // ingresos
    expect(screen.getByText('-5 puntos que el periodo anterior')).toBeInTheDocument(); // inasistencia
    expect(screen.getByText('Sin datos para comparar')).toBeInTheDocument(); // cancelación sin dato anterior
  });

  test('cada barra se puede leer con el teclado y existe la vista de tabla', async () => {
    apiFalsa({ 'GET /api/reportes': REPORTE });
    render(<Reportes alCaducarSesion={vi.fn()} />);
    expect(await screen.findByRole('button', { name: /8 citas, 6 atendidas/ })).toBeInTheDocument();
    const tabla = screen.getByRole('table');
    expect(within(tabla).getAllByRole('row')).toHaveLength(3);
  });

  test('cambiar el periodo vuelve a pedir el reporte', async () => {
    const peticiones = apiFalsa({ 'GET /api/reportes': REPORTE });
    render(<Reportes alCaducarSesion={vi.fn()} />);
    await screen.findByText('$540.000');
    await userEvent.click(screen.getByRole('button', { name: 'Últimos 90 días' }));
    expect(await screen.findByRole('button', { name: 'Últimos 90 días', pressed: true })).toBeInTheDocument();
    expect(peticiones.filter((p) => p.ruta.startsWith('/api/reportes'))).toHaveLength(2);
  });
});

describe('Ajustes', () => {
  const JORNADAS = [0, 1, 2, 3, 4, 5, 6, 7].map((dia) => ({ dia, abierto: true, abre: 480, cierra: 1140 }));

  test('si el horario deja citas por fuera, dice cuáles', async () => {
    const peticiones = apiFalsa({
      'GET /api/servicios/todos': [],
      'GET /api/horario': { lineas: [], jornadas: JORNADAS, cierres: [] },
      'PUT /api/horario': { estado: 409, cuerpo: { error: 'No se puede cambiar el horario. Hay 1 cita reservada que quedaría por fuera.', conflictos: [{ id: 3, inicio: '2026-11-08T14:00:00.000Z', mascota: 'Max', servicio: 'Consulta general' }] } },
    });
    const usuario = userEvent.setup();
    render(<Ajustes alCaducarSesion={vi.fn()} />);
    const domingo = (await screen.findByText('Domingo')).parentElement;
    await usuario.click(within(domingo).getByRole('checkbox'));
    await usuario.click(screen.getByRole('button', { name: 'Guardar horario' }));
    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent('quedaría por fuera');
    expect(alerta).toHaveTextContent('Max · Consulta general');
    const envio = peticiones.find((p) => p.metodo === 'PUT');
    expect(envio.cuerpo.jornadas.find((j) => j.dia === 0).abierto).toBe(false);
  });
});
