"use client";

import { usePathname } from "@/i18n/navigation";
import { supportsLight } from "@/lib/theme";
import { ZpHeader } from "@/components/zp/header";
import { LegacySiteHeader } from "@/components/aegisora/site-header-legacy";

/** Pages listed in LIGHT_READY use the new design header; every other page keeps the navy header. */
export function SiteHeader() {
  const pathname = usePathname();
  return supportsLight(pathname) ? <ZpHeader /> : <LegacySiteHeader />;
}
