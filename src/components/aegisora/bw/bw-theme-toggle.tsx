"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { THEME_KEY } from "@/lib/theme";

function subscribe(cb: () => void) {
  const o = new MutationObserver(cb);
  o.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => o.disconnect();
}
const getDark = () => document.documentElement.classList.contains("dark");

export function BwThemeToggle() {
  const t = useTranslations("Nav");
  const dark = useSyncExternalStore(subscribe, getDark, () => false);

  function toggle() {
    const next = !getDark();
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {}
  }

  const label = dark ? t("toggleLight") : t("toggleDark");
  return (
    <button type="button" className="aegh__icon" onClick={toggle} aria-label={label} title={label}>
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  );
}