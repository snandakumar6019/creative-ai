"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { SidebarContent } from "@/components/dashboard/dashboard-sidebar";
import { Button } from "@/components/ui/button";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <Button
        aria-label="Open navigation"
        className="lg:hidden"
        size="icon"
        type="button"
        variant="ghost"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" />
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation overlay"
            className="absolute inset-0 bg-black/55"
            type="button"
            onClick={() => setOpen(false)}
          />
          <aside className="relative h-full w-[min(20rem,86vw)] bg-sidebar text-sidebar-foreground shadow-soft">
            <Button
              aria-label="Close navigation"
              className="absolute right-3 top-3 text-sidebar-foreground hover:bg-white/10 hover:text-white"
              size="icon"
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              <X className="size-5" />
            </Button>
            <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
