"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy } from "lucide-react";

export function CopyPage({ text }: { text: string }) {
  const t = useTranslations("HelpCenter");
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
    } catch {
      setDone(false);
    }
  }
  return (
    <button type="button" onClick={copy} className="aegx-copy">
      {done ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {done ? t("copied") : t("copy")}
    </button>
  );
}