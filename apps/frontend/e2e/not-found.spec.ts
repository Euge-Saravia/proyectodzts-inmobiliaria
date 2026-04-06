import { test, expect } from "@playwright/test";

test.describe("404 Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ruta-que-no-existe-12345");
  });

  test("shows 404 heading and message", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("404");
    await expect(
      page.locator("text=La página que buscás no existe o fue movida")
    ).toBeVisible();
  });

  test('"Ir al inicio" navigates to home', async ({ page }) => {
    await page.click("a:has-text('Ir al inicio')");
    await expect(page).toHaveURL("/");
  });

  test('"Ver propiedades" navigates to /propiedades', async ({ page }) => {
    await page.click("a:has-text('Ver propiedades')");
    await expect(page).toHaveURL(/\/propiedades$/);
  });
});
