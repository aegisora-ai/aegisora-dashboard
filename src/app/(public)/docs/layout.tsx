import Link from "next/link";

const groups = [
  {
    title: "GETTING STARTED",
    items: [
      { label: "Introduction", href: "/docs" },
      { label: "Quickstart", href: "/docs" },
    ],
  },
  {
    title: "CORE CONCEPTS",
    items: [
      { label: "Workspaces and identity", href: "/docs" },
      { label: "Policies", href: "/docs" },
      { label: "Risk evaluation", href: "/docs" },
    ],
  },
];

export default function DocsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 md:flex-row">
      <aside className="w-full shrink-0 md:w-56">
        <nav className="sticky top-24 space-y-7">
          {groups.map((g) => (
            <div key={g.title}>
              <h2 className="mb-2 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">{g.title}</h2>
              <ul className="space-y-1.5 text-sm">
                {g.items.map((i) => (
                  <li key={i.label}>
                    <Link href={i.href} className="text-muted-foreground hover:text-foreground">{i.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 max-w-3xl">{children}</main>
    </div>
  );
}