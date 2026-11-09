import { expect, test } from '@playwright/test';
import { diaConHorarios } from './ayuda';

async function entrarComo(page, rol) {
  await page.goto('/login');
  await page.getByRole('button', { name: rol, exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test('un cliente reserva, ve su cita y el equipo la confirma', async ({ page, request }, info) => {
  const mascota = `Pruebita ${info.project.name}`;
  const { fecha, hora } = await diaConHorarios(request);

  // La página pública: servicio, día, hora y datos.
  await page.goto('/#cita');
  const reserva = page.locator('#cita');
  await reserva.getByRole('button', { name: /Consulta general/ }).click();
  await reserva.getByLabel('¿Qué día?').fill(fecha);
  await reserva.getByRole('button', { name: hora, exact: true }).click();
  await reserva.getByLabel('Tu nombre').fill('Cliente de Prueba');
  await reserva.getByLabel('Teléfono').fill('300 123 4567');
  await reserva.getByLabel('Correo').fill(`e2e-${info.project.name}@prueba.test`);
  await reserva.getByLabel('Nombre de tu mascota').fill(mascota);
  await reserva.getByRole('checkbox').check();
  await reserva.getByRole('button', { name: /Reservar cita/ }).click();
  await expect(reserva.getByText('¡Tu cita quedó reservada!')).toBeVisible();

  // El enlace del cliente muestra la cita pendiente.
  await reserva.getByRole('link', { name: 'Ver mi cita' }).click();
  await expect(page.getByText('Pendiente de confirmar')).toBeVisible();

  // El equipo la encuentra en la agenda de ese día y la confirma.
  await entrarComo(page, 'Administración');
  await page.getByLabel('Elegir día').fill(fecha);
  const cita = page.locator('article').filter({ hasText: mascota });
  await cita.getByRole('button', { name: 'Confirmar' }).click();
  await expect(cita.getByText('Confirmada')).toBeVisible();
});

test('recepción no ve reportes, ajustes ni equipo', async ({ page }) => {
  await entrarComo(page, 'Recepción');
  const menu = page.getByRole('navigation', { name: 'Secciones del panel' });
  await expect(menu.getByRole('button', { name: /Agenda/ })).toBeVisible();
  for (const seccion of ['Reportes', 'Ajustes', 'Equipo']) {
    await expect(menu.getByRole('button', { name: new RegExp(seccion) })).toHaveCount(0);
  }
});

test('administración ve los reportes con datos de la demo', async ({ page }) => {
  await entrarComo(page, 'Administración');
  await page.getByRole('navigation', { name: 'Secciones del panel' }).getByRole('button', { name: /Reportes/ }).click();
  await page.getByRole('button', { name: 'Últimos 90 días' }).click();
  await expect(page.getByText('Citas por semana')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Reportes' })).toBeVisible();
});

test('una dirección que no existe muestra la página 404', async ({ page }) => {
  await page.goto('/esto-no-existe');
  await expect(page.getByRole('heading', { name: 'Esta página se nos escapó.' })).toBeVisible();
});
