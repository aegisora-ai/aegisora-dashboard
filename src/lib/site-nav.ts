export type NavLink = { label: string; href: string; desc?: string };
export type NavGroup = { label: string; href?: string; items?: NavLink[] };

export const nav: NavGroup[] = [
  {
    label: "Product",
    items: [
      { label: "Overview", href: "/product", desc: "The full execution-control model." },
      { label: "Runtime", href: "/docs/technical#pipeline", desc: "Request to evidence, stage by stage." },
      { label: "Policies", href: "/docs/technical#authority", desc: "Executable governance controls." },
      { label: "Decisions", href: "/docs/technical#decisions", desc: "The decision inspector." },
      { label: "Approvals", href: "/docs/technical#approvals", desc: "Human authorization at the boundary." },
      { label: "Evidence", href: "/docs/technical#evidence", desc: "Connected, auditable records." },
    ],
  },
  { label: "Security", href: "/security" },
  { label: "Developers", href: "/docs" },
  { label: "Enterprise", href: "/enterprise" },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Resources",
    items: [
      { label: "Changelog", href: "/docs/technical#releases", desc: "What Aegisora 4.0 includes." },
      { label: "Company", href: "/about", desc: "Why the execution boundary matters." },
    ],
  },
];

export const footerGroups: { title: string; links: NavLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Runtime", href: "/docs/technical#pipeline" },
      { label: "Policies", href: "/docs/technical#authority" },
      { label: "Decisions", href: "/docs/technical#decisions" },
      { label: "Approvals", href: "/docs/technical#approvals" },
      { label: "Evidence", href: "/docs/technical#evidence" },
    ],
  },
  {
    title: "Build",
    links: [
      { label: "Developers", href: "/docs" },
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
      { label: "Changelog", href: "/docs/technical#releases" },
      { label: "About", href: "/about" },
      { label: "Privacy", href: "/trust/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Subprocessors", href: "/trust/subprocessors" },
    ],
  },
];