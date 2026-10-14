import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const files = [
  "src/app/api/stripe/checkout/route.ts",
  "src/app/api/stripe/webhook/route.ts",
  "src/app/api/stripe/portal/route.ts",
  "src/app/api/billing/status/route.ts",
  "src/lib/aegisora/billing.ts",
  "src/app/[locale]/(app)/dashboard/billing/page.tsx",
  "supabase/migrations/20261004010000_revenue_v1_billing.sql",
  "tests/e2e/revenue-smoke.spec.ts",
];

const patterns = [
  [
    "Stripe Checkout",
    "stripe.checkout.sessions.create",
    "src/app/api/stripe/checkout/route.ts",
  ],
  [
    "Stripe webhook verification",
    "stripe.webhooks.constructEvent",
    "src/app/api/stripe/webhook/route.ts",
  ],
  [
    "Stripe billing portal",
    "billingPortal.sessions.create",
    "src/app/api/stripe/portal/route.ts",
  ],
  [
    "Workspace linkage",
    "workspace_id",
    "src/lib/aegisora/billing.ts",
  ],
  [
    "Subscription persistence",
    "billing_subscriptions",
    "src/app/api/stripe/webhook/route.ts",
  ],
  [
    "Entitlement persistence",
    "workspace_entitlements",
    "src/app/api/stripe/webhook/route.ts",
  ],
  [
    "Event idempotency",
    "billing_events",
    "src/app/api/stripe/webhook/route.ts",
  ],
];

let failed = false;

console.log("");
console.log("============================================================");
console.log(" AEGISORA REVENUE V1 VERIFICATION");
console.log("============================================================");
console.log("");

for (const file of files) {
  const full =
    path.join(root, file);

  if (
    fs.existsSync(full)
  ) {
    console.log(
      `[PASS] FILE ${file}`,
    );
  } else {
    failed = true;

    console.log(
      `[FAIL] FILE ${file}`,
    );
  }
}

console.log("");

for (
  const [name, pattern, file]
  of patterns
) {
  const full =
    path.join(root, file);

  if (
    fs.existsSync(full) &&
    fs.readFileSync(
      full,
      "utf8",
    ).includes(pattern)
  ) {
    console.log(
      `[PASS] ${name}`,
    );
  } else {
    failed = true;

    console.log(
      `[FAIL] ${name}`,
    );
  }
}

const billingPage =
  fs.readFileSync(
    path.join(
      root,
      "src/app/[locale]/(app)/dashboard/billing/page.tsx",
    ),
    "utf8",
  );

const forbidden = [
  "Billing Paused",
  "Activate Beta",
  "Beta Pass",
  "100% Free",
  "Beta Active",
  "Launch Phase Status",
];

for (
  const marker
  of forbidden
) {
  if (
    billingPage.includes(marker)
  ) {
    failed = true;

    console.log(
      `[FAIL] Fake billing marker remains: ${marker}`,
    );
  }
}

if (
  !billingPage.includes(
    "/api/stripe/checkout",
  )
) {
  failed = true;

  console.log(
    "[FAIL] Billing page checkout integration missing.",
  );
} else {
  console.log(
    "[PASS] Billing page checkout integration",
  );
}

if (
  !billingPage.includes(
    "/api/stripe/portal",
  )
) {
  failed = true;

  console.log(
    "[FAIL] Billing page portal integration missing.",
  );
} else {
  console.log(
    "[PASS] Billing page portal integration",
  );
}

console.log("");

console.log(
  failed
    ? "RESULT: FAIL"
    : "RESULT: PASS",
);

process.exitCode =
  failed ? 1 : 0;