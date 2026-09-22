import { DashboardView } from "@/components/aegisora/dashboard-view"

export default async function DashboardPage(
  props: {
    params: Promise<{
      locale: string
      section?: string[]
    }>
  },
) {

  const params =
    await props.params

  return (
    <DashboardView
      section={params.section}
    />
  )
}