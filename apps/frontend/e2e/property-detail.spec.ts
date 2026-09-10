import { test, expect } from "@playwright/test";

test.describe("Property Detail Page", () => {
  test("navigate from listing to detail page", async ({ page }) => {
    await page.goto("/propiedades");
    const firstCard = page.locator('a[href^="/propiedades/"]:not([href="/propiedades/"])').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
    await expect(page).toHaveURL(/\/propiedades\/[^/]+\/?$/);
    await page.waitForLoadState("networkidle");
  });

  test("detail page has heading, breadcrumb, image area, and action buttons", async ({
    page,
  }) => {
    await page.goto("/propiedades");
    await page.locator('a[href^="/propiedades/"]:not([href="/propiedades/"])').first().click();
    await expect(page).toHaveURL(/\/propiedades\/[^/]+\/?$/);
    await page.waitForLoadState("networkidle");

    // Wait for carousel first (unique to detail page) to ensure page is fully rendered
    await expect(page.locator("#propertyCarousel")).toBeVisible();

    // Use .first() as React streaming may briefly keep previous page content in DOM
    await expect(page.locator("h1").first()).toBeVisible();

    // Verify breadcrumb exists - detail page has 3 items (Home, Propiedades, Property title)
    // The detail page breadcrumb links to /propiedades in the 2nd item
    const detailBreadcrumb = page.locator('nav[aria-label="Breadcrumb"]').filter({
      has: page.locator('a[href="/propiedades/"], a[href="/propiedades"]')
    }).first();
    await expect(detailBreadcrumb.locator(".breadcrumb-item")).toHaveCount(3);

    await expect(page.locator("a:has-text('Ficha')")).toBeVisible();
    await expect(page.locator("button:has-text('Compartir')")).toBeVisible();
  });

  test("invalid slug shows 404", async ({ page }) => {
    await page.goto("/propiedades/nonexistent-slug-12345");
    await expect(page.locator("h1")).toContainText("404");
  });

  test("detail page has JSON-LD structured data", async ({ page }) => {
    await page.goto("/propiedades");
    await page.locator('a[href^="/propiedades/"]:not([href="/propiedades/"])').first().click();
    await expect(page).toHaveURL(/\/propiedades\/[^/]+\/?$/);
    await page.waitForLoadState("networkidle");

    const jsonLdContents = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(
      jsonLdContents.some((content) => content.includes("RealEstateListing")),
    ).toBe(true);
  });
});
