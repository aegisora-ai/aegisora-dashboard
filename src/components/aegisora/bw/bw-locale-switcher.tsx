"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function BwLocaleSwitcher() {
  const current = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Nav");
  if (routing.locales.length < 2) return null;
  return (
    <div className="aegh__lang" role="group" aria-label={t("language")}>
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === current}
          className={"aegh__langbtn" + (l === current ? " is-on" : "")}
          onClick={() => {
            if (l !== current) router.replace(pathname, { locale: l });
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}