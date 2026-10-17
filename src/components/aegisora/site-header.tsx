"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { Logo } from "@/components/aegisora/logo";
import { DocsMegaMenu } from "@/components/aegisora/docs-mega-menu";
import { NavDropdown, type DropdownItem } from "@/components/aegisora/nav-dropdown";

const PRODUCT_ITEMS: DropdownItem[] = [
  { title: "Overview", href: "/product", desc: "How Aegisora governs agent actions" },
  { title: "Runtime", href: "/product/runtime", desc: "The execution boundary" },
  { title: "Policies", href: "/product/policies" },
  { title: "Decisions", href: "/product/decisions" },
  { title: "Approvals", href: "/product/approvals" },
  { title: "Evidence", href: "/product/evidence" },
  { title: "Security", href: "/security" },
];

const DEVELOPERS_ITEMS: DropdownItem[] = [
  { title: "Developer Overview", href: "/developers", desc: "SDKs, integration guides" },
  { title: "Quickstart", href: "/developers/quickstart" },
  { title: "API Reference", href: "/docs#api" },
  { title: "Security", href: "/security" },
];

const RESOURCES_ITEMS: DropdownItem[] = [
  { title: "Blog", href: "/blog", desc: "Articles and updates" },
  { title: "Changelog", href: "/changelog" },
  { title: "Resources", href: "/resources" },
  { title: "Enterprise", href: "/enterprise" },
];

const MAIN_NAV = [
  { name: "Product", href: "/product", dropdown: "product" as const },
  { name: "Docs", href: "/docs", dropdown: "docs" as const },
  { name: "Developers", href: "/developers", dropdown: "developers" as const },
  { name: "Resources", href: "/resources", dropdown: "resources" as const },
  { name: "Pricing", href: "/pricing" },
];

const MOBILE_GROUPS: { title: string; items: DropdownItem[] }[] = [
  { title: "Product", items: PRODUCT_ITEMS },
  { title: "Developers", items: DEVELOPERS_ITEMS },
  { title: "Resources", items: RESOURCES_ITEMS },
];

const navLink = "text-sm font-medium text-[#c7d4ee] transition-colors hover:text-white";

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Route change intentionally closes the mobile navigation.
  useEffect(() => {
    const timer = window.setTimeout(() => setMobileOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ANNOUNCEMENT BAR */}
      <div className="border-b border-[#0f2a5c] bg-gradient-to-r from-[#00309c] to-[#0a5bd6] text-white">
        <div className="mx-auto flex min-h-12 max-w-[1280px] items-center justify-center gap-3 px-4 py-2 text-sm sm:px-6">
          <span className="hidden rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold sm:inline">Early access</span>
          <span>Create a test workspace and evaluate your first agent action.</span>
          <Link href="/signup" className="inline-flex shrink-0 items-center gap-1 font-semibold underline-offset-4 hover:underline">
            Test Aegisora <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* MAIN HEADER */}
      <header className="sticky top-0 z-[100] w-full border-b border-[#0f2a5c] bg-[#000b24]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-9">
            <Logo />
            <nav className="hidden items-center gap-6 lg:flex">
              {MAIN_NAV.map((item) =>
                item.dropdown ? (
                  <div key={item.name} className="group relative">
                    <Link href={item.href} className={"flex items-center gap-1 " + navLink}>
                      {item.name}
                      <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
                    </Link>
                    {item.dropdown === "docs" && <DocsMegaMenu />}
                    {item.dropdown === "product" && <NavDropdown items={PRODUCT_ITEMS} />}
                    {item.dropdown === "developers" && <NavDropdown items={DEVELOPERS_ITEMS} />}
                    {item.dropdown === "resources" && <NavDropdown items={RESOURCES_ITEMS} />}
                  </div>
                ) : (
                  <Link key={item.name} href={item.href} className={navLink}>
                    {item.name}
                  </Link>
                )
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-5 lg:flex">
              <Link href="/login" className={navLink}>
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center rounded bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
              >
                Test Aegisora
              </Link>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-[#27457f] p-2 text-[#c7d4ee] transition-colors hover:bg-white/10 hover:text-white focus:outline-none lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-[#000b24] px-6 pb-10 pt-28 lg:hidden">
          <nav className="flex flex-col gap-6">
            {MOBILE_GROUPS.map((g) => (
              <div key={g.title}>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8fa4cc]">{g.title}</p>
                <ul className="mt-2 flex flex-col">
                  {g.items.map((i) => (
                    <li key={i.href}>
                      <Link href={i.href} className="block rounded-md px-2 py-2.5 text-lg font-semibold text-[#e6eeff] hover:bg-white/10">
                        {i.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <Link href="/docs" className="rounded-md px-2 py-2.5 text-lg font-semibold text-[#e6eeff] hover:bg-white/10">
              Docs
            </Link>
            <Link href="/pricing" className="rounded-md px-2 py-2.5 text-lg font-semibold text-[#e6eeff] hover:bg-white/10">
              Pricing
            </Link>
            <div className="h-px w-full bg-[#0f2a5c]" />
            <Link href="/login" className="rounded-md px-2 py-2.5 text-lg font-semibold text-[#e6eeff] hover:bg-white/10">
              Log in
            </Link>
            <Link
              href="/signup"
              className="flex h-12 w-full items-center justify-center rounded bg-primary text-base font-medium text-primary-foreground hover:bg-primary-hover"
            >
              Test Aegisora
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}