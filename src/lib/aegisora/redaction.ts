const SENSITIVE_KEY = /(?:e-?mail|phone|mobile|telephone|ssn|social.?security|password|secret|token|api.?key|authorization|cookie|credit.?card|card.?number|date.?of.?birth|address)/i;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const BEARER = /\bBearer\s+[A-Z0-9._~+\/-]+=*/gi;
const JWT = /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g;
const SECRET = /\b(?:aeg_(?:live|test)_[A-Za-z0-9_-]{12,}|sk_(?:live|test)_[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9_]{20,})\b/gi;
const US_SSN = /\b(?!000|666|9\d\d)\d{3}[- ]?(?!00)\d{2}[- ]?(?!0000)\d{4}\b/g;
const IPV4 = /\b(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}\b/g;
const CARD_CANDIDATE = /\b(?:\d[ -]?){13,19}\b/g;
const INTERNATIONAL_PHONE = /\+\s?\d(?:[\s().-]*\d){7,14}/g;

function passesLuhn(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

export function maskSensitiveText(value: string): string {
  return value
    .replace(BEARER, "[REDACTED_TOKEN]")
    .replace(JWT, "[REDACTED_TOKEN]")
    .replace(SECRET, "[REDACTED_TOKEN]")
    .replace(EMAIL, "[REDACTED_EMAIL]")
    .replace(US_SSN, "[REDACTED_SSN]")
    .replace(IPV4, "[REDACTED_IP]")
    .replace(INTERNATIONAL_PHONE, "[REDACTED_PHONE]")
    .replace(CARD_CANDIDATE, (candidate) => passesLuhn(candidate) ? "[REDACTED_CARD]" : candidate);
}

/** Recursively masks sensitive values by key and common PII/credential patterns. */
export function maskSensitiveData(value: unknown, depth = 0): unknown {
  if (depth > 20) return "[MAX_DEPTH]";
  if (typeof value === "string") return maskSensitiveText(value);
  if (Array.isArray(value)) return value.map((item) => maskSensitiveData(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [
      key,
      SENSITIVE_KEY.test(key) ? "[REDACTED]" : maskSensitiveData(child, depth + 1),
    ]));
  }
  return value;
}
