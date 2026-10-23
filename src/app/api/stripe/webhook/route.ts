import { NextResponse } from "next/server";
import type Stripe from "stripe";

import {
  BILLING_PLANS,
  getAdminClient,
  getStripe,
} from "@/lib/aegisora/billing";

export const runtime = "nodejs";

function idOf(value: unknown): string | null {
  if (
    typeof value === "string" &&
    value.length > 0
  ) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "id" in value
  ) {
    const id =
      (value as { id?: unknown }).id;

    return typeof id === "string"
      ? id
      : null;
  }

  return null;
}

function metadataValue(
  metadata: Stripe.Metadata | null | undefined,
  key: string,
): string | null {
  const value =
    metadata?.[key];

  return typeof value === "string" &&
    value.length > 0
    ? value
    : null;
}

function dateFromUnix(
  value: unknown,
): string | null {
  if (typeof value !== "number") {
    return null;
  }

  return new Date(
    value * 1000,
  ).toISOString();
}

function entitlementStatus(
  status: string,
): "active" | "past_due" | "inactive" {
  if (
    status === "active" ||
    status === "trialing"
  ) {
    return "active";
  }

  if (
    status === "past_due" ||
    status === "unpaid"
  ) {
    return "past_due";
  }

  return "inactive";
}

async function customerWorkspace(
  admin: ReturnType<typeof getAdminClient>,
  customerId: string | null,
) {
  if (!customerId) {
    return null;
  }

  const { data } =
    await admin
      .from("billing_customers")
      .select(
        "workspace_id",
      )
      .eq(
        "stripe_customer_id",
        customerId,
      )
      .maybeSingle();

  return data?.workspace_id
    ? String(data.workspace_id)
    : null;
}

async function persistSubscription(
  admin: ReturnType<typeof getAdminClient>,
  subscription: Stripe.Subscription,
  eventType: string,
) {
  const raw =
    subscription as unknown as Record<
      string,
      unknown
    >;

  const customerId =
    idOf(raw.customer);

  let workspaceId =
    metadataValue(
      subscription.metadata,
      "workspace_id",
    );

  if (!workspaceId) {
    workspaceId =
      await customerWorkspace(
        admin,
        customerId,
      );
  }

  if (!workspaceId) {
    throw new Error(
      "Subscription has no resolvable workspace.",
    );
  }

  let planKey =
    metadataValue(
      subscription.metadata,
      "plan_key",
    );

  if (!planKey) {
    const items =
      raw.items &&
      typeof raw.items === "object" &&
      "data" in raw.items
        ? (raw.items as {
            data?: unknown;
          }).data
        : null;

    const firstItem =
      Array.isArray(items) &&
      items.length > 0
        ? items[0]
        : null;

    const price =
      firstItem &&
      typeof firstItem === "object" &&
      "price" in firstItem
        ? (firstItem as {
            price?: unknown;
          }).price
        : null;

    const priceId =
      idOf(price);

    if (priceId) {
      for (
        const [key, config]
        of Object.entries(
          BILLING_PLANS,
        )
      ) {
        if (
          process.env[
            config.envKey
          ] === priceId
        ) {
          planKey =
            key;
          break;
        }
      }
    }
  }

  if (!planKey) { throw new Error("Subscription plan could not be resolved."); }

  const items =
    raw.items &&
    typeof raw.items === "object" &&
    "data" in raw.items
      ? (raw.items as {
          data?: unknown;
        }).data
      : null;

  const firstItem =
    Array.isArray(items) &&
    items.length > 0
      ? items[0]
      : null;

  const priceValue =
    firstItem &&
    typeof firstItem === "object" &&
    "price" in firstItem
      ? (firstItem as {
          price?: unknown;
        }).price
      : null;

  const priceId =
    idOf(priceValue);

  const itemPeriod =

    firstItem && typeof firstItem === "object"

      ? (firstItem as { current_period_start?: unknown; current_period_end?: unknown })

      : null;


  const currentStart =
    dateFromUnix(raw.current_period_start ?? itemPeriod?.current_period_start);

  const currentEnd =
    dateFromUnix(raw.current_period_end ?? itemPeriod?.current_period_end);

  const status =
    String(
      raw.status ?? "unknown",
    );

  const cancelAtPeriodEnd =
    raw.cancel_at_period_end === true;

  const { error } =
    await admin
      .from("billing_subscriptions")
      .upsert(
        {
          workspace_id:
            workspaceId,
          stripe_subscription_id:
            subscription.id,
          stripe_customer_id:
            customerId,
          price_id:
            priceId,
          plan_key:
            planKey,
          status:
            status,
          current_period_start:
            currentStart,
          current_period_end:
            currentEnd,
          cancel_at_period_end:
            cancelAtPeriodEnd,
          livemode:
            raw.livemode === true,
          last_event_type:
            eventType,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "stripe_subscription_id",
        },
      );

  if (error) {
    throw new Error(
      `Subscription persistence failed: ${error.message}`,
    );
  }

  const {
    error: entitlementError,
  } = await admin
    .from("workspace_entitlements")
    .upsert(
      {
        workspace_id:
          workspaceId,
        plan_key:
          planKey,
        status:
          entitlementStatus(
            status,
          ),
        billing_mode:
          "subscription",
        stripe_customer_id:
          customerId,
        stripe_subscription_id:
          subscription.id,
        current_period_end:
          currentEnd,
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          "workspace_id",
      },
    );

  if (entitlementError) {
    throw new Error(
      `Entitlement persistence failed: ${entitlementError.message}`,
    );
  }
}

