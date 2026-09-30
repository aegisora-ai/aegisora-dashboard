"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
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

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Route change intentionally closes the mobile navigation.
  useEffect(() => {
  const timer = window.setTimeout(() => {
    setMobileOpen(false);
  }, 0);

  return () => window.clearTimeout(timer);
}, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; }
  }, [mobileOpen]);

  return (
    <>
      {/* 1. ANA HEADER - sayfa iceriginin container'iyla (max-w-6xl px-6) hizali*/}
      <header className="sticky top-0 z-[100] w-full border-b border-[#1677ff]/20 bg-[#020611]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-16 lg:h-20">

          <div className="flex items-center gap-9">
            <Logo />
            <nav className="hidden lg:flex items-center gap-6">
              {MAIN_NAV.map((item) =>
                item.dropdown ? (
                  <div key={item.name} className="group relative">
                    <Link
                      href={item.href}
                      className="flex items-center gap-1 text-sm font-medium text-slate-300 transition-colors hover:text-white"
                    >
                      {item.name}
                      <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
                    </Link>
                    {item.dropdown === "docs" && <DocsMegaMenu />}
                    {item.dropdown === "product" && <NavDropdown items={PRODUCT_ITEMS} />}
                    {item.dropdown === "developers" && <NavDropdown items={DEVELOPERS_ITEMS} />}
                    {item.dropdown === "resources" && <NavDropdown items={RESOURCES_ITEMS} />}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
                  >
                    {item.name}
                  </Link>
                )
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-5">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/onboarding"
                className="rounded-lg bg-[#1677ff] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0b6fb5] hover:shadow-[#1677ff]/20 hover:shadow-lg"
              >
                Test Aegisora
              </Link>
            </div>

            <button
              className="inline-flex items-center justify-center rounded-md border border-[#1677ff]/30 p-2 text-slate-300 transition-colors hover:bg-[#1677ff]/10 hover:text-white focus:outline-none lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. MOBIL MENU OVERLAY */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[90] bg-[#020611] pt-24 px-6 pb-8 overflow-y-auto lg:hidden">
          <nav className="flex flex-col gap-4">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="rounded-md p-3 text-xl font-semibold text-slate-200 transition-colors hover:bg-[#1677ff]/10 hover:text-[#1677ff]"
              >
                {item.name}
              </Link>
            ))}

            <div className="my-6 h-[1px] w-full bg-[#1677ff]/20" />

            <Link
              href="/login"
              className="rounded-md p-3 text-xl font-semibold text-slate-200 transition-colors hover:bg-[#1677ff]/10 hover:text-[#1677ff]"
            >
              Log in
            </Link>
            <Link
              href="/onboarding"
              className="mt-6 flex w-full items-center justify-center rounded-lg bg-[#1677ff] px-4 py-4 text-lg font-bold text-white shadow-[0_0_20px_rgba(22,119,255,0.3)] transition-all hover:bg-[#0b6fb5]"
            >
              Test Aegisora
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}



