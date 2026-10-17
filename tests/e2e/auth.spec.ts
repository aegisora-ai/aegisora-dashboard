import { test, expect } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

test.describe("real authentication", () => {
  test.beforeEach(async () => {
    test.skip(!email || !password, "E2E_EMAIL and E2E_PASSWORD are required");
  });

  test("login performs a real Supabase authentication request", async ({ page }) => {
    const authRequests: string[] = [];

    page.on("request", (request) => {
      if (request.url().includes("/auth/v1/")) {
        authRequests.push(request.url());
      }
    });

    await page.goto("/login", { waitUntil: "domcontentloaded" });

    const submit = page.locator('button[type="submit"]');

    // Step 1: email, then Next
    await page.locator('input[name="email"]').fill(email!);
    await expect(submit).toBeEnabled();
    await submit.click();

    // Step 2: password, then Sign in
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(password!);
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect
      .poll(() => authRequests.length, { timeout: 30_000 })
      .toBeGreaterThan(0);

    await page.waitForURL(/\/(dashboard|de\/dashboard)/, { timeout: 30_000 });
  });
});