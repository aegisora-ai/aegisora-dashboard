import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-sm font-semibold tracking-[0.2em]">
            AEGISORA
          </Link>
          <nav aria-label="Primary" className="hidden gap-7 text-sm text-muted-foreground md:flex">
            <a href="#runtime" className="hover:text-foreground">Runtime</a>
            <a href="#outcomes" className="hover:text-foreground">Decisions</a>
            <a href="#enterprise" className="hover:text-foreground">Enterprise</a>
          </nav>
        </div>
        <Link
          href="/dashboard"
          className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Test Aegisora
        </Link>
      </div>
    </header>
  );
}