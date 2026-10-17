import { NextResponse } from "next/server";

import {
  BILLING_PLANS,
  ensureStripeCustomer,
  getBaseUrl,
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

    const customerId =
      await ensureStripeCustomer({
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
      "[aegisora] checkout error",
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to start checkout.",
      },
      { status: 500 },
    );
  }
}