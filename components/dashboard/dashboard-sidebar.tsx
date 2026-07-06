"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  ImageIcon,
  LayoutDashboard,
  Library,
  Settings,
  WandSparkles
} from "lucide-react";

import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

export const dashboardNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Product Pages", href: "/dashboard/product-pages", icon: FileText },
  { title: "Competitor Library", href: "/dashboard/competitors", icon: Library },
  { title: "Creative Generator", href: "/dashboard/generator", icon: WandSparkles },
  { title: "Generated Creatives", href: "/dashboard/generated", icon: ImageIcon },
  { title: "Settings", href: "/dashboard/settings", icon: Settings }
];

export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r bg-sidebar text-sidebar-foreground lg:block">
      <SidebarContent pathname={pathname} onNavigate={onNavigate} />
    </aside>
  );
}

export function SidebarContent({
  pathname,
  onNavigate
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col p-5">
      <Logo inverted />
      <nav className="mt-8 grid gap-1">
        {dashboardNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-foreground/72 transition-colors hover:bg-white/10 hover:text-white",
                isActive && "bg-sidebar-active text-white"
              )}
            >
              <item.icon className="size-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.06] p-4">
        <p className="text-sm font-medium">Creative queue</p>
        <p className="mt-2 text-sm text-sidebar-foreground/60">
          19 briefs prepared for generation.
        </p>
      </div>
    </div>
  );
}
