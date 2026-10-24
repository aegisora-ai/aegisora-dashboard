"use client";

import { usePathname } from "@/i18n/navigation";
import { supportsLight } from "@/lib/theme";
import { ZpFooter } from "@/components/zp/footer";
import { LegacySiteFooter } from "@/components/aegisora/site-footer-legacy";

/** Pages listed in LIGHT_READY use the new design footer; every other page keeps the navy footer. */
export function SiteFooter() {
  const pathname = usePathname();
  return supportsLight(pathname) ? <ZpFooter /> : <LegacySiteFooter />;
}
