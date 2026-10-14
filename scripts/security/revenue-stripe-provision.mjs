import fs from "node:fs";
import path from "node:path";
import Stripe from "stripe";

const root = process.cwd();

function readEnvFile(file) {
  if (!fs.existsSync(file)) return "";
  return fs.readFileSync(file, "utf8");
}

function readValue(file, name) {
  const text = readEnvFile(file);

  const escaped = name.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );

  const match = text.match(
    new RegExp(
      "^\\s*" +
        escaped +
        "\\s*=\\s*(.*?)\\s*$",
      "m",
    ),
  );

  if (!match) return null;

  let value = match[1].trim();

  if (
    (value.startsWith('"') &&
      value.endsWith('"')) ||
    (value.startsWith("'") &&
      value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return value || null;
}

function setValue(file, name, value) {
  let text = readEnvFile(file);

  const escaped = name.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );

  const line =
    name + "=" + value;

  const pattern = new RegExp(
    "^\\s*" +
      escaped +
      "\\s*=.*$",
    "m",
  );

  if (pattern.test(text)) {
    text = text.replace(
      pattern,
      line,
    );
  } else {
    text =
      text.trimEnd() +
      "\n" +
      line +
      "\n";
  }

  fs.writeFileSync(
    file,
    text,
    "utf8",
  );
}

const envFile = path.join(
  root,
  ".env.local",
);

const keyCandidates = [
  process.env.STRIPE_SECRET_KEY,
  readValue(envFile, "STRIPE_SECRET_KEY"),
  readValue(path.join(root, ".env.production.local"), "STRIPE_SECRET_KEY"),
];

const key =
  keyCandidates.find(
    (candidate) =>
      typeof candidate === "string" &&
      candidate.trim().startsWith("sk_test_"),
  )?.trim() ?? null;

if (
  !key ||
  !key.startsWith("sk_test_")
) {
  console.log(
    "NO_TEST_STRIPE_KEY",
  );
} else {

  const stripe =
    new Stripe(key);

  const plans = [
    {
      key: "founder_pilot",
      name: "Aegisora Founder Pilot",
      amount: 125000,
      recurring: false,
    },
    {
      key: "pilot",
      name: "Aegisora Pilot",
      amount: 250000,
      recurring: false,
    },
    {
      key: "team",
      name: "Aegisora Team",
      amount: 29900,
      recurring: true,
    },
    {
      key: "business",
      name: "Aegisora Business",
      amount: 99900,
      recurring: true,
    },
    {
      key: "enterprise",
      name: "Aegisora Enterprise",
      amount: 250000,
      recurring: true,
    },
  ];

  const products =
    await stripe.products.list({
      active: true,
      limit: 100,
    });

  for (const plan of plans) {

    let product =
      products.data.find(
        (item) =>
          item.metadata?.aegisora_plan_key ===
          plan.key,
      );

    if (!product) {
      product =
        await stripe.products.create({
          name: plan.name,
          metadata: {
            aegisora_plan_key:
              plan.key,
            source:
              "aegisora-revenue-v1",
          },
        });
    }

    const prices =
      await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 100,
      });

    let price =
      prices.data.find(
        (candidate) => {
          const recurringOk =
            plan.recurring
              ? candidate.recurring?.interval ===
                "month"
              : !candidate.recurring;

          return (
            recurringOk &&
            candidate.currency ===
              "usd" &&
            candidate.unit_amount ===
              plan.amount
          );
        },
      );

    if (!price) {
      price =
        await stripe.prices.create({
          product:
            product.id,
          currency:
            "usd",
          unit_amount:
            plan.amount,
          ...(plan.recurring
            ? {
                recurring: {
                  interval:
                    "month",
                },
              }
            : {}),
          metadata: {
            aegisora_plan_key:
              plan.key,
            source:
              "aegisora-revenue-v1",
          },
        });
    }

    const envName =
      "STRIPE_PRICE_" +
      plan.key
        .toUpperCase();

    setValue(
      envFile,
      envName,
      price.id,
    );

    console.log(
      `${envName}=CONFIGURED`,
    );
  }
}