import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { signOut } from "@/app/actions/auth";
import { ModeToggle } from "@/components/providers/mode-toggle";
import { Button } from "@/components/ui/button";

export function DashboardHeader({
  email,
  mobileNavigation
}: {
  email: string;
  mobileNavigation: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        {mobileNavigation}
        <div>
          <p className="text-sm font-medium">Workspace</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <form action={signOut}>
          <Button aria-label="Sign out" size="icon" type="submit" variant="ghost">
            <LogOut className="size-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
