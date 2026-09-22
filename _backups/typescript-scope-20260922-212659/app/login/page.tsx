"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginValues = z.infer<
  typeof loginSchema
>;

export default function LoginPage() {
  const router = useRouter();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function submit(values: LoginValues) {
    localStorage.setItem(
      "aegisora-demo-session",
      JSON.stringify({
        email: values.email,
        createdAt: new Date().toISOString(),
      }),
    );

    router.push("/dashboard");
  }

  return (
    <div className="auth-page">
      <div style={{ position: "fixed", top: 18, left: 18 }}>
        <Link className="brand" href="/">
          <span className="brand-mark">A</span>

          <span className="brand-copy">
            <span className="brand-name">AEGISORA</span>
            <span className="brand-sub">
              runtime security
            </span>
          </span>
        </Link>
      </div>

      <div className="auth-grid">
        <div className="auth-story">
          <div className="eyebrow">
            Secure execution control
          </div>

          <h1>
            Bring your
            <br />
            agents under
            <br />
            <span className="display-accent">
              runtime control.
            </span>
          </h1>

          <p>
            The Aegisora workspace is where teams inspect
            agents, policies, decisions, approvals, traces
            and evidence.
          </p>

          <div
            className="grid grid-2"
            style={{
              marginTop: 34,
            }}
          >
            {[
              "Agent identities",
              "Policy lifecycle",
              "Decision evidence",
              "Human approvals",
            ].map((item) => (
              <div
                className="panel-soft"
                style={{
                  padding: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                key={item}
              >
                <ShieldCheck
                  size={14}
                  color="#65d6ff"
                />
                <span
                  style={{
                    fontSize: 11,
                    color: "#b7c7d6",
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-card">
          <h2>Sign in</h2>

          <div className="auth-sub">
            Workspace preview is enabled locally.
            Production identity providers are wired
            separately.
          </div>

          <form
            onSubmit={form.handleSubmit(submit)}
            className="form-grid"
          >
            <div className="field">
              <label>Email</label>
              <input
                {...form.register("email")}
                placeholder="you@company.com"
              />

              {form.formState.errors.email ? (
                <span
                  style={{
                    color: "#ff8296",
                    fontSize: 10,
                  }}
                >
                  {form.formState.errors.email.message}
                </span>
              ) : null}
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                {...form.register("password")}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              />

              {form.formState.errors.password ? (
                <span
                  style={{
                    color: "#ff8296",
                    fontSize: 10,
                  }}
                >
                  Password must contain at least 8 characters.
                </span>
              ) : null}
            </div>

            <button
              className="button button-primary"
              type="submit"
              style={{ marginTop: 5 }}
            >
              Continue to workspace
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              className="button"
              onClick={() => {
                localStorage.setItem(
                  "aegisora-demo-session",
                  JSON.stringify({
                    provider: "github-preview",
                    createdAt:
                      new Date().toISOString(),
                  }),
                );

                router.push("/dashboard");
              }}
            >
              <span style={{ fontWeight: 800, fontSize: 11 }}>GH</span>
              Continue with GitHub preview
            </button>
          </form>

          <div className="auth-meta">
            This screen is a UI and workspace preview.
            Do not treat it as production authentication
            until connected to an identity provider.
          </div>
        </div>
      </div>
    </div>
  );
}