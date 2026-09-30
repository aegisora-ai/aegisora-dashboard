import { createHmac } from "node:crypto";

export type WebhookDeliveryResult = {
  delivered: boolean;
  status: number;
  attempts: number;
};

export type WebhookFetch = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export function webhookSignature(body: string, secret: string): string {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

export async function deliverSignedWebhook(input: {
  url: string;
  event: string;
  eventId: string;
  secret: string;
  body: string;
}, options: {
  fetcher?: WebhookFetch;
  wait?: (milliseconds: number) => Promise<void>;
  maxAttempts?: number;
  timeoutMs?: number;
} = {}): Promise<WebhookDeliveryResult> {
  const fetcher = options.fetcher ?? fetch;
  const wait = options.wait ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)));
  const maxAttempts = Math.max(1, Math.min(5, options.maxAttempts ?? 3));
  const signature = webhookSignature(input.body, input.secret);
  let status = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetcher(input.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-aegisora-event": input.event,
          "x-aegisora-event-id": input.eventId,
          "x-aegisora-signature": signature,
          "idempotency-key": input.eventId,
        },
        body: input.body,
        signal: AbortSignal.timeout(options.timeoutMs ?? 3_000),
      });
      status = response.status;
      if (response.ok) return { delivered: true, status, attempts: attempt };
      if (!(status >= 500 || status === 408 || status === 429) || attempt === maxAttempts) {
        return { delivered: false, status, attempts: attempt };
      }
    } catch {
      status = 0;
      if (attempt === maxAttempts) return { delivered: false, status, attempts: attempt };
    }

    await wait(200 * 2 ** (attempt - 1));
  }

  return { delivered: false, status, attempts: maxAttempts };
}
