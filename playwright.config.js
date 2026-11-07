import { defineConfig, devices } from '@playwright/test';

// Pruebas de punta a punta: la web compilada, servida con "vite preview", habla con
// una API real (E2E_API_URL) que usa los datos de la demo. La API la levanta CI o,
// en local, quien corre las pruebas.
const PUERTO = 4173;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
    trace: 'retain-on-failure',
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'] } },
    { name: 'celular', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${PUERTO} --strictPort`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: { VITE_MODO_DEMO: 'true', VITE_API_URL: process.env.E2E_API_URL || 'http://localhost:3001' },
  },
});
