import type { ReactNode } from "react"

import { AegisoraDashboardShell } from "@/components/aegisora/dashboard-shell"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <AegisoraDashboardShell>
      {children}
    </AegisoraDashboardShell>
  )
}