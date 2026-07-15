import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Layers3, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingHeader } from "@/components/landing/landing-header";

const metrics = [
  { label: "Product workspaces", value: "42" },
  { label: "Competitor pages", value: "128" },
  { label: "Creatives saved", value: "3.4k" }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <LandingHeader />
      <section className="container grid min-h-[calc(100vh-72px)] items-center gap-12 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:py-14">
        <div className="max-w-2xl">
          <Badge className="mb-5 bg-secondary text-secondary-foreground hover:bg-secondary">
            Creative operating system
          </Badge>
          <h1 className="text-5xl font-semibold tracking-normal text-foreground sm:text-6xl lg:text-7xl">
            Creative AI
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Give every product its own creative workspace—with persistent brand context,
            competitor pages, generation tools, assets, and creative history.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/login">
                Start building
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border bg-card p-4">
                <div className="text-2xl font-semibold">{metric.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.24),transparent_34%),radial-gradient(circle_at_90%_10%,hsl(var(--secondary)/0.22),transparent_28%),radial-gradient(circle_at_50%_90%,hsl(var(--accent)/0.18),transparent_34%)]" />
          <Image
            src="/creative-ai-preview.png"
            width={1160}
            height={880}
            priority
            alt="Creative AI dashboard preview"
            className="relative rounded-lg border bg-card shadow-soft"
          />
        </div>
      </section>
      <section className="border-t bg-muted/40 py-12">
        <div className="container grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Layers3,
              title: "One workspace per product",
              body: "Keep positioning, audience, brand guidelines, and assets ready for every campaign."
            },
            {
              icon: BarChart3,
              title: "Persistent competitor pages",
              body: "Attach multiple Meta Ad Library pages to the product that actually uses them."
            },
            {
              icon: Sparkles,
              title: "Context-aware generation",
              body: "Generate and save new directions without rebuilding product or competitor context."
            }
          ].map((item) => (
            <div key={item.title} className="rounded-lg border bg-card p-5">
              <item.icon className="size-5 text-primary" />
              <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
