import { defineConfig, devices } from "@playwright/test";

const externalBaseUrl =
  process.env.PLAYWRIGHT_BASE_URL ??
  process.env.BASE_URL ??
  "";

const baseURL =
  externalBaseUrl ||
  "http://127.0.0.1:3199";

const useExternalServer = Boolean(externalBaseUrl);

export default defineConfig({
  testDir: "./tests/e2e",

  fullyParallel: true,

  forbidOnly: Boolean(process.env.CI),

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  timeout: 60_000,

  expect: {
    timeout: 10_000,
  },

  reporter: process.env.CI
    ? [
        ["line"],
        ["html", { outputFolder: ".enterprise/playwright-report", open: "never" }],
      ]
    : [["list"]],

  outputDir: ".enterprise/playwright-results",

  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  webServer: useExternalServer
    ? undefined
    : {
        command: "npm run start -- -p 3199",
        url: "http://127.0.0.1:3199",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});


