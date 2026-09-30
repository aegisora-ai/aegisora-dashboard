import { DocsNav } from "@/components/aegisora/docs-nav";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <DocsNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}