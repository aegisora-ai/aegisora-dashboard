import { test, expect } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

test("login route renders", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
});

test("German login route renders", async ({ page }) => {
  await page.goto("/de/login");
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
});

test("login performs real authentication when credentials are configured", async ({ page }) => {
  test.skip(!email || !password, "E2E_EMAIL/E2E_PASSWORD not configured");

  const requests: string[] = [];

  page.on("request", (request) => {
    if (request.url().includes("/auth/v1/")) {
      requests.push(request.url());
    }
  });

  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email!);
  await page.locator('input[name="password"]').fill(password!);
  await page.locator('button[type="submit"]').click();

  await page.waitForLoadState("networkidle");

  expect(requests.length).toBeGreaterThan(0);
  await expect(page).toHaveURL(/\/(dashboard|de\/dashboard)/);
});
