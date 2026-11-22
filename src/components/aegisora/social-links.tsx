import { FaDiscord, FaGithub, FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { cn } from "@/lib/utils";

export const SOCIAL = {
  github: "https://github.com/aegisora-ai/aegisora",
  linkedin: "https://de.linkedin.com/company/aegisora",
  youtube: "https://www.youtube.com/@Aegisora",
  x: "https://x.com/aegisora_ai",
  instagram: "https://www.instagram.com/aegisora/", discord: "https://discord.gg/8CM3PpQRT5",
};

const ITEMS = [
  { key: "github", label: "GitHub", Icon: FaGithub },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn },
  { key: "youtube", label: "YouTube", Icon: FaYoutube },
  { key: "x", label: "X", Icon: FaXTwitter },
  { key: "instagram", label: "Instagram", Icon: FaInstagram }, { key: "discord", label: "Discord", Icon: FaDiscord },
] as const;

export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {ITEMS.map(({ key, label, Icon }) => (
        <li key={key}>
          <a
            href={SOCIAL[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <Icon className="size-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function GithubButton({ className }: { className?: string }) {
  return (
    <a
      href={SOCIAL.github}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Aegisora on GitHub (open source)"
      title="Open source on GitHub"
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary",
        className,
      )}
    >
      <FaGithub className="size-4" /> <span className="hidden sm:inline">GitHub</span>
    </a>
  );
}