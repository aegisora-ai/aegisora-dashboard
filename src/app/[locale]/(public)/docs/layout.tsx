import { DocsNav } from "@/components/aegisora/docs-nav";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 text-foreground sm:px-6 md:py-20">
      <details className="mb-8 rounded-xl border border-border bg-surface-1 px-4 py-3 lg:hidden">
        <summary className="cursor-pointer text-sm font-semibold">Documentation menu</summary>
        <div className="mt-3">
          <DocsNav />
        </div>
      </details>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <DocsNav />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}