"use client";

import Image from "next/image";
import {
  BadgeCheck,
  Clapperboard,
  Eye,
  Layers3,
  Megaphone,
  MousePointerClick,
  Palette,
  Sparkles,
  Timer,
  Users,
  WandSparkles
} from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveGeneratedCreative } from "../generated/actions";
import {
  generateCreativeAction,
  initialCreativeGeneratorState
} from "./actions";
import type { GeneratedCreativeOutput } from "@/lib/openai";

const analysis = [
  {
    label: "Hook",
    value: "Turn campaign chaos into a weekly creative system.",
    icon: Sparkles
  },
  {
    label: "Target Audience",
    value: "Growth teams and creative ops leads managing high-volume ad production.",
    icon: Users
  },
  {
    label: "Offer",
    value: "Book a demo to reduce review cycles and increase creative testing velocity.",
    icon: BadgeCheck
  },
  {
    label: "Tone",
    value: "Confident, practical, polished, and executive-friendly.",
    icon: Megaphone
  },
  {
    label: "Visual Style",
    value: "Clean SaaS UI, teal accents, quick product cuts, and workflow overlays.",
    icon: Palette
  },
  {
    label: "Creative Structure",
    value: "Problem, product reveal, proof metric, workflow montage, CTA.",
    icon: Layers3
  }
];

const defaultProductInformation =
  "AI Video Editor by FrameForge. Helps growth and creative teams turn raw product ideas into polished paid-social videos, static concepts, and scripts. Target users are performance marketers, founders, and creative operations leads.";

const defaultCompetitorAnalysis = analysis
  .map((item) => `${item.label}: ${item.value}`)
  .join("\n");

const generatedCreatives: GeneratedCreativeOutput[] = [
  {
    title: "Founder-Led Proof Cut",
    format: "Short video",
    status: "Ready",
    hook: "Your team does not need more ideas. It needs a faster way to ship them.",
    cta: "Book a demo",
    prompt:
      "Create a 15-second founder-led proof cut about replacing creative chaos with a weekly production system.",
    palette: "from-teal-500 via-cyan-500 to-slate-950"
  },
  {
    title: "Workflow Before / After",
    format: "Static image",
    status: "Draft",
    hook: "From scattered feedback to launch-ready creative in one workspace.",
    cta: "See the workflow",
    prompt:
      "Create a static before-and-after visual showing scattered feedback becoming launch-ready creative.",
    palette: "from-amber-400 via-orange-500 to-neutral-950"
  },
  {
    title: "UGC Operator Script",
    format: "Video script",
    status: "Queued",
    hook: "I used to lose a day chasing creative approvals. Now the queue moves itself.",
    cta: "Try the system",
    prompt:
      "Create a UGC-style operator script about saving time on creative approvals.",
    palette: "from-rose-500 via-fuchsia-500 to-zinc-950"
  }
];

