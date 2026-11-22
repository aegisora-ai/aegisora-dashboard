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
  {
    label: "Products",
    href: "/product",
    items: [
      { label: "Platform", href: "/product", desc: "The full execution-control model." },
      { label: "Runtime", href: "/docs/technical#pipeline", desc: "The execution boundary for agent actions." },
      { label: "Policies", href: "/docs/technical#authority", desc: "Executable governance controls." },
      { label: "Decisions", href: "/docs/technical#decisions", desc: "The decision inspector." },
      { label: "Approvals", href: "/docs/technical#approvals", desc: "Human authorization at the boundary." },
      { label: "Evidence", href: "/docs/technical#evidence", desc: "Connected, auditable records." },
      { label: "Live proof", href: "/proof", desc: "Run the live runtime proof." },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions",
    items: [
      { label: "Solutions overview", href: "/solutions", desc: "How Aegisora governs agent actions." },
      { label: "Runtime control", href: "/docs/technical#pipeline", desc: "Control what agents are allowed to do." },
      { label: "Human approvals", href: "/docs/technical#approvals", desc: "Escalate sensitive actions to people." },
      { label: "Audit evidence", href: "/docs/technical#evidence", desc: "Evidence for every decision." },
      { label: "Policy governance", href: "/docs/technical#authority", desc: "Versioned, enforceable policies." },
    ],
  },
  {
    label: "Resources",
    href: "/docs",
    items: [
      { label: "Documentation", href: "/docs", desc: "Guides and reference." },
      { label: "Technical reference", href: "/docs/technical", desc: "Pipeline, identities, Continuity Seal, release history." },
      { label: "Changelog", href: "/docs/technical#releases", desc: "What each release includes." },
      { label: "Security", href: "/security", desc: "How the execution boundary is protected." },
      { label: "Trust center", href: "/trust", desc: "Privacy, subprocessors and terms." },
      { label: "Blog", href: "/blog", desc: "Articles and updates." },
    ],
  },
  { label: "Enterprise", href: "/enterprise" },
  { label: "Pricing", href: "/pricing" },
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
      { label: "Live proof", href: "/proof" },
      { label: "Trust center", href: "/trust" },
      { label: "Privacy", href: "/trust/privacy" },
      { label: "Subprocessors", href: "/trust/subprocessors" },
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