"use client";

import { CheckCircle2, ImageIcon, Sparkles, WandSparkles } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveGeneratedCreative } from "@/app/(dashboard)/dashboard/generated/actions";
import {
  generateCreativeAction,
  initialCreativeGeneratorState
} from "@/app/(dashboard)/dashboard/generator/actions";
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

type ProductContext = {
  id: string;
  product_name: string;
  brand_name: string;
  product_description: string;
  target_audience: string;
  brand_colors: string[];
  brand_voice: string;
  existing_assets: string;
  notes: string;
};

type CompetitorContext = {
  id: string;
  name: string;
  facebook_ad_library_url: string;
  notes: string;
};

function competitorPrompt(competitor: CompetitorContext | undefined) {
  if (!competitor) {
    return "No competitor selected. Create an original product-led direction using only the product and brand context.";
  }

  return [
    `Competitor: ${competitor.name}`,
    `Facebook Ad Library: ${competitor.facebook_ad_library_url}`,
    competitor.notes ? `Saved observations: ${competitor.notes}` : "Review the linked page and add observations here before generating."
  ].join("\n");
}

export function ProductCreativeGenerator({
  product,
  competitors,
  initialCompetitorId
}: {
  product: ProductContext;
  competitors: CompetitorContext[];
  initialCompetitorId?: string;
}) {
  const firstCompetitor =
    competitors.find((competitor) => competitor.id === initialCompetitorId) ?? competitors[0];
  const [selectedCompetitorId, setSelectedCompetitorId] = useState(firstCompetitor?.id ?? "");
  const [competitorAnalysis, setCompetitorAnalysis] = useState(
    competitorPrompt(firstCompetitor)
  );
  const [state, formAction, isPending] = useActionState(
    generateCreativeAction,
    initialCreativeGeneratorState
  );

  const productInformation = useMemo(
    () =>
      [
        `${product.product_name} by ${product.brand_name}`,
        `Product: ${product.product_description || "Not provided"}`,
        `Audience: ${product.target_audience || "Not provided"}`,
        `Brand voice: ${product.brand_voice || "Not provided"}`,
        `Brand colors: ${product.brand_colors.join(", ") || "Not provided"}`,
        `Existing assets: ${product.existing_assets || "Not provided"}`,
        `Constraints and notes: ${product.notes || "None"}`
      ].join("\n"),
    [product]
  );

  const selectedCompetitor = competitors.find(
    (competitor) => competitor.id === selectedCompetitorId
  );
  const returnTo = `/dashboard/product-pages/${product.id}?tab=history`;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-normal">Creative Generator</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Product context stays loaded. Pick an attached competitor, add observations, and generate.
          </p>
        </div>
        <Badge variant="outline">{product.product_name}</Badge>
      </div>

      {state.status === "error" && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {state.status === "success" && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-primary">
          <CheckCircle2 className="size-4" />
          New product-specific creative directions are ready below.
        </div>
      )}

      <form action={formAction} className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Context</CardTitle>
            <CardDescription>
              These inputs are scoped to this product and reused between generations.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="productInformation">Product and brand context</Label>
              <Textarea
                id="productInformation"
                name="productInformation"
                defaultValue={productInformation}
                rows={9}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="competitor-source">Competitor source</Label>
              <select
                id="competitor-source"
                value={selectedCompetitorId}
                onChange={(event) => {
                  const competitor = competitors.find((item) => item.id === event.target.value);
                  setSelectedCompetitorId(event.target.value);
                  setCompetitorAnalysis(competitorPrompt(competitor));
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">No competitor — product-led concept</option>
                {competitors.map((competitor) => (
                  <option key={competitor.id} value={competitor.id}>
                    {competitor.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="competitorAnalysis">Competitor observations</Label>
              <Textarea
                id="competitorAnalysis"
                name="competitorAnalysis"
                value={competitorAnalysis}
                onChange={(event) => setCompetitorAnalysis(event.target.value)}
                rows={7}
                required
              />
              <p className="text-xs text-muted-foreground">
                The app stores the page link; paste your useful patterns here instead of copying the ad.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="userInstructions">What should this variation achieve?</Label>
              <Textarea
                id="userInstructions"
                name="userInstructions"
                placeholder="Example: Create a paid-social concept for skeptical founders, lead with proof, and avoid urgency claims."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <WandSparkles className="size-5 text-primary" />
              Direction
            </CardTitle>
            <CardDescription>Adjust the output without re-entering product context.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <ControlSelect name="hookStyle" label="Hook style" options={["Pain-point transformation", "Contrarian opener", "Metric-led proof", "Founder confession"]} />
              <ControlSelect name="tone" label="Tone" options={["Confident", "Conversational", "Premium", "Playful", "Urgent"]} />
              <ControlSelect name="visualStyle" label="Visual style" options={["Clean product demo", "UGC selfie", "Editorial proof", "Bold static graphic"]} />
              <ControlSelect name="creatorPersona" label="Persona" options={["Founder operator", "Creative strategist", "Marketing lead", "Customer champion"]} />
              <ControlSelect name="background" label="Background" options={["Product UI montage", "Studio desk", "Office workflow", "Neutral gradient"]} />
              <ControlSelect name="videoLength" label="Length" options={["15 seconds", "6 seconds", "30 seconds", "45 seconds"]} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cta">CTA</Label>
              <Input id="cta" name="cta" defaultValue="Learn more" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="generationNotes">Additional constraints</Label>
              <Textarea
                id="generationNotes"
                name="generationNotes"
                placeholder="Channel, required claims, prohibited wording, offer details..."
                rows={4}
              />
            </div>

            <GenerateButton isPending={isPending} />
          </CardContent>
        </Card>
      </form>

      {state.result && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-normal">Generated directions</h2>
            <p className="text-sm text-muted-foreground">
              Review the strategy, then save useful variants into this product’s history.
            </p>
          </div>

          <section className="grid gap-4 lg:grid-cols-3">
            <OutputCard title="Headlines" items={state.result.headlines} />
            <OutputCard title="Hooks" items={state.result.hooks} />
            <OutputCard title="Ad copy" items={state.result.adCopy} />
          </section>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Production brief</CardTitle>
              <CardDescription>{state.result.videoScript.title} · {state.result.videoScript.duration}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-lg border bg-muted/25 p-4">
                <p className="text-sm font-medium">Image prompt</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{state.result.imagePrompt}</p>
              </div>
              <div className="grid gap-3">
                {state.result.videoScript.scenes.map((scene) => (
                  <div key={scene.timestamp} className="rounded-lg border p-4">
                    <p className="text-xs font-medium text-primary">{scene.timestamp}</p>
                    <p className="mt-2 text-sm font-medium">{scene.visual}</p>
                    <p className="mt-1 text-sm text-muted-foreground">VO: {scene.voiceover}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Text: {scene.onScreenText}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {state.result.generatedCreatives.map((creative) => (
              <Card key={creative.title} className="overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${creative.palette}`} />
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                      <ImageIcon className="size-5 text-primary" />
                    </div>
                    <Badge variant="outline">{creative.format}</Badge>
                  </div>
                  <CardTitle className="text-lg">{creative.title}</CardTitle>
                  <CardDescription>{creative.hook}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={saveGeneratedCreative}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="productName" value={product.product_name} />
                    <input type="hidden" name="competitorName" value={selectedCompetitor?.name ?? "Product-led concept"} />
                    <input type="hidden" name="prompt" value={creative.prompt} />
                    <input type="hidden" name="title" value={creative.title} />
                    <input type="hidden" name="format" value={creative.format} />
                    <input type="hidden" name="status" value={creative.status} />
                    <input type="hidden" name="hook" value={creative.hook} />
                    <input type="hidden" name="cta" value={creative.cta} />
                    <input type="hidden" name="assetUrl" value="/creative-ai-preview.png" />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <Button type="submit" variant="outline" className="w-full">
                      <Sparkles className="mr-2 size-4" />
                      Save to product history
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </section>
        </div>
      )}
    </section>
  );
}

function ControlSelect({ name, label, options }: { name: string; label: string; options: string[] }) {
  const id = `generator-${name}`;

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
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function GenerateButton({ isPending }: { isPending: boolean }) {
  const { pending } = useFormStatus();
  const disabled = pending || isPending;

  return (
    <Button type="submit" size="lg" disabled={disabled}>
      <WandSparkles className="mr-2 size-4" />
      {disabled ? "Generating..." : "Generate for this product"}
    </Button>
  );
}

function OutputCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
      <CardContent className="grid gap-2">
        {items.map((item) => (
          <div key={item} className="rounded-md border bg-muted/25 p-3 text-sm leading-6">{item}</div>
        ))}
      </CardContent>
    </Card>
  );
}
