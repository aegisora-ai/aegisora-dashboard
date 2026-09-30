import { test, expect } from "@playwright/test";

const authRoutes = [
  "/login",
  "/de/login",
  "/signup",
  "/de/signup",
  "/forgot-password",
  "/de/forgot-password",
  "/accept-invite",
  "/de/accept-invite",
];

for (const route of authRoutes) {
  test(`${route} renders successfully`, async ({ page }) => {
    const response = await page.goto(route, {
      waitUntil: "domcontentloaded",
    });

    expect(response).not.toBeNull();
    expect(response!.status()).toBeLessThan(400);

    await expect(page.locator("body")).toBeVisible();
  });
}

test("login form has real submit controls", async ({ page }) => {
  await page.goto("/login", {
    waitUntil: "domcontentloaded",
  });

  await expect(
    page.locator('input[name="email"]')
  ).toBeVisible();

  await expect(
    page.locator('input[name="password"]')
  ).toBeVisible();

  await expect(
    page.locator('button[type="submit"]')
  ).toBeVisible();
});

test("German login form has real submit controls", async ({ page }) => {
  await page.goto("/de/login", {
    waitUntil: "domcontentloaded",
  });

  await expect(
    page.locator('input[name="email"]')
  ).toBeVisible();

  await expect(
    page.locator('input[name="password"]')
  ).toBeVisible();

  await expect(
    page.locator('button[type="submit"]')
  ).toBeVisible();
});
