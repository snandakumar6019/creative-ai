import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Boxes,
  Brush,
  CalendarClock,
  FileImage,
  FileText,
  Globe2,
  ImageIcon,
  Megaphone,
  Palette,
  Sparkles,
  TrendingUp,
  Users
} from "lucide-react";

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

type ProductDetailParams = Promise<{ id: string }>;
type ProductDetailSearchParams = Promise<{ tab?: string | string[] }>;

const tabs = ["overview", "competitors", "creatives", "history", "assets"] as const;
type ProductTab = (typeof tabs)[number];

const tabLabels: Record<ProductTab, string> = {
  overview: "Overview",
  competitors: "Competitors",
  creatives: "Creatives",
  history: "History",
  assets: "Assets"
};

const mockCompetitors = [
  {
    name: "Northstar Labs",
    category: "Lifecycle",
    score: "92",
    signal: "Strong proof-led hero and fast social proof placement."
  },
  {
    name: "Orbit Studio",
    category: "Creative ops",
    score: "86",
    signal: "Positions speed and versioning as the core differentiation."
  },
  {
    name: "LaunchDesk",
    category: "Experimentation",
    score: "79",
    signal: "Uses pricing anchors and customer quotes above the fold."
  }
];

const mockCreatives = [
  { name: "Launch hero concept", format: "Image", status: "Ready", channel: "Landing page" },
  { name: "Founder-led short video", format: "Video", status: "Generating", channel: "Paid social" },
  { name: "Carousel objection set", format: "Image", status: "Draft", channel: "Retargeting" },
  { name: "Feature proof email", format: "Copy", status: "Ready", channel: "Lifecycle" }
];

const mockHistory = [
  { event: "Brand voice updated", detail: "Tone shifted toward direct and inventive.", time: "Today" },
  { event: "Competitor scan completed", detail: "3 market references attached.", time: "Yesterday" },
  { event: "Creative brief created", detail: "Launch hero and paid social angles queued.", time: "2 days ago" },
  { event: "Product created", detail: "Initial product context saved.", time: "Last week" }
];

const mockAssets = [
  { name: "Primary logo", type: "SVG", size: "84 KB", status: "Synced" },
  { name: "Product screenshots", type: "Folder", size: "18 files", status: "Ready" },
  { name: "Customer quotes", type: "DOC", size: "42 KB", status: "Needs review" },
  { name: "Campaign references", type: "Links", size: "9 URLs", status: "Ready" }
];

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

async function getProduct(id: string) {
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

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, owner_id, product_name, brand_name, product_description, target_audience, brand_colors, brand_voice, website, existing_assets, notes, created_at, updated_at"
    )
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (error || !data) {
    notFound();
  }

  return data as Product;
}

