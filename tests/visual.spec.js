import { test, expect } from "@playwright/test";

/*
 * Smoke tests for the single-route v3 Stellar tour. The scene is a live WebGL
 * canvas — pixel-diffing it is flaky — so we assert on the DOM overlay and the
 * navigation state instead of screenshot-diffing the canvas.
 */
test.describe("Stellar v3 portfolio", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("hero loads with the name, CTA, and no crash", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Patharkar");
    await expect(page.getByRole("button", { name: /begin the tour/i })).toBeVisible();
    // The error-boundary "alert" must NOT be showing.
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  test("keyboard navigation advances the tour", async ({ page }) => {
    // Let the scene settle so the key handler is bound.
    await page.waitForTimeout(600);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(900);
    // The active résumé section drives the tab title + the URL hash.
    await expect(page).toHaveTitle(/· Rugwed Patharkar$/);
    expect(page.url()).toContain("#v3/");
  });
});
