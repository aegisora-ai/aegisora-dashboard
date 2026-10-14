import { NextResponse } from "next/server";

import {
  getAdminClient,
  getWorkspaceContext,
} from "@/lib/aegisora/billing";

export const runtime = "nodejs";

export async function GET() {
  try {
    const auth =
      await getWorkspaceContext();

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

    const admin =
      getAdminClient();

    const [
      customer,
      subscription,
      entitlement,
    ] = await Promise.all([
      admin
        .from("billing_customers")
        .select(
          "stripe_customer_id,email",
        )
        .eq(
          "workspace_id",
          auth.workspaceId,
        )
        .maybeSingle(),

      admin
        .from("billing_subscriptions")
        .select(
          "stripe_subscription_id,stripe_customer_id,plan_key,status,current_period_start,current_period_end,cancel_at_period_end,livemode,updated_at",
        )
        .eq(
          "workspace_id",
          auth.workspaceId,
        )
        .order("updated_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle(),

      admin
        .from("workspace_entitlements")
        .select(
          "plan_key,status,billing_mode,stripe_customer_id,stripe_subscription_id,current_period_end,updated_at",
        )
        .eq(
          "workspace_id",
          auth.workspaceId,
        )
        .maybeSingle(),
    ]);

    if (
      customer.error ||
      subscription.error ||
      entitlement.error
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            customer.error?.message ??
            subscription.error?.message ??
            entitlement.error?.message ??
            "Billing lookup failed.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      workspaceId:
        auth.workspaceId,
      role:
        auth.role,
      customer:
        customer.data ?? null,
      subscription:
        subscription.data ?? null,
      entitlement:
        entitlement.data ?? null,
    });
  } catch (error) {
    console.error(
      "[aegisora] billing status error",
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load billing status.",
      },
      { status: 500 },
    );
  }
}