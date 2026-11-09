import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { diaConHorarios } from './ayuda';

// Revisión automática con axe (WCAG 2.1 A y AA) de cada página y sección del panel.
// No reemplaza probar con lector de pantalla, pero atrapa contraste, nombres de
// botones, etiquetas de campos y estructura.
async function sinProblemas(page, contexto) {
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const resumen = violations.map((v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  expect(resumen, contexto).toEqual([]);
}

test('páginas públicas', async ({ page }) => {
  for (const ruta of ['/', '/privacidad', '/login', '/whatsapp', '/no-existe']) {
    await page.goto(ruta);
    await page.waitForLoadState('networkidle');
    await sinProblemas(page, ruta);
  }
});

test('los pasos de la reserva', async ({ page, request }) => {
  const { fecha, hora } = await diaConHorarios(request);
  await page.goto('/#cita');
  const reserva = page.locator('#cita');
  await reserva.getByRole('button', { name: /Consulta general/ }).click();
  await reserva.getByLabel('¿Qué día?').fill(fecha);
  await expect(reserva.getByRole('button', { name: hora, exact: true })).toBeVisible();
  await page.waitForLoadState('networkidle');
  await sinProblemas(page, 'paso de día y hora');
  await reserva.getByRole('button', { name: hora, exact: true }).click();
  await expect(reserva.getByLabel('Tu nombre')).toBeVisible();
  await sinProblemas(page, 'paso de datos');
});

test('cada sección del panel', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Administración', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  const menu = page.getByRole('navigation', { name: 'Secciones del panel' });
  for (const seccion of ['Agenda', 'Clientes', 'Mensajes', 'Correos', 'Reportes', 'Ajustes', 'Equipo']) {
    await menu.getByRole('button', { name: new RegExp(seccion) }).click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.waitForLoadState('networkidle');
    await sinProblemas(page, seccion);
  }
  await menu.getByRole('button', { name: /Agenda/ }).click();
  await page.getByRole('button', { name: 'Semana' }).click();
  await page.waitForLoadState('networkidle');
  await sinProblemas(page, 'agenda semanal');
  await menu.getByRole('button', { name: /Clientes/ }).click();
  await page.locator('main article button').first().click();
  await page.waitForLoadState('networkidle');
  await sinProblemas(page, 'ficha de mascota');
});
