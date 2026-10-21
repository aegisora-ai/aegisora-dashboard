"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="de">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "3rem", textAlign: "center" }}>
        <h1>Etwas ist schiefgelaufen / Something went wrong</h1>
        <button onClick={() => reset()} style={{ marginTop: "1rem", padding: "0.6rem 1.2rem" }}>
          Erneut versuchen / Try again
        </button>
      </body>
    </html>
  );
}