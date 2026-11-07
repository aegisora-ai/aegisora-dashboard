import { redirect } from "next/navigation";

// The DPA draft still has open fields (controller, regions, measures).
// It is not shown publicly until it is complete; visitors go to the trust center instead.
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(locale === "en" ? "/trust" : "/" + locale + "/trust");
}