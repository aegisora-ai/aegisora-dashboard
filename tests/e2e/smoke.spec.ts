import { test, expect, type Page } from "@playwright/test";

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

async function fillEmailWhenHydrated(page: Page, value: string) {
  const email = page.locator('input[name="email"]');
  const submit = page.locator('button[type="submit"]');
  await expect(async () => {
    await email.fill("");
    await email.fill(value);
    await expect(submit).toBeEnabled({ timeout: 1000 });
  }).toPass({ timeout: 20000 });
}

// Giris iki adimli: once e-posta ve Next, sonra parola.
async function checkTwoStepLogin(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });

  const email = page.locator('input[name="email"]');
  const password = page.locator('input[name="password"]');
  const submit = page.locator('button[type="submit"]');

  await expect(email).toBeVisible();
  await expect(submit).toBeVisible();
  await expect(password).toHaveCount(0);
  await expect(submit).toBeDisabled();

  // Buton ancak sayfa hydrate olup state guncellenince aktif olur.
  await fillEmailWhenHydrated(page, "test@example.com");
  await expect(submit).toBeEnabled();
  await submit.click();

  await expect(password).toBeVisible();
  await expect(email).not.toBeEditable();
  await expect(page.getByRole("button", { name: /^(Change|\u00c4ndern)$/ })).toBeVisible();
  await expect(submit).toBeVisible();
}

test("login is two steps: email first, then password", async ({ page }) => {
  await checkTwoStepLogin(page, "/login");
});

test("German login is two steps: email first, then password", async ({ page }) => {
  await checkTwoStepLogin(page, "/de/login");
});

test("login Change link returns to the email step", async ({ page }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  const email = page.locator('input[name="email"]');
  const submit = page.locator('button[type="submit"]');
  await fillEmailWhenHydrated(page, "test@example.com");
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await page.getByRole("button", { name: /^(Change|\u00c4ndern)$/ }).click();
  await expect(page.locator('input[name="password"]')).toHaveCount(0);
  await expect(email).toBeEditable();
});

async function checkSignup(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });

  const email = page.locator('input[name="email"]');
  const first = page.locator('input[name="first"]');
  const last = page.locator('input[name="last"]');
  const password = page.locator('input[name="password"]');
  const company = page.locator('input[name="company"]');
  const terms = page.locator('input[type="checkbox"]');
  const submit = page.locator('button[type="submit"]');

  for (const field of [email, first, last, password, company, terms, submit]) {
    await expect(field).toBeVisible();
  }
  await expect(page.getByText(/Must be at least 8 characters|Mindestens 8 Zeichen/)).toBeVisible();
  await expect(page.getByText(/Does not contain your email address|Enth\u00e4lt nicht Ihre E-Mail-Adresse/)).toBeVisible();
  await expect(submit).toBeDisabled();

  // Hydration bitmeden doldurulan degerler React state'ine girmez; hazir olana kadar tekrar dene.
  await expect(async () => {
    await email.fill("new.user@example.com");
    await first.fill("Ada");
    await last.fill("Lovelace");
    await password.fill("Str0ng-passphrase");
    // Hydration oncesi isaretlenen kutu React state'ine girmez; once kaldir, sonra isaretle.
    await terms.setChecked(false);
    await terms.check();
    await expect(submit).toBeEnabled({ timeout: 1000 });
  }).toPass({ timeout: 15000 });

  // Parola e-postayi iceriyorsa buton kapali kalir.
  await password.fill("new.user@example.com1");
  await expect(submit).toBeDisabled();
}

test("signup shows all fields and enforces the rules", async ({ page }) => {
  await checkSignup(page, "/signup");
});

test("German signup shows all fields and enforces the rules", async ({ page }) => {
  await checkSignup(page, "/de/signup");
});