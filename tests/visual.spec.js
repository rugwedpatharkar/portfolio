import { test, expect } from "@playwright/test";

/*
 * Smoke + visual regression. Captures key sections at each project's viewport
 * (mobile / tablet / desktop) and diffs against the committed baselines.
 *
 * To accept new visuals after an intentional change:
 *   npx playwright test --update-snapshots
 */

const SECTIONS = [
  { id: "hero", scrollTo: () => 0 },
  { id: "about" },
  { id: "projects" },
  { id: "notes" },
  { id: "contact" },
];

test.describe("Portfolio visual regression", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Cancel typewriter / parallax loops for stable screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `,
    });
  });

  for (const section of SECTIONS) {
    test(`section ${section.id} renders`, async ({ page }, testInfo) => {
      const scroll =
        section.scrollTo ??
        (async (id) => {
          const el = await page.$(`#${id}`);
          if (!el) return;
          await el.scrollIntoViewIfNeeded();
        });
      if (typeof scroll === "function") {
        await page.evaluate(async (id) => {
          if (!id) return;
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
        }, section.id);
      }
      // Wait one frame after scroll for paint
      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot(`${section.id}-${testInfo.project.name}.png`, {
        fullPage: false,
      });
    });
  }

  test("command palette opens on ⌘K", async ({ page }) => {
    await page.keyboard.press("Meta+k");
    await page.waitForTimeout(300);
    await expect(page.getByRole("dialog", { name: /command palette|search/i })).toBeVisible();
  });

  test("design route loads from #design", async ({ page }) => {
    await page.goto("/#design");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Tokens/);
  });
});
