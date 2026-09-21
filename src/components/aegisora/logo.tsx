import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image src="/LOGO.png" alt="Aegisora" width={22} height={22} className="rounded-sm" priority />
      <span className="text-[13px] font-semibold tracking-[0.22em]">AEGISORA</span>
    </span>
  );
}