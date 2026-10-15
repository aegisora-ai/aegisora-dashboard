import "server-only";

import Stripe from "stripe";
import {
  createClient as createAdminClient,
} from "@supabase/supabase-js";
import {
  createClient as createServerClient,
} from "@/lib/supabase/server";

export type BillingPlan =
  | "founder_pilot"
  | "pilot"
  | "team"
  | "business"
  | "enterprise";

export const BILLING_PLANS: Record<
  BillingPlan,
  {
    envKey: string;
    mode: "payment" | "subscription";
  }
> = {
  founder_pilot: {
    envKey: "STRIPE_PRICE_FOUNDER_PILOT",
    mode: "payment",
  },
  pilot: {
    envKey: "STRIPE_PRICE_PILOT",
    mode: "payment",
  },
  team: {
    envKey: "STRIPE_PRICE_TEAM",
    mode: "subscription",
  },
  business: {
    envKey: "STRIPE_PRICE_BUSINESS",
    mode: "subscription",
  },
  enterprise: {
    envKey: "STRIPE_PRICE_ENTERPRISE",
    mode: "subscription",
  },
};

function env(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(
      env("STRIPE_SECRET_KEY"),
    );
  }

  return stripeInstance;
}

export function getAdminClient() {
  return createAdminClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    (process.env.SUPABASE_SECRET_KEY || env("SUPABASE_SERVICE_ROLE_KEY")),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

export function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ??
    "https://www.aegisora.org"
  ).replace(/\/+$/, "");
}

export function isBillingPlan(
  value: unknown,
): value is BillingPlan {
  return (
    value === "founder_pilot" ||
    value === "pilot" ||
    value === "team" ||
    value === "business" ||
    value === "enterprise"
  );
}

export function getPriceId(
  plan: BillingPlan,
): string | null {
  return (
    process.env[BILLING_PLANS[plan].envKey] ??
    null
  );
}

export async function getWorkspaceContext() {
  const supabase =
    await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      workspaceId: null,
      role: null,
    };
  }

  const { data: membership } =
    await supabase
      .from("workspace_members")
      .select(
        "workspace_id,user_id,role",
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

  if (!membership) {
    return {
      user,
      workspaceId: null,
      role: null,
    };
  }

  return {
    user,
    workspaceId: String(
      membership.workspace_id,
    ),
    role: String(
      membership.role,
    ),
  };
}

export async function requireBillingAdmin() {
  const context =
    await getWorkspaceContext();

  const role =
    String(context.role ?? "")
      .toLowerCase();

  return {
    ...context,
    authorized:
      Boolean(
        context.user &&
        context.workspaceId,
      ) &&
      (role === "owner" ||
        role === "admin"),
  };
}

export async function ensureStripeCustomer(
  params: {
    workspaceId: string;
    userId: string;
    email?: string | null;
  },
) {
  const admin = getAdminClient();
  const stripe = getStripe();

  const { data: existing } =
    await admin
      .from("billing_customers")
      .select(
        "stripe_customer_id",
      )
      .eq(
        "workspace_id",
        params.workspaceId,
      )
      .maybeSingle();

  if (existing?.stripe_customer_id) {
    return String(
      existing.stripe_customer_id,
    );
  }

  const customer =
    await stripe.customers.create({
      email:
        params.email ?? undefined,
      metadata: {
        workspace_id:
          params.workspaceId,
        user_id:
          params.userId,
      },
    });

  const { error } =
    await admin
      .from("billing_customers")
      .upsert(
        {
          workspace_id:
            params.workspaceId,
          stripe_customer_id:
            customer.id,
          email:
            params.email ?? null,
        },
        {
          onConflict:
            "workspace_id",
        },
      );

  if (error) {
    throw new Error(
      `Stripe customer persistence failed: ${error.message}`,
    );
  }

  return customer.id;
}
