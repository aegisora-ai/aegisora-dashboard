export type NavLink = { label: string; href: string; desc?: string };
export type NavGroup = { label: string; href?: string; items?: NavLink[] };

export const nav: NavGroup[] = [
  {
    label: "Product",
    items: [
      { label: "Overview", href: "/product", desc: "The full execution-control model." },
      { label: "Runtime", href: "/product/runtime", desc: "Request to evidence, stage by stage." },
      { label: "Policies", href: "/product/policies", desc: "Executable governance controls." },
      { label: "Decisions", href: "/product/decisions", desc: "The decision inspector." },
      { label: "Approvals", href: "/product/approvals", desc: "Human authorization at the boundary." },
      { label: "Evidence", href: "/product/evidence", desc: "Connected, auditable records." },
    ],
  },
  { label: "Security", href: "/security" },
  { label: "Developers", href: "/developers" },
  { label: "Enterprise", href: "/enterprise" },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Resources",
    items: [
      { label: "Changelog", href: "/changelog", desc: "What Aegisora 3.0 includes." },
      { label: "Company", href: "/about", desc: "Why the execution boundary matters." },
    ],
  },
];

export const footerGroups: { title: string; links: NavLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Runtime", href: "/product/runtime" },
      { label: "Policies", href: "/product/policies" },
      { label: "Decisions", href: "/product/decisions" },
      { label: "Approvals", href: "/product/approvals" },
      { label: "Evidence", href: "/product/evidence" },
    ],
  },
  {
    title: "Build",
    links: [
      { label: "Developers", href: "/developers" },
      { label: "Security", href: "/security" },
      { label: "Test Aegisora", href: "/signup" },
      { label: "Log in", href: "/login" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Enterprise", href: "/enterprise" },
      { label: "Pricing", href: "/pricing" },
      { label: "Changelog", href: "/changelog" },
      { label: "About", href: "/about" },
    ],
  },
];