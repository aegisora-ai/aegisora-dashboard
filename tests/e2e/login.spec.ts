import { test, expect } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

for (const path of ["/login", "/de/login"]) {
  test(`${path} shows the email step first`, async ({ page }) => {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toHaveCount(0);
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
}

test("login performs real authentication when credentials are configured", async ({ page }) => {
  test.skip(!email || !password, "E2E_EMAIL/E2E_PASSWORD not configured");

  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/auth/v1/")) requests.push(request.url());
  });

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  const submit = page.locator('button[type="submit"]');
  await page.locator('input[name="email"]').fill(email!);
  await expect(submit).toBeEnabled();
  await submit.click();
  await page.locator('input[name="password"]').fill(password!);
  await expect(submit).toBeEnabled();
  await submit.click();

  await expect(page).toHaveURL(/\/(de\/)?dashboard/, { timeout: 30000 });
  expect(requests.length).toBeGreaterThan(0);
});