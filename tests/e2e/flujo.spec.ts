import { test, expect } from "@playwright/test";

// E2E del flujo autenticado: registro → lobby → crear equipo → mapa → entrar a un nodo.
// El contenido del mapa/nodo se carga desde /api/contenido (catálogo en BD).

function correoUnico() {
  return `e2e_${Date.now()}_${Math.floor(Math.random() * 1e6)}@ut.edu.co`;
}

test("portada carga y enlaza al lobby", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "SEÑAL PERDIDA" })).toBeVisible();
  await page.getByRole("link", { name: /Comenzar misión/i }).click();
  await expect(page).toHaveURL(/\/lobby/);
});

test("registro de estudiante lleva al lobby", async ({ page }) => {
  await page.goto("/registro");
  await page.getByLabel("Nombre completo").fill("Estudiante E2E");
  await page.getByLabel("Correo").fill(correoUnico());
  await page.getByLabel(/Contraseña/).fill("clave123");
  await page.getByRole("button", { name: /Crear cuenta/i }).click();
  await expect(page).toHaveURL(/\/lobby/, { timeout: 15000 });
  await expect(page.getByText("Sala de equipos")).toBeVisible();
});

test("crear equipo lleva al mapa y permite abrir un nodo", async ({ page }) => {
  // Registro (autentica) → lobby
  await page.goto("/registro");
  await page.getByLabel("Nombre completo").fill("Jugador E2E");
  await page.getByLabel("Correo").fill(correoUnico());
  await page.getByLabel(/Contraseña/).fill("clave123");
  await page.getByRole("button", { name: /Crear cuenta/i }).click();
  await expect(page).toHaveURL(/\/lobby/, { timeout: 15000 });

  // Crear equipo
  await page.getByLabel("Nombre del equipo").fill("Equipo E2E");
  await page.getByRole("button", { name: /Crear equipo e iniciar/i }).click();
  await expect(page).toHaveURL(/\/mapa/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "Mapa de misiones" })).toBeVisible();

  // El contenido viene del catálogo; debe aparecer al menos un nodo jugable.
  const entrar = page.getByRole("link", { name: /Entrar al nodo/i }).first();
  await expect(entrar).toBeVisible({ timeout: 15000 });
  await entrar.click();
  await expect(page).toHaveURL(/\/sala\//, { timeout: 15000 });
  await expect(page.getByText(/Retos resueltos:/i)).toBeVisible({ timeout: 15000 });
});

test("el ranking público se muestra", async ({ page }) => {
  await page.goto("/ranking");
  await expect(page.getByRole("heading", { name: /Tabla de clasificación/i })).toBeVisible();
});
