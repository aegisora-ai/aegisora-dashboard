import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">AG</span>
            </div>
            Aegisora
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground ml-6">
            <Link href="#architecture" className="hover:text-foreground transition-colors">Architecture</Link>
            <Link href="#governance" className="hover:text-foreground transition-colors">Governance</Link>
            <Link href="#enterprise" className="hover:text-foreground transition-colors">Enterprise</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="#login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Button size="sm" className="rounded-md">Get Started</Button>
        </div>

      </div>
    </header>
  );
}
