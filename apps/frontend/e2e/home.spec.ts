import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads with header, main, and footer", async ({ page }) => {
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("title contains DZTS Inmobiliaria", async ({ page }) => {
    await expect(page).toHaveTitle(/DZTS Inmobiliaria/);
  });

  test("search form has 4 selects and a search button", async ({ page }) => {
    await expect(page.locator("#operacion")).toBeVisible();
    await expect(page.locator("#propiedad")).toBeVisible();
    await expect(page.locator("#localidad")).toBeVisible();
    await expect(page.locator("#dormitorios")).toBeVisible();
    await expect(page.locator("button.btn-custom")).toBeVisible();
  });

  test("search with Venta navigates to /propiedades?operacion=venta", async ({
    page,
  }) => {
    await page.selectOption("#operacion", "venta");
    await page.click("button.btn-custom");
    await expect(page).toHaveURL(/\/propiedades\?.*operacion=venta/);
  });

  test("search with no selection navigates to /propiedades", async ({
    page,
  }) => {
    await page.click("button.btn-custom");
    await expect(page).toHaveURL(/\/propiedades$/);
  });

  test("featured properties section is present", async ({ page }) => {
    const heading = page.locator("h2").first();
    await expect(heading).toBeVisible();
  });
});
