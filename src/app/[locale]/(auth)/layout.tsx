import { AuthSidePanel } from "@/components/aegisora/auth-side-panel";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-[#020b2e]">
      <AuthSidePanel />
      <main className="relative flex flex-1 items-center justify-center p-8">
        {children}
      </main>
    </div>
  );
}