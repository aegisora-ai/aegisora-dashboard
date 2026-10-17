import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  Code,
  FileCheck2,
  History,
  Library,
  Lock,
  Newspaper,
  Rocket,
  Scale,
  ScrollText,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export type MegaItem = { title: string; desc?: string; href: string; icon?: LucideIcon };
export type MegaGroup = { heading?: string; items: MegaItem[] };
export type MegaRailCard = { title: string; desc: string; cta: string; href: string; style: "pill" | "arrow" };
export type MegaFooterLink = { title: string; desc: string; href: string };
export type MegaMenu = {
  id: string;
  label: string;
  width: number;
  columns: MegaGroup[][];
  rail?: MegaRailCard[];
  footer: MegaFooterLink[];
};

export const MEGA_MENUS: MegaMenu[] = [
  {
    id: "products",
    label: "Products",
    width: 800,
    columns: [
      [
        {
          heading: "PLATFORM",
          items: [
            { title: "Runtime", desc: "The execution boundary for agent actions", href: "/product/runtime", icon: ShieldCheck },
            { title: "Policies", desc: "Executable governance controls", href: "/product/policies", icon: ScrollText },
          ],
        },
        {
          heading: "DECISION CONTROL",
          items: [
            { title: "Decisions", desc: "The decision inspector", href: "/product/decisions", icon: Scale },
            { title: "Approvals", desc: "Human authorization at the boundary", href: "/product/approvals", icon: UserCheck },
          ],
        },
      ],
      [
        {
          heading: "EVIDENCE AND TRUST",
          items: [
            { title: "Evidence", desc: "Connected, auditable records", href: "/product/evidence", icon: FileCheck2 },
            { title: "Security", desc: "How the execution boundary is protected", href: "/security", icon: Lock },
            { title: "Live proof", desc: "Run the live runtime proof", href: "/proof", icon: Activity },
          ],
        },
        {
          heading: "DEVELOP",
          items: [
            { title: "Quickstart", desc: "Evaluate your first action", href: "/developers/quickstart", icon: Rocket },
            { title: "API reference", desc: "Endpoints and request format", href: "/docs#api", icon: Code },
          ],
        },
      ],
    ],
    rail: [
      { title: "Test Aegisora", desc: "Create a test workspace and evaluate your first action.", cta: "Sign up", href: "/signup", style: "pill" },
      { title: "See the runtime decide", desc: "Run the live runtime proof.", cta: "Run proof", href: "/proof", style: "pill" },
      { title: "Enterprise pilot", desc: "Scope a pilot with your security team.", cta: "Learn more", href: "/enterprise", style: "pill" },
    ],
    footer: [
      { title: "View all products", desc: "Explore the full execution-control model", href: "/product" },
      { title: "Aegisora 4.0", desc: "See what this release includes", href: "/changelog" },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    width: 640,
    columns: [
      [
        {
          items: [
            { title: "Documentation", desc: "Read the docs and the API reference", href: "/docs", icon: BookOpen },
            { title: "Quickstart", desc: "Evaluate your first action", href: "/developers/quickstart", icon: Rocket },
            { title: "Blog", desc: "Articles and updates", href: "/blog", icon: Newspaper },
          ],
        },
      ],
      [
        {
          items: [
            { title: "Changelog", desc: "What each release includes", href: "/changelog", icon: History },
            { title: "Resources", desc: "Guides and reference material", href: "/resources", icon: Library },
            { title: "Trust center", desc: "Privacy, subprocessors and terms", href: "/trust", icon: ShieldCheck },
          ],
        },
      ],
    ],
    footer: [{ title: "Resources hub", desc: "Get help building with Aegisora", href: "/resources" }],
  },
  {
    id: "solutions",
    label: "Solutions",
    width: 700,
    columns: [
      [
        {
          heading: "USE CASES",
          items: [
            { title: "Runtime control", href: "/product/runtime" },
            { title: "Human approvals", href: "/product/approvals" },
            { title: "Audit evidence", href: "/product/evidence" },
            { title: "Policy governance", href: "/product/policies" },
          ],
        },
      ],
      [
        {
          heading: "AUDIENCES",
          items: [
            { title: "Builders", href: "/developers/quickstart" },
            { title: "Security leaders", href: "/enterprise" },
            { title: "Design partners", href: "/enterprise" },
          ],
        },
      ],
    ],
    rail: [
      { title: "Design partner pilot", desc: "Scope a pilot with your own policies.", cta: "Learn more", href: "/enterprise", style: "arrow" },
      { title: "Pricing", desc: "How pilots are scoped and agreed.", cta: "See pricing", href: "/pricing", style: "arrow" },
      { title: "Trust center", desc: "What we process and who helps.", cta: "See details", href: "/trust", style: "arrow" },
    ],
    footer: [{ title: "Solutions overview", desc: "How Aegisora governs agent actions", href: "/product" }],
  },
  {
    id: "company",
    label: "Company",
    width: 700,
    columns: [
      [
        {
          items: [
            { title: "About", desc: "Why the execution boundary matters", href: "/about" },
            { title: "Blog", desc: "Articles and updates", href: "/blog" },
          ],
        },
      ],
      [
        {
          items: [
            { title: "Contact", desc: "Reach the Aegisora team", href: "/contact" },
            { title: "Trust", desc: "Privacy, subprocessors and terms", href: "/trust" },
          ],
        },
      ],
    ],
    rail: [
      { title: "Contact us", desc: "Reach out to the team.", cta: "Get in touch", href: "/contact", style: "arrow" },
      { title: "Enterprise", desc: "Talk about a scoped pilot.", cta: "Talk to Enterprise", href: "/enterprise", style: "arrow" },
    ],
    footer: [],
  },
];