export default async function ProductDetailPage({
  params,
  searchParams
}: {
  params: ProductDetailParams;
  searchParams?: ProductDetailSearchParams;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activeTab = normalizeTab(firstParam(resolvedSearchParams.tab));

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.product_name}
        description={`${product.brand_name} product workspace for positioning, competitor signals, creative output, history, and assets.`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/product-pages">
                <ArrowLeft className="mr-2 size-4" />
                Products
              </Link>
            </Button>
            {product.website && (
              <Button asChild>
                <Link href={product.website} target="_blank" rel="noreferrer">
                  Website
                  <ArrowUpRight className="ml-2 size-4" />
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Creative readiness" value="84%" detail="+12% from last scan" icon={Sparkles} />
        <StatCard label="Competitor signals" value="31" detail="8 high-priority angles" icon={TrendingUp} />
        <StatCard label="Generated creatives" value="18" detail="6 ready for review" icon={ImageIcon} />
        <StatCard label="Asset coverage" value="92%" detail="4 sources connected" icon={Boxes} />
      </section>

      <nav className="flex gap-1 overflow-x-auto rounded-lg border bg-card p-1">
        {tabs.map((tab) => (
          <Link
            key={tab}
            href={`/dashboard/product-pages/${product.id}?tab=${tab}`}
            className={cn(
              "inline-flex h-9 shrink-0 items-center justify-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              activeTab === tab && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            )}
          >
            {tabLabels[tab]}
          </Link>
        ))}
      </nav>

      {activeTab === "overview" && <OverviewTab product={product} />}
      {activeTab === "competitors" && <CompetitorsTab />}
      {activeTab === "creatives" && <CreativesTab />}
      {activeTab === "history" && <HistoryTab product={product} />}
      {activeTab === "assets" && <AssetsTab product={product} />}
    </div>
  );
}

function OverviewTab({ product }: { product: Product }) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Product overview</CardTitle>
          <CardDescription>Core positioning context for this product.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <DetailBlock icon={FileText} label="Product Description" value={product.product_description} />
          <div className="grid gap-4 md:grid-cols-2">
            <DetailBlock icon={Users} label="Target Audience" value={product.target_audience} />
            <DetailBlock icon={Megaphone} label="Brand Voice" value={product.brand_voice} />
          </div>
          <DetailBlock icon={Brush} label="Notes" value={product.notes} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Brand system</CardTitle>
            <CardDescription>Visual and voice inputs for generation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Palette className="size-4 text-primary" />
                Brand Colors
              </div>
              {product.brand_colors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.brand_colors.map((color) => (
                    <span
                      key={color}
                      className="inline-flex h-8 items-center gap-2 rounded-md border bg-muted/35 px-2 text-xs font-medium"
                    >
                      <span
                        className="size-4 rounded border"
                        style={{ backgroundColor: isHexColor(color) ? color : undefined }}
                      />
                      {color}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No brand colors added yet.</p>
              )}
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Globe2 className="size-4 text-primary" />
                Website
              </div>
              {product.website ? (
                <Link
                  href={product.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  {product.website}
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">No website added yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generation mix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Paid social", "42%"],
              ["Landing page", "31%"],
              ["Email", "17%"],
              ["Organic", "10%"]
            ].map(([label, value]) => (
              <ProgressRow key={label} label={label} value={value} />
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function CompetitorsTab() {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {mockCompetitors.map((competitor) => (
        <Card key={competitor.name}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                <Globe2 className="size-5 text-primary" />
              </div>
              <Badge variant="outline">{competitor.category}</Badge>
            </div>
            <CardTitle className="text-lg">{competitor.name}</CardTitle>
            <CardDescription>Match score {competitor.score}%</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">{competitor.signal}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function CreativesTab() {
  return (
    <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
      <Card>
        <CardHeader>
          <CardTitle>Creative pipeline</CardTitle>
          <CardDescription>Mock generation status for this product.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProgressRow label="Ready" value="44%" />
          <ProgressRow label="Generating" value="22%" />
          <ProgressRow label="Draft" value="34%" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {mockCreatives.map((creative) => (
          <Card key={creative.name}>
            <CardContent className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                  <ImageIcon className="size-5 text-primary" />
                </div>
                <Badge variant={creative.status === "Ready" ? "default" : "outline"}>
                  {creative.status}
                </Badge>
              </div>
              <h3 className="font-semibold">{creative.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {creative.format} for {creative.channel}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function HistoryTab({ product }: { product: Product }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product history</CardTitle>
        <CardDescription>
          Created {formatDate(product.created_at)} and last updated {formatDate(product.updated_at)}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockHistory.map((item) => (
          <div key={item.event} className="flex gap-4 rounded-lg border bg-muted/25 p-4">
            <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-md bg-background">
              <CalendarClock className="size-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{item.event}</h3>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AssetsTab({ product }: { product: Product }) {
  return (
    <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Existing assets</CardTitle>
          <CardDescription>Saved asset context from the product record.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            {product.existing_assets || "No existing assets have been documented yet."}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {mockAssets.map((asset) => (
          <Card key={asset.name}>
            <CardContent className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                  <FileImage className="size-5 text-primary" />
                </div>
                <Badge variant={asset.status === "Ready" || asset.status === "Synced" ? "default" : "outline"}>
                  {asset.status}
                </Badge>
              </div>
              <h3 className="font-semibold">{asset.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {asset.type} · {asset.size}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
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
      <p className="text-sm leading-6 text-muted-foreground">
        {value || `No ${label.toLowerCase()} added yet.`}
      </p>
    </div>
  );
}

function ProgressRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: value }} />
      </div>
    </div>
  );
}
