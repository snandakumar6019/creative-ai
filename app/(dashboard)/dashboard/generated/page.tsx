import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  Copy,
  Download,
  Heart,
  ImageIcon,
  MousePointerClick,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  WandSparkles
} from "lucide-react";

import {
  deleteGeneratedCreative,
  duplicateGeneratedCreative,
  renameGeneratedCreative,
  saveGeneratedCreative,
  toggleGeneratedCreativeFavorite
} from "./actions";
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
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type ProductOption = {
  id: string;
  product_name: string;
  brand_name: string;
};

type GeneratedCreative = {
  id: string;
  owner_id: string;
  product_id: string | null;
  product_name: string;
  competitor_name: string;
  generation_date: string;
  prompt: string;
  title: string;
  format: string;
  status: string;
  hook: string;
  cta: string;
  asset_url: string;
  is_favorite: boolean;
  export_count: number;
  last_exported_at: string | null;
  created_at: string;
  updated_at: string;
};

type GeneratedSearchParams = Promise<{
  error?: string | string[];
  message?: string | string[];
}>;

const competitors = [
  "Northstar Labs",
  "Orbit Studio",
  "LaunchDesk",
  "PatternWorks",
  "Brightframe",
  "Vectorly"
];

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function defaultGenerationDate() {
  return new Date().toISOString().slice(0, 16);
}

function exportHref(creative: GeneratedCreative) {
  const payload = {
    id: creative.id,
    title: creative.title,
    product: creative.product_name,
    competitor: creative.competitor_name,
    generationDate: creative.generation_date,
    prompt: creative.prompt,
    format: creative.format,
    status: creative.status,
    hook: creative.hook,
    cta: creative.cta
  };

  return `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload, null, 2))}`;
}

async function getAuthenticatedSupabase() {
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

  return { supabase, userId: user.id };
}

async function getGeneratedCreativeData() {
  const { supabase, userId } = await getAuthenticatedSupabase();

  const [productsResult, creativesResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, product_name, brand_name")
      .eq("owner_id", userId)
      .order("product_name", { ascending: true }),
    supabase
      .from("generated_creatives")
      .select(
        "id, owner_id, product_id, product_name, competitor_name, generation_date, prompt, title, format, status, hook, cta, asset_url, is_favorite, export_count, last_exported_at, created_at, updated_at"
      )
      .eq("owner_id", userId)
      .order("generation_date", { ascending: false })
  ]);

  return {
    products: (productsResult.data ?? []) as ProductOption[],
    productsError: productsResult.error,
    creatives: (creativesResult.data ?? []) as GeneratedCreative[],
    creativesError: creativesResult.error
  };
}

