import { test, expect } from "@playwright/test";

test.describe("Properties Listing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/propiedades");
  });

  test("page loads with breadcrumb, heading, and filter sidebar", async ({
    page,
  }) => {
    await expect(
      page.locator('nav[aria-label="Breadcrumb"]')
    ).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("#filters-form")).toBeAttached();
  });

  test("property cards are displayed as links", async ({ page }) => {
    const cards = page.locator('a[href^="/propiedades/"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("filter by operacion updates URL", async ({ page }) => {
    await page.click("label[for='operacion-venta']");
    await page.click("button:has-text('Aplicar filtros')");
    await expect(page).toHaveURL(/operacion=venta/);
  });

  test("clear filters resets URL", async ({ page }) => {
    await page.goto("/propiedades?operacion=venta");
    await page.click("button:has-text('Limpiar filtros')");
    await expect(page).toHaveURL(/\/propiedades$/);
  });

  test("active filter badges appear when filters applied", async ({
    page,
  }) => {
    await page.goto("/propiedades?operacion=venta");
    const badges = page.locator(".badge:has(.btn-close)");
    await expect(badges.first()).toBeVisible();
  });

  test("removing a filter badge updates URL", async ({ page }) => {
    await page.goto("/propiedades?operacion=venta");
    const closeBtn = page.locator(".badge .btn-close").first();
    await closeBtn.click();
    await expect(page).not.toHaveURL(/operacion=venta/);
  });
});
