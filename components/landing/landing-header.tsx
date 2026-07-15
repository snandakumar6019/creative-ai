import Link from "next/link";

import { ModeToggle } from "@/components/providers/mode-toggle";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="container flex h-[72px] items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link className="transition-colors hover:text-foreground" href="/dashboard/product-pages">
            Products
          </Link>
          <Link className="transition-colors hover:text-foreground" href="/dashboard/generated">
            Creative History
          </Link>
          <Link className="transition-colors hover:text-foreground" href="/dashboard">
            Dashboard
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
