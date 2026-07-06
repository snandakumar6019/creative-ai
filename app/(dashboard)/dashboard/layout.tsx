import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?error=Supabase%20environment%20variables%20are%20not%20configured.");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/35">
      <DashboardSidebar />
      <div className="flex min-h-screen flex-col lg:pl-72">
        <DashboardHeader
          email={user.email ?? "member@creative.ai"}
          mobileNavigation={<MobileSidebar />}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
