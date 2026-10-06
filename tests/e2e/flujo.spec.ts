import { test, expect } from "@playwright/test";

// E2E: recorrido mínimo de principio a lobby y creación de equipo.
test("portada carga y permite ir al lobby", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "SEÑAL PERDIDA" })).toBeVisible();
  await page.getByRole("link", { name: /Comenzar misión/i }).click();
  await expect(page).toHaveURL(/\/lobby/);
  await expect(page.getByText("Sala de equipos")).toBeVisible();
});

test("crear equipo lleva al mapa de misiones", async ({ page }) => {
  await page.goto("/lobby");
  await page.getByLabel("Nombre del equipo").fill("Equipo E2E");
  await page.getByRole("button", { name: /Crear equipo e iniciar/i }).click();
  await expect(page).toHaveURL(/\/mapa/);
  await expect(page.getByRole("heading", { name: "Mapa de misiones" })).toBeVisible();
  await expect(page.getByText("Nodo", { exact: false }).first()).toBeVisible();
});

test("el ranking público se muestra", async ({ page }) => {
  await page.goto("/ranking");
  await expect(page.getByRole("heading", { name: /Tabla de clasificación/i })).toBeVisible();
});
