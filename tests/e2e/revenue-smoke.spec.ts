import { test, expect } from "@playwright/test";

test.describe("Revenue V1 boundary", () => {
  test("billing status requires authentication", async ({ request }) => {
    const response =
      await request.get(
        "/api/billing/status",
      );

    expect(
      response.status(),
    ).toBe(401);
  });

  test("checkout requires authentication", async ({ request }) => {
    const response =
      await request.post(
        "/api/stripe/checkout",
        {
          data: {
            plan: "team",
            locale: "en",
          },
        },
      );

    expect(
      response.status(),
    ).toBe(401);
  });

  test("portal requires authentication", async ({ request }) => {
    const response =
      await request.post(
        "/api/stripe/portal",
        {
          data: {
            locale: "en",
          },
        },
      );

    expect(
      response.status(),
    ).toBe(401);
  });

  test("webhook rejects missing signature", async ({ request }) => {
    const response =
      await request.post(
        "/api/stripe/webhook",
        {
          data: {},
        },
      );

    expect(
      [400, 503],
    ).toContain(
      response.status(),
    );
  });
});