import { NextResponse } from "next/server";

import {
  BILLING_PLANS,
  ensureStripeCustomer, getAdminClient, getBaseUrl,
  getPriceId,
  getStripe,
  isBillingPlan,
  requireBillingAdmin,
} from "@/lib/aegisora/billing";

export const runtime = "nodejs";

export async function POST(
  request: Request,
) {
  try {
    if (process.env.NEXT_PUBLIC_BILLING_SELF_SERVE !== "true") {
      return NextResponse.json(
        { success: false, error: "Self-service checkout is not enabled. Please contact us." },
        { status: 503 },
      );
    }

    const body =
      (await request.json().catch(() => ({}))) as {
        plan?: unknown;
        locale?: unknown;
      };

    

    const auth =
      await requireBillingAdmin();

    if (
      !auth.user ||
      !auth.workspaceId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Authentication and workspace membership are required.",
        },
        { status: 401 },
      );
    }

  if (!isBillingPlan(body.plan)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid billing plan.",
        },
        { status: 400 },
      );
    }

    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only workspace owners and admins can manage billing.",
        },
        { status: 403 },
      );
    }

    const plan = body.plan;

    const priceId =
      getPriceId(plan);

    if (!priceId) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Missing Stripe Price ID for ${plan}.`,
          envKey:
            BILLING_PLANS[plan].envKey,
        },
        { status: 503 },
      );
    }

    if (BILLING_PLANS[plan].mode === "subscription") {
      const { data: activeSub } = await getAdminClient()
        .from("billing_subscriptions")
        .select("stripe_subscription_id")
        .eq("workspace_id", auth.workspaceId)
        .in("status", ["active", "trialing", "past_due", "unpaid"])
        .limit(1)
        .maybeSingle();

      if (activeSub) {
        return NextResponse.json(
          {
            success: false,
            error: "This workspace already has an active subscription. Use the billing portal to change it.",
          },
          { status: 409 },
        );
      }
    }

    if (BILLING_PLANS[plan].mode === "payment") { // ACTIVE_SUB_GUARD_PAYMENT
      const { data: subForPilot } = await getAdminClient()
        .from("billing_subscriptions")
        .select("stripe_subscription_id")
        .eq("workspace_id", auth.workspaceId)
        .in("status", ["active", "trialing", "past_due", "unpaid"])
        .limit(1)
        .maybeSingle();

      if (subForPilot) {
        return NextResponse.json(
          {
            success: false,
            error: "This workspace already has an active subscription. A one-time pilot cannot replace it.",
          },
          { status: 409 },
        );
      }
    }
    const customerId = await ensureStripeCustomer({
        workspaceId:
          auth.workspaceId,
        userId:
          auth.user.id,
        email:
          auth.user.email,
      });

    const locale =
      body.locale === "de"
        ? "de"
        : "en";

    const billingPath =
      locale === "de"
        ? "/de/dashboard/billing"
        : "/dashboard/billing";

    const baseUrl =
      getBaseUrl();

    const stripe =
      getStripe();

    const params: Parameters<
      typeof stripe.checkout.sessions.create
    >[0] = {
      mode:
        BILLING_PLANS[plan].mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer:
        customerId,
      client_reference_id:
        auth.workspaceId,
      metadata: {
        workspace_id:
          auth.workspaceId,
        user_id:
          auth.user.id,
        plan_key:
          plan,
        billing_mode:
          BILLING_PLANS[plan].mode,
      },
      billing_address_collection:
        "required",
      allow_promotion_codes:
        true,
      success_url:
        `${baseUrl}${billingPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        `${baseUrl}${billingPath}?checkout=cancelled`,
    };

    if (
      BILLING_PLANS[plan].mode ===
      "subscription"
    ) {
      params.subscription_data = {
        metadata: {
          workspace_id:
            auth.workspaceId,
          user_id:
            auth.user.id,
          plan_key:
            plan,
          billing_mode:
            "subscription",
        },
      };
    } else {
      params.payment_intent_data = {
        metadata: {
          workspace_id:
            auth.workspaceId,
          user_id:
            auth.user.id,
          plan_key:
            plan,
          billing_mode:
            "one_time_pilot",
        },
      };
    }

    const session =
      await stripe.checkout.sessions.create(
        params,
      );

    if (!session.url) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Stripe Checkout URL was not returned.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      url:
        session.url,
      checkoutSessionId:
        session.id,
    });
  } catch (error) {
    console.error(
      "[aegisora] checkout error:",
      error instanceof Error ? error.message : "unknown error",
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to start checkout. Please try again or contact support.",
      },
      { status: 500 },
    );
  }
}