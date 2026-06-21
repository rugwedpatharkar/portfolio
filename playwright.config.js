import { defineConfig, devices } from "@playwright/test";

/*
 * Visual regression tests run against `npm run preview` (the production build),
 * not the dev server — dev has HMR injection and unbundled imports that produce
 * noisy diffs. CI workflow builds first, then runs Playwright.
 *
 * Three viewports cover the design surface: 390 mobile, 768 tablet, 1440 desktop.
 * Snapshots live under tests/__screenshots__/.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "list",
  expect: {
    // Allow tiny font-rendering / GPU diffs without false positives. Tighten
    // for CI by overriding per-test with toHaveScreenshot({ maxDiffPixelRatio }).
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: "disabled" },
  },
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "mobile-390",
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
    },
    {
      name: "tablet-768",
      use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } },
    },
    {
      name: "desktop-1440",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
