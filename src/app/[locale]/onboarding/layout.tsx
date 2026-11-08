import { AuthSplit } from "@/components/aegx/auth-split";

export default async function OnboardingLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  return <AuthSplit de={locale === "de"} wide>{children}</AuthSplit>;
}