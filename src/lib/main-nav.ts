export type NavItem = { label: string; href: string; desc?: string };
export type NavEntry = { label: string; href: string; items?: NavItem[] };
export type FooterGroup = { title: string; links: NavItem[] };

export const announcement = {
  badge: "Enterprise Pilot",
  text: "Run Aegisora on your own agents in a scoped, time-boxed pilot.",
  label: "Apply now",
  href: "/pilot",
};

export const headerCtas = {
  login: { label: "Log in", href: "/login" },
  primary: { label: "Request a Pilot", href: "/pilot" },
};

export const mainNav: NavEntry[] = [
  { label: "Platform", href: "/product" },
  { label: "Solutions", href: "/solutions" },
  {
    label: "Documentation",
    href: "/docs",
    items: [
      { label: "Documentation", href: "/docs", desc: "Guides and reference." },
      { label: "Technical reference", href: "/docs/technical", desc: "Pipeline, identities, Continuity Seal, release history." },
    ],
  },
  { label: "Security", href: "/security" },
  {
    label: "Enterprise",
    href: "/enterprise",
    items: [
      { label: "Enterprise", href: "/enterprise", desc: "Governance and audit at scale." },
      { label: "Pilot Program", href: "/pilot", desc: "A scoped evaluation on your agents." },
      { label: "Pricing", href: "/pricing", desc: "Plans from free to custom." },
    ],
  },
];

export const footerGroups: FooterGroup[] = [
  {
    title: "Product",
    links: [
      { label: "Platform", href: "/product" },
      { label: "Solutions", href: "/solutions" },
      { label: "Documentation", href: "/docs" },
      { label: "Technical reference", href: "/docs/technical" },
    ],
  },
  {
    title: "Enterprise",
    links: [
      { label: "Enterprise", href: "/enterprise" },
      { label: "Pilot Program", href: "/pilot" },
      { label: "Pricing", href: "/pricing" },
      { label: "Support", href: "/support" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Security", href: "/security" },
      { label: "Privacy", href: "/trust/privacy" },
      { label: "Subprocessors", href: "/trust/subprocessors" },
      { label: "Data processing", href: "/legal/dpa" },
    ],
  },
  {
    title: "Company and Legal",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Terms", href: "/terms" },
      { label: "Impressum", href: "/impressum" },
    ],
  },
];