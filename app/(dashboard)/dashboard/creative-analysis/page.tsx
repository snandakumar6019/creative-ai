"use client";

import Image from "next/image";
import {
  Boxes,
  Brain,
  Clapperboard,
  Eye,
  Heart,
  Layers3,
  Megaphone,
  MousePointerClick,
  Palette,
  Sparkles,
  Tag,
  Users
} from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AnalysisField = {
  label: string;
  value: string;
  icon: typeof Sparkles;
};

type AnalyzedCreative = {
  id: string;
  brandName: string;
  adType: string;
  mediaType: "Image" | "Video" | "Carousel";
  status: "Active" | "Inactive";
  date: string;
  headline: string;
  palette: string;
  score: string;
  confidence: string;
  fields: AnalysisField[];
};

const analyzedCreatives: AnalyzedCreative[] = [
  {
    id: "northstar-launch-video",
    brandName: "Northstar Labs",
    adType: "Launch Video",
    mediaType: "Video",
    status: "Active",
    date: "Jul 2, 2026",
    headline: "Turn campaign chaos into a weekly creative system.",
    palette: "from-teal-500 via-cyan-500 to-slate-950",
    score: "92",
    confidence: "High",
    fields: [
      { label: "Hook", value: "Leads with a pain-point transformation: campaign chaos becomes a repeatable weekly system.", icon: Sparkles },
      { label: "Target Audience", value: "Growth teams, creative operations leads, and performance marketers managing high-volume campaigns.", icon: Users },
      { label: "Offer", value: "Book a demo for a structured creative workflow that reduces review cycles and speeds up output.", icon: Tag },
      { label: "Messaging", value: "Operational clarity, measurable speed, fewer bottlenecks, and better visibility across production.", icon: Megaphone },
      { label: "Tone", value: "Confident, practical, calm, and executive-friendly.", icon: Brain },
      { label: "Visual Style", value: "Clean SaaS interface shots, dark overlays, teal accents, and crisp motion between workflow states.", icon: Palette },
      { label: "Creative Structure", value: "Problem statement, workflow reveal, proof metric, product montage, then demo CTA.", icon: Layers3 },
      { label: "CTA", value: "Book a demo", icon: MousePointerClick },
      { label: "Emotion", value: "Relief, control, momentum, and trust.", icon: Heart },
      { label: "Objects Detected", value: "Laptop, dashboard UI, timeline cards, team avatars, approval checklist, graph widgets.", icon: Boxes },
      { label: "UGC / Studio Classification", value: "Studio-produced with founder-style narration and polished product capture.", icon: Clapperboard }
    ]
  },
  {
    id: "orbit-carousel",
    brandName: "Orbit Studio",
    adType: "Feature Carousel",
    mediaType: "Carousel",
    status: "Active",
    date: "Jun 28, 2026",
    headline: "Ship ten ad concepts before your next standup.",
    palette: "from-fuchsia-500 via-rose-500 to-zinc-950",
    score: "88",
    confidence: "Medium",
    fields: [
      { label: "Hook", value: "A speed promise framed around a familiar team ritual: before your next standup.", icon: Sparkles },
      { label: "Target Audience", value: "Lean startup marketers, agency creative teams, and founders producing ad variations quickly.", icon: Users },
      { label: "Offer", value: "Start free and generate multiple ad concepts from templates.", icon: Tag },
      { label: "Messaging", value: "Rapid ideation, more creative volume, easier approvals, and template-led execution.", icon: Megaphone },
      { label: "Tone", value: "Energetic, clever, direct, and slightly playful.", icon: Brain },
      { label: "Visual Style", value: "Bright carousel panels, bold typography, template previews, and high-contrast product snippets.", icon: Palette },
      { label: "Creative Structure", value: "Time-based promise, three feature panels, output examples, social proof, free-start CTA.", icon: Layers3 },
      { label: "CTA", value: "Start free", icon: MousePointerClick },
      { label: "Emotion", value: "Urgency, optimism, creative confidence.", icon: Heart },
      { label: "Objects Detected", value: "Carousel cards, ad mockups, prompt input, template grid, cursor pointer.", icon: Boxes },
      { label: "UGC / Studio Classification", value: "Studio-designed carousel with product-led motion and graphic overlays.", icon: Clapperboard }
    ]
  },
  {
    id: "launchdesk-static",
    brandName: "LaunchDesk",
    adType: "Static Social",
    mediaType: "Image",
    status: "Inactive",
    date: "Jun 21, 2026",
    headline: "Creative testing without the production bottleneck.",
    palette: "from-amber-400 via-orange-500 to-stone-950",
    score: "81",
    confidence: "Medium",
    fields: [
      { label: "Hook", value: "Names the bottleneck directly and promises creative testing without production drag.", icon: Sparkles },
      { label: "Target Audience", value: "Performance marketers and growth leaders under pressure to test more creative angles.", icon: Users },
      { label: "Offer", value: "Compare plans for a lower-friction creative testing platform.", icon: Tag },
      { label: "Messaging", value: "More tests, lower production overhead, stronger campaign learning loops.", icon: Megaphone },
      { label: "Tone", value: "Assertive, pragmatic, conversion-oriented.", icon: Brain },
      { label: "Visual Style", value: "Static high-contrast layout with pricing cues, testimonial snippets, and bold headline hierarchy.", icon: Palette },
      { label: "Creative Structure", value: "Pain statement, proof quote, feature bullets, pricing anchor, CTA.", icon: Layers3 },
      { label: "CTA", value: "Compare plans", icon: MousePointerClick },
      { label: "Emotion", value: "Efficiency, certainty, reduced frustration.", icon: Heart },
      { label: "Objects Detected", value: "Quote card, pricing badge, brand logo, abstract product panels.", icon: Boxes },
      { label: "UGC / Studio Classification", value: "Studio-produced static ad with testimonial-style proof elements.", icon: Clapperboard }
    ]
  }
];