export default async function GeneratedCreativesPage({
  searchParams
}: {
  searchParams?: GeneratedSearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const message = firstParam(params.message);
  const actionError = firstParam(params.error);
  const { products, productsError, creatives, creativesError } = await getGeneratedCreativeData();
  const favoriteCount = creatives.filter((creative) => creative.is_favorite).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generated Creatives"
        description="Review saved output across products. New creative starts inside a product workspace."
        action={
          <Button asChild>
            <Link href="/dashboard/product-pages">
              <WandSparkles className="mr-2 size-4" />
              Choose product
            </Link>
          </Button>
        }
      />

      {(message || actionError || productsError || creativesError) && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            actionError || productsError || creativesError
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-primary/25 bg-primary/10 text-primary"
          )}
        >
          {actionError ?? creativesError?.message ?? productsError?.message ?? message}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Saved creatives" value={String(creatives.length)} detail="Stored in Supabase" />
        <MetricCard label="Favorites" value={String(favoriteCount)} detail="Pinned for reuse" />
        <MetricCard
          label="Exports"
          value={String(creatives.reduce((sum, creative) => sum + (creative.export_count ?? 0), 0))}
          detail="JSON-ready records"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Plus className="size-5 text-primary" />
              Save generated creative
            </CardTitle>
            <CardDescription>
              Attach output to a product, competitor, generation date, and prompt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveGeneratedCreative} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="productName">Product</Label>
                {products.length > 0 ? (
                  <select
                    id="productName"
                    name="productRef"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={JSON.stringify({ id: product.id, name: product.product_name })}
                      >
                        {product.product_name} · {product.brand_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input id="productName" name="productName" placeholder="AI video editor" required />
                )}
                <input type="hidden" name="productId" value="" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="competitorName">Competitor</Label>
                <select
                  id="competitorName"
                  name="competitorName"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  {competitors.map((competitor) => (
                    <option key={competitor} value={competitor}>
                      {competitor}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="generationDate">Generation Date</Label>
                  <Input
                    id="generationDate"
                    name="generationDate"
                    type="datetime-local"
                    defaultValue={defaultGenerationDate()}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="format">Format</Label>
                  <select
                    id="format"
                    name="format"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {["Short video", "Static image", "Carousel", "Video script", "Ad copy"].map((format) => (
                      <option key={format} value={format}>
                        {format}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title">Creative Name</Label>
                <Input id="title" name="title" placeholder="Founder-led proof cut" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  name="prompt"
                  placeholder="Generate a 15-second ad using the original analysis..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="hook">Hook</Label>
                  <Input id="hook" name="hook" placeholder="Your team does not need more ideas..." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cta">CTA</Label>
                  <Input id="cta" name="cta" placeholder="Book a demo" />
                </div>
              </div>

              <input type="hidden" name="status" value="Ready" />
              <input type="hidden" name="assetUrl" value="/creative-ai-preview.png" />

              <Button type="submit">
                <Sparkles className="mr-2 size-4" />
                Save creative
              </Button>
            </form>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-normal">Creative library</h2>
              <p className="text-sm text-muted-foreground">
                {creatives.length} {creatives.length === 1 ? "creative" : "creatives"} saved
              </p>
            </div>
            <Badge variant="outline">{creativesError ? "Schema needed" : "Supabase"}</Badge>
          </div>

          {creatives.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-muted">
                  <ImageIcon className="size-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No generated creatives saved yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Save a generated creative here or from a product workspace to start building
                  your library.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {creatives.map((creative) => (
                <GeneratedCreativeCard key={creative.id} creative={creative} />
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

function GeneratedCreativeCard({ creative }: { creative: GeneratedCreative }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] bg-muted">
        <Image
          src={creative.asset_url || "/creative-ai-preview.png"}
          alt=""
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge variant={creative.status === "Ready" ? "default" : "outline"}>{creative.status}</Badge>
          {creative.is_favorite && <Badge variant="secondary">Favorite</Badge>}
        </div>
      </div>

      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold">{creative.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {creative.product_name} · {creative.competitor_name}
            </p>
          </div>
          <Badge variant="outline">{creative.format}</Badge>
        </div>

        <div className="grid gap-2 text-sm">
          <CardFact icon={CalendarDays} label="Generated" value={formatDate(creative.generation_date)} />
          <CardFact icon={MousePointerClick} label="CTA" value={creative.cta || "Not set"} />
        </div>

        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-medium text-muted-foreground">Prompt</p>
          <p className="mt-2 line-clamp-3 text-sm leading-6">{creative.prompt}</p>
        </div>

        {creative.hook && (
          <div className="rounded-lg border bg-background p-3">
            <p className="text-xs font-medium text-muted-foreground">Hook</p>
            <p className="mt-2 text-sm leading-6">{creative.hook}</p>
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <form action={toggleGeneratedCreativeFavorite}>
            <input type="hidden" name="id" value={creative.id} />
            <input type="hidden" name="nextValue" value={String(!creative.is_favorite)} />
            <Button type="submit" variant="outline" size="sm" className="w-full">
              <Heart className={cn("mr-2 size-4", creative.is_favorite && "fill-current")} />
              {creative.is_favorite ? "Unfavorite" : "Favorite"}
            </Button>
          </form>

          <form action={duplicateGeneratedCreative}>
            <input type="hidden" name="id" value={creative.id} />
            <Button type="submit" variant="outline" size="sm" className="w-full">
              <Copy className="mr-2 size-4" />
              Duplicate
            </Button>
          </form>

          <Button asChild variant="outline" size="sm" className="w-full">
            <a href={exportHref(creative)} download={`${creative.title.replaceAll(" ", "-").toLowerCase()}.json`}>
              <Download className="mr-2 size-4" />
              Export
            </a>
          </Button>

          <form action={deleteGeneratedCreative}>
            <input type="hidden" name="id" value={creative.id} />
            <Button type="submit" variant="destructive" size="sm" className="w-full">
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
          </form>
        </div>

        <details className="group rounded-lg border bg-background">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-medium">
            <span className="flex items-center gap-2">
              <Pencil className="size-4 text-primary" />
              Rename
            </span>
            <span className="text-muted-foreground transition group-open:rotate-45">+</span>
          </summary>
          <form action={renameGeneratedCreative} className="grid gap-3 border-t p-3">
            <input type="hidden" name="id" value={creative.id} />
            <Input name="title" defaultValue={creative.title} required />
            <Button type="submit" size="sm">
              Rename creative
            </Button>
          </form>
        </details>
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <ImageIcon className="size-4 text-primary" />
        </div>
        <p className="mt-4 text-3xl font-semibold tracking-normal">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function CardFact({
  icon: Icon,
  label,
  value
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        {label}
      </span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
}