export default function CreativeGeneratorPage() {
  const [state, formAction, isPending] = useActionState(
    generateCreativeAction,
    initialCreativeGeneratorState
  );
  const generatedCreativeCards = state.result?.generatedCreatives ?? generatedCreatives;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Creative Generator"
        description="Transform competitor analysis into new creative directions, scripts, and visual concepts."
      />

      {state.status === "error" && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {state.status === "success" && (
        <div className="rounded-lg border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-primary">
          OpenAI returned structured JSON for the generator UI.
        </div>
      )}

      <form action={formAction} className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Eye className="size-5 text-primary" />
              Original Creative Analysis
            </CardTitle>
            <CardDescription>
              Placeholder analysis imported from the selected competitor creative.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-lg border">
              <div className="relative min-h-52 bg-gradient-to-br from-teal-500 via-cyan-500 to-slate-950">
                <Image
                  src="/creative-ai-preview.png"
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1280px) 38vw, 100vw"
                  className="object-cover opacity-18 mix-blend-screen"
                />
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute inset-x-4 bottom-4">
                  <Badge variant="secondary">Northstar Labs · Launch Video</Badge>
                  <h2 className="mt-3 max-w-xl text-2xl font-semibold tracking-normal text-white">
                    Turn campaign chaos into a weekly creative system.
                  </h2>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {analysis.map((item) => (
                <AnalysisTile key={item.label} item={item} />
              ))}
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="productInformation">Product Information</Label>
                <Textarea
                  id="productInformation"
                  name="productInformation"
                  defaultValue={defaultProductInformation}
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="competitorAnalysis">Competitor Analysis</Label>
                <Textarea
                  id="competitorAnalysis"
                  name="competitorAnalysis"
                  defaultValue={defaultCompetitorAnalysis}
                  rows={5}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="userInstructions">User Instructions</Label>
                <Textarea
                  id="userInstructions"
                  name="userInstructions"
                  placeholder="Add channel, audience, offer, compliance, or creative constraints."
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <WandSparkles className="size-5 text-primary" />
              Generation controls
            </CardTitle>
            <CardDescription>
              Tune the creative direction before generating placeholder variants.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <ControlSelect
                  id="hook-style"
                  name="hookStyle"
                  label="Hook Style"
                  options={["Pain-point transformation", "Contrarian opener", "Metric-led proof", "Founder confession"]}
                />
                <ControlSelect
                  id="tone"
                  name="tone"
                  label="Tone"
                  options={["Confident", "Conversational", "Premium", "Playful", "Urgent"]}
                />
                <ControlSelect
                  id="visual-style"
                  name="visualStyle"
                  label="Visual Style"
                  options={["Clean SaaS demo", "UGC selfie", "Editorial proof", "Bold static graphic"]}
                />
                <ControlSelect
                  id="creator-persona"
                  name="creatorPersona"
                  label="Creator Persona"
                  options={["Founder operator", "Creative strategist", "Marketing lead", "Customer champion"]}
                />
                <ControlSelect
                  id="background"
                  name="background"
                  label="Background"
                  options={["Studio desk", "Product UI montage", "Office workflow", "Neutral gradient"]}
                />
                <ControlSelect
                  id="video-length"
                  name="videoLength"
                  label="Video Length"
                  options={["6 seconds", "15 seconds", "30 seconds", "45 seconds"]}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cta">CTA</Label>
                <Input id="cta" name="cta" defaultValue="Book a demo" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="generation-notes">Generation Notes</Label>
                <Textarea
                  id="generation-notes"
                  name="generationNotes"
                  placeholder="Mention any constraints, must-use claims, or channel details."
                  rows={4}
                />
              </div>

              <GenerateButton isPending={isPending} />
            </div>
          </CardContent>
        </Card>
      </form>

      {state.result && (
        <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <Card>
            <CardHeader>
              <CardTitle>Generated JSON Output</CardTitle>
              <CardDescription>Structured fields returned by OpenAI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <OutputList title="Headlines" items={state.result.headlines} />
              <OutputList title="Hooks" items={state.result.hooks} />
              <OutputList title="Ad Copy" items={state.result.adCopy} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Image prompt and video script</CardTitle>
              <CardDescription>Ready for future image and video generation steps.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/25 p-4">
                <p className="text-sm font-medium">Image Prompt</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {state.result.imagePrompt}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/25 p-4">
                <p className="text-sm font-medium">{state.result.videoScript.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Duration: {state.result.videoScript.duration}
                </p>
                <div className="mt-4 grid gap-3">
                  {state.result.videoScript.scenes.map((scene) => (
                    <div key={scene.timestamp} className="rounded-md border bg-background p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        {scene.timestamp}
                      </p>
                      <p className="mt-2 text-sm font-medium">{scene.visual}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        VO: {scene.voiceover}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Text: {scene.onScreenText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-normal">Generated creatives</h2>
            <p className="text-sm text-muted-foreground">
              Placeholder outputs based on the controls above.
            </p>
          </div>
          <Badge variant="outline">{generatedCreativeCards.length} variants</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {generatedCreativeCards.map((creative) => (
            <GeneratedCreativeCard key={creative.title} creative={creative} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ControlSelect({
  id,
  name,
  label,
  options
}: {
  id: string;
  name: string;
  label: string;
  options: string[];
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        defaultValue={options[0]}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function AnalysisTile({
  item
}: {
  item: {
    label: string;
    value: string;
    icon: typeof Sparkles;
  };
}) {
  const Icon = item.icon;

  return (
    <div className="rounded-lg border bg-muted/25 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 text-primary" />
        {item.label}
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{item.value}</p>
    </div>
  );
}

function GeneratedCreativeCard({
  creative
}: {
  creative: GeneratedCreativeOutput;
}) {
  return (
    <Card className="overflow-hidden">
      <div className={`relative aspect-[4/3] bg-gradient-to-br ${creative.palette}`}>
        <Image
          src="/creative-ai-preview.png"
          alt=""
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover opacity-18 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <Badge variant="secondary">{creative.format}</Badge>
          <Badge variant={creative.status === "Ready" ? "default" : "outline"}>
            {creative.status}
          </Badge>
        </div>
        <div className="absolute inset-x-4 bottom-4">
          <p className="text-lg font-semibold leading-tight text-white">{creative.hook}</p>
        </div>
      </div>
      <CardContent className="space-y-4 p-5">
        <div>
          <h3 className="font-semibold">{creative.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">CTA: {creative.cta}</p>
        </div>
        <div className="grid gap-2 text-sm text-muted-foreground">
          <CreativeFact icon={Clapperboard} label="Format" value={creative.format} />
          <CreativeFact icon={MousePointerClick} label="CTA" value={creative.cta} />
          <CreativeFact icon={Timer} label="Length" value="15 seconds" />
        </div>
        <form action={saveGeneratedCreative}>
          <input type="hidden" name="productId" value="" />
          <input type="hidden" name="productName" value="AI Video Editor" />
          <input type="hidden" name="competitorName" value="Northstar Labs" />
          <input
            type="hidden"
            name="prompt"
            value={creative.prompt}
          />
          <input type="hidden" name="title" value={creative.title} />
          <input type="hidden" name="format" value={creative.format} />
          <input type="hidden" name="status" value={creative.status} />
          <input type="hidden" name="hook" value={creative.hook} />
          <input type="hidden" name="cta" value={creative.cta} />
          <input type="hidden" name="assetUrl" value="/creative-ai-preview.png" />
          <Button type="submit" variant="outline" className="w-full">
            <Sparkles className="mr-2 size-4" />
            Save to library
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function GenerateButton({ isPending }: { isPending: boolean }) {
  const { pending } = useFormStatus();
  const disabled = pending || isPending;

  return (
    <Button type="submit" size="lg" className="w-full" disabled={disabled}>
      <WandSparkles className="mr-2 size-4" />
      {disabled ? "Generating..." : "Generate creatives"}
    </Button>
  );
}

function OutputList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border bg-muted/25 p-4">
      <p className="text-sm font-medium">{title}</p>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <div key={item} className="rounded-md border bg-background p-3 text-sm leading-6">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function CreativeFact({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Clapperboard;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2">
        <Icon className="size-4" />
        {label}
      </span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