async function persistCheckout(
  admin: ReturnType<typeof getAdminClient>,
  session: Stripe.Checkout.Session,
) {
  const workspaceId =
    metadataValue(
      session.metadata,
      "workspace_id",
    ) ??
    session.client_reference_id;

  if (!workspaceId) {
    throw new Error(
      "Checkout session has no workspace_id.",
    );
  }

  const customerId =
    idOf(session.customer);

  const planKey =
    metadataValue(
      session.metadata,
      "plan_key",
    ) ??
    "founder_pilot";

  if (customerId) {
    await admin
      .from("billing_customers")
      .upsert(
        {
          workspace_id:
            workspaceId,
          stripe_customer_id:
            customerId,
        },
        {
          onConflict:
            "workspace_id",
        },
      );
  }

  if (
    session.mode !==
    "payment"
  ) {
    return;
  }

  const paymentStatus =
    session.payment_status ??
    "unpaid";

  const paymentIntentId =
    idOf(
      session.payment_intent,
    );

  const {
    data: payment,
    error: paymentError,
  } = await admin
    .from("billing_payments")
    .upsert(
      {
        workspace_id:
          workspaceId,
        stripe_checkout_session_id:
          session.id,
        stripe_payment_intent_id:
          paymentIntentId,
        stripe_customer_id:
          customerId,
        plan_key:
          planKey,
        status:
          paymentStatus,
        amount_total:
          session.amount_total,
        currency:
          session.currency,
        paid_at:
          paymentStatus === "paid"
            ? new Date().toISOString()
            : null,
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          "stripe_checkout_session_id",
      },
    )
    .select("id")
    .maybeSingle();

  if (paymentError) {
    throw new Error(
      `Payment persistence failed: ${paymentError.message}`,
    );
  }

  if (
    paymentStatus !==
    "paid"
  ) {
    return;
  }

  const {
    error: entitlementError,
  } = await admin
    .from("workspace_entitlements")
    .upsert(
      {
        workspace_id:
          workspaceId,
        plan_key:
          planKey,
        status:
          "active",
        billing_mode:
          "one_time_pilot",
        stripe_customer_id:
          customerId,
        stripe_subscription_id:
          null,
        source_payment_id:
          payment?.id ?? null,
        current_period_end:
          null,
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          "workspace_id",
      },
    );

  if (entitlementError) {
    throw new Error(
      `Pilot entitlement persistence failed: ${entitlementError.message}`,
    );
  }
}

