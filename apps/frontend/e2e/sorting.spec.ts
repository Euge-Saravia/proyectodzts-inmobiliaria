import { test, expect } from "@playwright/test";

test.describe("Property listing sorting", () => {
  test("sort control exists and defaults to 'Más recientes'", async ({ page }) => {
    await page.goto("/propiedades");
    const sort = page.locator("#orden");
    await expect(sort).toBeVisible();
    await expect(sort).toHaveValue("");
  });

  test("changing the sort updates the URL and resets to page 1", async ({ page }) => {
    await page.goto("/propiedades?pagina=2");
    await page.locator("#orden").selectOption("precio-asc");
    await expect(page).toHaveURL(/orden=precio-asc/);
    await expect(page).not.toHaveURL(/pagina=/);
  });

  test("the sort persists across pagination when more than one page exists", async ({
    page,
  }) => {
    await page.goto("/propiedades");
    await page.locator("#orden").selectOption("tamano-desc");
    await expect(page).toHaveURL(/orden=tamano-desc/);

    const nextLink = page.locator(
      'nav[aria-label="Paginación de propiedades"] a[aria-label="Página siguiente"]',
    );
    if ((await nextLink.count()) > 0) {
      await nextLink.first().click();
      await expect(page).toHaveURL(/orden=tamano-desc/);
      await expect(page).toHaveURL(/pagina=2/);
    }
  });
});
