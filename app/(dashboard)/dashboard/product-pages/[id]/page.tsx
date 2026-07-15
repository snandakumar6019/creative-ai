import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Boxes,
  CalendarClock,
  FileImage,
  FileText,
  Globe2,
  ImageIcon,
  Library,
  Megaphone,
  Palette,
  Plus,
  Sparkles,
  Trash2,
  Users,
  WandSparkles
} from "lucide-react";

import { addProductCompetitor, deleteProductCompetitor } from "./actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProductCreativeGenerator } from "@/components/dashboard/product-creative-generator";
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

type Product = {
  id: string;
  owner_id: string;
  product_name: string;
  brand_name: string;
  product_description: string;
  target_audience: string;
  brand_colors: string[];
  brand_voice: string;
  website: string | null;
  existing_assets: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

type ProductCompetitor = {
  id: string;
  product_id: string;
  name: string;
  facebook_ad_library_url: string;
  facebook_page_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

type ProductCreative = {
  id: string;
  title: string;
  competitor_name: string;
  generation_date: string;
  format: string;
  status: string;
  hook: string;
  cta: string;
  is_favorite: boolean;
};

type ProductDetailParams = Promise<{ id: string }>;
type ProductDetailSearchParams = Promise<{
  tab?: string | string[];
  competitor?: string | string[];
  error?: string | string[];
  message?: string | string[];
}>;

const tabs = ["overview", "generator", "competitors", "assets", "history"] as const;
type ProductTab = (typeof tabs)[number];

const tabLabels: Record<ProductTab, string> = {
  overview: "Overview",
  generator: "Generator",
  competitors: "Competitors",
  assets: "Assets & brand",
  history: "Creative history"
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeTab(value: string | undefined): ProductTab {
  return tabs.includes(value as ProductTab) ? (value as ProductTab) : "overview";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function isHexColor(value: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

function contextCompleteness(product: Product) {
  const values = [
    product.product_description,
    product.target_audience,
    product.brand_voice,
    product.brand_colors.length ? "colors" : "",
    product.website,
    product.existing_assets,
    product.notes
  ];

  return Math.round((values.filter(Boolean).length / values.length) * 100);
}

function assetSourceCount(value: string) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean).length;
}

async function getProductWorkspace(id: string) {
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

  const { data: product, error: productError } = await supabase
    .from("products")
    .select(
      "id, owner_id, product_name, brand_name, product_description, target_audience, brand_colors, brand_voice, website, existing_assets, notes, created_at, updated_at"
    )
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (productError || !product) {
    notFound();
  }

  const [competitorsResult, creativesResult] = await Promise.all([
    supabase
      .from("product_competitors")
      .select(
        "id, product_id, name, facebook_ad_library_url, facebook_page_id, notes, created_at, updated_at"
      )
      .eq("product_id", id)
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("generated_creatives")
      .select(
        "id, title, competitor_name, generation_date, format, status, hook, cta, is_favorite"
      )
      .eq("product_id", id)
      .eq("owner_id", user.id)
      .order("generation_date", { ascending: false })
  ]);

  return {
    product: product as Product,
    competitors: (competitorsResult.data ?? []) as ProductCompetitor[],
    competitorsError: competitorsResult.error?.message,
    creatives: (creativesResult.data ?? []) as ProductCreative[],
    creativesError: creativesResult.error?.message
  };
}

export default async function ProductDetailPage({
  params,
  searchParams
}: {
  params: ProductDetailParams;
  searchParams?: ProductDetailSearchParams;
}) {
  const { id } = await params;
  const { product, competitors, competitorsError, creatives, creativesError } =
    await getProductWorkspace(id);
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activeTab = normalizeTab(firstParam(resolvedSearchParams.tab));
  const actionError = firstParam(resolvedSearchParams.error);
  const message = firstParam(resolvedSearchParams.message);
  const initialCompetitorId = firstParam(resolvedSearchParams.competitor);

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.product_name}
        description={`${product.brand_name} · one workspace for product context, competitors, generation, assets, and history.`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/product-pages">
                <ArrowLeft className="mr-2 size-4" />
                Products
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/product-pages/${product.id}?tab=generator`}>
                <WandSparkles className="mr-2 size-4" />
                Generate
              </Link>
            </Button>
          </div>
        }
      />

      {(message || actionError) && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            actionError
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-primary/25 bg-primary/10 text-primary"
          )}
        >
          {actionError ?? message}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Context complete"
          value={`${contextCompleteness(product)}%`}
          detail="Product and brand inputs"
          icon={Sparkles}
        />
        <StatCard
          label="Competitor pages"
          value={String(competitors.length)}
          detail={competitorsError ? "Setup required" : "Attached to this product"}
          icon={Library}
        />
        <StatCard
          label="Creative history"
          value={String(creatives.length)}
          detail="Saved product variations"
          icon={ImageIcon}
        />
        <StatCard
          label="Asset references"
          value={String(assetSourceCount(product.existing_assets))}
          detail="Available during generation"
          icon={Boxes}
        />
      </section>

      <nav className="flex gap-1 overflow-x-auto rounded-lg border bg-card p-1" aria-label="Product workspace">
        {tabs.map((tab) => (
          <Link
            key={tab}
            href={`/dashboard/product-pages/${product.id}?tab=${tab}`}
            className={cn(
              "inline-flex h-9 shrink-0 items-center justify-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              activeTab === tab &&
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            )}
          >
            {tabLabels[tab]}
          </Link>
        ))}
      </nav>

      {activeTab === "overview" && (
        <OverviewTab product={product} competitors={competitors} creatives={creatives} />
      )}
      {activeTab === "generator" && (
        <ProductCreativeGenerator
          product={product}
          competitors={competitors}
          initialCompetitorId={initialCompetitorId}
        />
      )}
      {activeTab === "competitors" && (
        <CompetitorsTab
          product={product}
          competitors={competitors}
          databaseError={competitorsError}
        />
      )}
      {activeTab === "assets" && <AssetsTab product={product} />}
      {activeTab === "history" && (
        <HistoryTab product={product} creatives={creatives} databaseError={creativesError} />
      )}
    </div>
  );
}

function OverviewTab({
  product,
  competitors,
  creatives
}: {
  product: Product;
  competitors: ProductCompetitor[];
  creatives: ProductCreative[];
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardTitle>Product context</CardTitle>
          <CardDescription>The shared source of truth used by every creative task.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailBlock icon={FileText} label="Product description" value={product.product_description} />
          <div className="grid gap-4 md:grid-cols-2">
            <DetailBlock icon={Users} label="Target audience" value={product.target_audience} />
            <DetailBlock icon={Megaphone} label="Brand voice" value={product.brand_voice} />
          </div>
          <DetailBlock icon={FileImage} label="Existing assets" value={product.existing_assets} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Continue working</CardTitle>
            <CardDescription>Move within this product without setting context again.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <WorkspaceLink
              href={`/dashboard/product-pages/${product.id}?tab=generator`}
              icon={WandSparkles}
              title="Generate creative"
              detail="Use product and competitor context"
            />
            <WorkspaceLink
              href={`/dashboard/product-pages/${product.id}?tab=competitors`}
              icon={Library}
              title="Manage competitors"
              detail={`${competitors.length} page${competitors.length === 1 ? "" : "s"} attached`}
            />
            <WorkspaceLink
              href={`/dashboard/product-pages/${product.id}?tab=history`}
              icon={CalendarClock}
              title="Review history"
              detail={`${creatives.length} saved creative${creatives.length === 1 ? "" : "s"}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Brand colors</CardTitle>
          </CardHeader>
          <CardContent>
            {product.brand_colors.length ? (
              <div className="flex flex-wrap gap-2">
                {product.brand_colors.map((color) => (
                  <span key={color} className="inline-flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs font-medium">
                    <span
                      className="size-4 rounded border"
                      style={{ backgroundColor: isHexColor(color) ? color : undefined }}
                    />
                    {color}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No brand colors saved yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function CompetitorsTab({
  product,
  competitors,
  databaseError
}: {
  product: Product;
  competitors: ProductCompetitor[];
  databaseError?: string;
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="size-5 text-primary" />
            Attach competitor page
          </CardTitle>
          <CardDescription>
            Paste a Facebook Ad Library page once. It remains linked only to {product.product_name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {databaseError ? (
            <DatabaseSetupNotice message={databaseError} />
          ) : (
            <form action={addProductCompetitor} className="grid gap-4">
              <input type="hidden" name="productId" value={product.id} />
              <div className="grid gap-2">
                <Label htmlFor="competitor-name">Competitor name</Label>
                <Input id="competitor-name" name="name" placeholder="Canva" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="facebook-page-url">Facebook Ad Library page URL</Label>
                <Input
                  id="facebook-page-url"
                  name="facebookAdLibraryUrl"
                  placeholder="https://www.facebook.com/ads/library/?..."
                  inputMode="url"
                  required
                />
                <p className="text-xs leading-5 text-muted-foreground">
                  Open the competitor in Meta Ad Library, choose “See all ads,” then copy the full URL.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="competitor-notes">Creative observations</Label>
                <Textarea
                  id="competitor-notes"
                  name="notes"
                  placeholder="Repeated hooks, offers, visual patterns, proof, CTAs..."
                  rows={5}
                />
              </div>
              <Button type="submit">
                <Library className="mr-2 size-4" />
                Attach to product
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-normal">Attached pages</h2>
          <p className="text-sm text-muted-foreground">
            Browse or reuse these sources without searching again.
          </p>
        </div>

        {!databaseError && competitors.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-muted">
                <Library className="size-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">No competitor pages attached</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Add the first Meta Ad Library page for this product. No API token is needed to store or open it.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {competitors.map((competitor) => (
            <Card key={competitor.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                    <Globe2 className="size-5 text-primary" />
                  </div>
                  <Badge variant="outline">Meta ads</Badge>
                </div>
                <CardTitle className="text-lg">{competitor.name}</CardTitle>
                <CardDescription>
                  {competitor.facebook_page_id
                    ? `Page ID ${competitor.facebook_page_id}`
                    : `Attached ${formatDate(competitor.created_at)}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  {competitor.notes || "No observations saved yet."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={competitor.facebook_ad_library_url} target="_blank" rel="noreferrer">
                      Browse ads
                      <ArrowUpRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/product-pages/${product.id}?tab=generator&competitor=${competitor.id}`}>
                      Use in generator
                    </Link>
                  </Button>
                  <form action={deleteProductCompetitor}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="competitorId" value={competitor.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      <Trash2 className="mr-2 size-4" />
                      Remove
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function AssetsTab({ product }: { product: Product }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Brand guidelines</CardTitle>
          <CardDescription>Voice and visual rules automatically supplied to generation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailBlock icon={Megaphone} label="Brand voice" value={product.brand_voice} />
          <DetailBlock icon={Palette} label="Brand colors" value={product.brand_colors.join(", ")} />
          <DetailBlock icon={Users} label="Target audience" value={product.target_audience} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product assets</CardTitle>
          <CardDescription>Links, folders, screenshots, logos, and prior campaign references.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/25 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <FileImage className="size-4 text-primary" />
              Existing assets
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {product.existing_assets || "No asset references saved yet."}
            </p>
          </div>
          <div className="rounded-lg border bg-muted/25 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <FileText className="size-4 text-primary" />
              Constraints and notes
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {product.notes || "No product constraints saved yet."}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/product-pages">Edit product context</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

function HistoryTab({
  product,
  creatives,
  databaseError
}: {
  product: Product;
  creatives: ProductCreative[];
  databaseError?: string;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-normal">Creative history</h2>
          <p className="text-sm text-muted-foreground">
            Every saved variation stays attached to {product.product_name}.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/generated">View all products</Link>
        </Button>
      </div>

      {databaseError && <DatabaseSetupNotice message={databaseError} />}

      {!databaseError && creatives.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-muted">
              <WandSparkles className="size-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">No saved creatives yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Generate a direction and save it here to build the product’s creative memory.
            </p>
            <Button asChild className="mt-4">
              <Link href={`/dashboard/product-pages/${product.id}?tab=generator`}>Open generator</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {creatives.map((creative) => (
            <Card key={creative.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                    <ImageIcon className="size-5 text-primary" />
                  </div>
                  <Badge variant={creative.status === "Ready" ? "default" : "outline"}>
                    {creative.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{creative.title}</CardTitle>
                <CardDescription>{creative.format} · {formatDate(creative.generation_date)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-medium">{creative.hook || "No hook saved."}</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{creative.competitor_name}</Badge>
                  {creative.cta && <Badge variant="outline">CTA: {creative.cta}</Badge>}
                  {creative.is_favorite && <Badge>Favorite</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="flex gap-4 p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
            <CalendarClock className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Product context updated</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Created {formatDate(product.created_at)} · Last updated {formatDate(product.updated_at)}
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function DatabaseSetupNotice({ message }: { message: string }) {
  const missingTable = message.includes("product_competitors") || message.includes("schema cache");

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
      <p className="font-medium">{missingTable ? "One database setup step remains" : "Database request failed"}</p>
      <p className="mt-2 leading-6">
        {missingTable
          ? "Run supabase/product-workspaces.sql in the Supabase SQL Editor, then reload this workspace."
          : message}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Sparkles;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <Icon className="size-4 text-primary" />
        </div>
        <p className="mt-4 text-3xl font-semibold tracking-normal">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function DetailBlock({
  icon: Icon,
  label,
  value
}: {
  icon: typeof FileText;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/25 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 text-primary" />
        {label}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
        {value || `No ${label.toLowerCase()} saved yet.`}
      </p>
    </div>
  );
}

function WorkspaceLink({
  href,
  icon: Icon,
  title,
  detail
}: {
  href: string;
  icon: typeof Sparkles;
  title: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-primary/35 hover:bg-muted/30"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-4 text-primary" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{detail}</span>
      </span>
      <ArrowUpRight className="size-4 text-muted-foreground" />
    </Link>
  );
}