async function persistInvoice(
  admin: ReturnType<typeof getAdminClient>,
  invoice: Stripe.Invoice,
  eventType: string,
) {
  const raw =
    invoice as unknown as Record<
      string,
      unknown
    >;

  const subscriptionId =
    idOf(raw.subscription ?? (raw.parent as { subscription_details?: { subscription?: unknown } } | null | undefined)?.subscription_details?.subscription);

  if (!subscriptionId) {
    return;
  }

  const { data } =
    await admin
      .from("billing_subscriptions")
      .select(
        "workspace_id,plan_key,stripe_customer_id",
      )
      .eq(
        "stripe_subscription_id",
        subscriptionId,
      )
      .maybeSingle();

  if (!data) {
    return;
  }

  const status =
    eventType ===
    "invoice.payment_failed"
      ? "past_due"
      : "active";

  await admin
    .from("billing_subscriptions")
    .update(
      {
        status,
        last_event_type:
          eventType,
        updated_at:
          new Date().toISOString(),
      },
    )
    .eq(
      "stripe_subscription_id",
      subscriptionId,
    );

  await admin
    .from("workspace_entitlements")
    .upsert(
      {
        workspace_id:
          String(
            data.workspace_id,
          ),
        plan_key:
          String(
            data.plan_key,
          ),
        status,
        billing_mode:
          "subscription",
        stripe_customer_id:
          data.stripe_customer_id
            ? String(
                data.stripe_customer_id,
              )
            : null,
        stripe_subscription_id:
          subscriptionId,
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          "workspace_id",
      },
    );
}

export async function POST(
  request: Request,
) {
  const secret =
    process.env
      .STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json(
      {
        success: false,
        error:
          "STRIPE_WEBHOOK_SECRET is not configured.",
      },
      { status: 503 },
    );
  }

  const signature =
    request.headers.get(
      "stripe-signature",
    );

  if (!signature) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Missing Stripe signature.",
      },
      { status: 400 },
    );
  }

  const payload =
    await request.text();

  const stripe =
    getStripe();

  let event: Stripe.Event;

  try {
    event =
      stripe.webhooks.constructEvent(
        payload,
        signature,
        secret,
      );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid webhook signature.",
      },
      { status: 400 },
    );
  }

  const admin =
    getAdminClient();

  const { data: duplicate } =
    await admin
      .from("billing_events")
      .select(
        "stripe_event_id",
      )
      .eq(
        "stripe_event_id",
        event.id,
      )
      .maybeSingle();

  if (
    duplicate?.stripe_event_id
  ) {
    return NextResponse.json({
      received: true,
      duplicate: true,
    });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await persistCheckout(
        admin,
        event.data.object as Stripe.Checkout.Session,
      );
      break;

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await persistSubscription(
        admin,
        event.data.object as Stripe.Subscription,
        event.type,
      );
      break;

    case "invoice.paid":
    case "invoice.payment_failed":
      await persistInvoice(
        admin,
        event.data.object as Stripe.Invoice,
        event.type,
      );
      break;

    default:
      break;
  }

  const { error } =
    await admin
      .from("billing_events")
      .insert(
        {
          stripe_event_id:
            event.id,
          event_type:
            event.type,
          livemode:
            event.livemode,
          payload:
            event,
          processed_at:
            new Date().toISOString(),
        },
      );

  if (
    error &&
    error.code !== "23505"
  ) {
    throw new Error(
      `Billing event persistence failed: ${error.message}`,
    );
  }

  return NextResponse.json({
    received: true,
    eventId:
      event.id,
    eventType:
      event.type,
  });
}