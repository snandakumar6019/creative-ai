import { Suspense } from "react";

import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-muted/40 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="flex min-h-screen flex-col justify-between bg-sidebar p-8 text-sidebar-foreground">
        <Logo inverted />
        <div className="max-w-lg">
          <p className="text-sm uppercase tracking-[0.28em] text-sidebar-foreground/60">
            Creative AI
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal">
            Turn market context into a sharper creative pipeline.
          </h1>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {["Product context", "Competitor signals", "Creative output"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm"
                >
                  {item}
                </div>
              )
            )}
          </div>
        </div>
        <p className="text-sm text-sidebar-foreground/60">
          Built for growth teams that ship creative every week.
        </p>
      </section>
      <section className="flex items-center justify-center p-6">
        <Suspense>
          <AuthForm />
        </Suspense>
      </section>
    </main>
  );
}
