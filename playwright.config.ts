import { defineConfig, devices } from "@playwright/test";

// Configuración E2E. Levanta el servidor de desarrollo automáticamente.
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  retries: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    // Usa el Chromium pre-instalado del entorno (no descargar).
    launchOptions: process.env.PLAYWRIGHT_BROWSERS_PATH
      ? { executablePath: "/opt/pw-browsers/chromium" }
      : {},
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    // Servidor de producción: sin compilación por ruta (evita flakes de cold-start).
    // Requiere un build previo (el script `test:e2e` lo hace).
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
