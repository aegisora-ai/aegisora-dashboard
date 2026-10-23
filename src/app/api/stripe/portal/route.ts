import { NextResponse } from "next/server";

import {
  getAdminClient,
  getBaseUrl,
  getStripe,
  requireBillingAdmin,
} from "@/lib/aegisora/billing";

export const runtime = "nodejs";

export async function POST(
  request: Request,
) {
  try {
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

    const body =
      (await request.json().catch(() => ({}))) as {
        locale?: unknown;
      };

    const locale =
      body.locale === "de"
        ? "de"
        : "en";

    const admin =
      getAdminClient();

    const { data, error } =
      await admin
        .from("billing_customers")
        .select(
          "stripe_customer_id",
        )
        .eq(
          "workspace_id",
          auth.workspaceId,
        )
        .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to open billing portal.",
        },
        { status: 500 },
      );
    }

    if (
      !data?.stripe_customer_id
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No Stripe customer exists for this workspace.",
        },
        { status: 404 },
      );
    }

    const stripe =
      getStripe();

    const returnPath =
      locale === "de"
        ? "/de/dashboard/billing"
        : "/dashboard/billing";

    const session =
      await stripe.billingPortal.sessions.create(
        {
          customer:
            String(
              data.stripe_customer_id,
            ),
          return_url:
            `${getBaseUrl()}${returnPath}`,
        },
      );

    return NextResponse.json({
      success: true,
      url:
        session.url,
    });
  } catch (error) {
    console.error(
      "[aegisora] billing portal error:", error instanceof Error ? error.message : "unknown error",
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to open billing portal.",
      },
      { status: 500 },
    );
  }
}