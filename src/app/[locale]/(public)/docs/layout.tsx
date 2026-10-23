import { DocsNav } from "@/components/aegisora/docs-nav";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 text-white sm:px-6 md:py-20">
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