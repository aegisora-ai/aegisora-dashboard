import { createHmac } from "node:crypto";
import { test, expect } from "@playwright/test";

function base32Decode(value: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const char of value.toUpperCase().replace(/=+$/g, "")) {
    const index = alphabet.indexOf(char);
    if (index < 0) throw new Error("Invalid TOTP secret encoding.");
    bits += index.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

function currentTotp(secret: string): string {
  const counter = BigInt(Math.floor(Date.now() / 30_000));
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(counter);
  const digest = createHmac("sha1", base32Decode(secret)).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = ((digest[offset] & 0x7f) << 24) | ((digest[offset + 1] & 0xff) << 16) | ((digest[offset + 2] & 0xff) << 8) | (digest[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
}

test("TOTP step-up upgrades the browser session to AAL2", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  const secret = process.env.E2E_MFA_SECRET;
  test.skip(!email || !password || !secret, "temporary MFA test credentials are required");

  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email!);
  await page.locator('input[name="password"]').fill(password!);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
  const tour = page.getByRole("dialog", { name: "Welcome tour" });
  await tour.waitFor({ state: "visible", timeout: 5_000 }).catch(() => undefined);

  if (await tour.isVisible().catch(() => false)) {
    await tour.getByRole("button", { name: "Skip", exact: true }).click();
    await expect(tour).toBeHidden({ timeout: 5_000 });
  }

  await page.goto("/dashboard/identity");

  const identityTour = page.getByRole("dialog", { name: "Welcome tour" });
  await identityTour.waitFor({ state: "visible", timeout: 2_000 }).catch(() => undefined);

  if (await identityTour.isVisible().catch(() => false)) {
    await identityTour.getByRole("button", { name: "Skip", exact: true }).click();
    await expect(identityTour).toBeHidden({ timeout: 5_000 });
  }

  await expect(page.getByText("CURRENT SESSION: AAL1")).toBeVisible({ timeout: 15_000 });
  await page.getByLabel("Authenticator code").fill(currentTotp(secret!));
  await page.getByRole("button", { name: "Verify code" }).click();
  await expect(page.getByText("CURRENT SESSION: AAL2")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("status")).toContainText("AAL2");
});