export default function CreativeAnalysisPage() {
  const [selectedId, setSelectedId] = useState(analyzedCreatives[0].id);
  const selectedCreative = useMemo(
    () => analyzedCreatives.find((creative) => creative.id === selectedId) ?? analyzedCreatives[0],
    [selectedId]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Creative Analysis"
        description="Select a competitor creative and inspect the strategic ingredients behind the ad."
        action={
          <Button type="button">
            <Sparkles className="mr-2 size-4" />
            Analyze new creative
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Analysis score" value={`${selectedCreative.score}%`} detail="Pattern quality match" icon={Eye} />
        <MetricCard label="Confidence" value={selectedCreative.confidence} detail="Placeholder model output" icon={Brain} />
        <MetricCard label="Detected objects" value="6+" detail="Visual entities extracted" icon={Boxes} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.42fr_1fr]">
        <aside className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold tracking-normal">Competitor creatives</h2>
            <p className="text-sm text-muted-foreground">Choose a creative to view placeholder analysis.</p>
          </div>
          <div className="grid gap-3">
            {analyzedCreatives.map((creative) => (
              <button
                key={creative.id}
                type="button"
                onClick={() => setSelectedId(creative.id)}
                className={cn(
                  "overflow-hidden rounded-lg border bg-card text-left transition hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selectedCreative.id === creative.id && "border-primary shadow-sm"
                )}
              >
                <div className={cn("relative h-24 bg-gradient-to-br", creative.palette)}>
                  <Image
                    src="/creative-ai-preview.png"
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 22vw, 100vw"
                    className="object-cover opacity-18 mix-blend-screen"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <Badge className="absolute left-3 top-3" variant={creative.status === "Active" ? "default" : "outline"}>
                    {creative.status}
                  </Badge>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{creative.brandName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{creative.adType}</p>
                    </div>
                    <Badge variant="secondary">{creative.mediaType}</Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-4">
          <Card className="overflow-hidden">
            <div className={cn("relative min-h-56 bg-gradient-to-br", selectedCreative.palette)}>
              <Image
                src="/creative-ai-preview.png"
                alt=""
                fill
                priority
                sizes="(min-width: 1280px) 58vw, 100vw"
                className="object-cover opacity-18 mix-blend-screen"
              />
              <div className="absolute inset-0 bg-black/25" />
              <div className="absolute inset-x-5 bottom-5">
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">{selectedCreative.mediaType}</Badge>
                  <Badge variant={selectedCreative.status === "Active" ? "default" : "outline"}>
                    {selectedCreative.status}
                  </Badge>
                </div>
                <h2 className="max-w-2xl text-2xl font-semibold tracking-normal text-white">
                  {selectedCreative.headline}
                </h2>
                <p className="mt-2 text-sm text-white/75">
                  {selectedCreative.brandName} · {selectedCreative.adType} · {selectedCreative.date}
                </p>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {selectedCreative.fields.map((field) => (
              <AnalysisCard key={field.label} field={field} />
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Eye;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <Icon className="size-4 text-primary" />
        </div>
        <p className="mt-4 text-3xl font-semibold tracking-normal">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function AnalysisCard({ field }: { field: AnalysisField }) {
  const Icon = field.icon;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30 p-5">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-9 items-center justify-center rounded-md bg-background">
            <Icon className="size-4 text-primary" />
          </span>
          {field.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <p className="text-sm leading-6 text-muted-foreground">{field.value}</p>
      </CardContent>
    </Card>
  );
}
