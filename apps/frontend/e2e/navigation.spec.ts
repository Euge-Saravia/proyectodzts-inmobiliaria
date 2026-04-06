import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("header with navbar is present on home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header .navbar")).toBeVisible();
    await expect(
      page.locator('nav[aria-label="Main navigation"]')
    ).toBeVisible();
  });

  test("footer is present on home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer.site-footer")).toBeVisible();
  });

  test("header is present on properties page", async ({ page }) => {
    await page.goto("/propiedades");
    await expect(page.locator("header .navbar")).toBeVisible();
  });

  test("footer is present on properties page", async ({ page }) => {
    await page.goto("/propiedades");
    await expect(page.locator("footer.site-footer")).toBeVisible();
  });

  test("brand link navigates to home", async ({ page }) => {
    await page.goto("/propiedades");
    await page.click(".navbar-brand");
    await expect(page).toHaveURL("/");
  });

  test("breadcrumb is present on properties page", async ({ page }) => {
    await page.goto("/propiedades");
    await expect(
      page.locator('nav[aria-label="Breadcrumb"]')
    ).toBeVisible();
  });

  test("breadcrumb home link navigates to /", async ({ page }) => {
    await page.goto("/propiedades");
    await page.locator('nav[aria-label="Breadcrumb"] a').first().click();
    await expect(page).toHaveURL("/");
  });
});
