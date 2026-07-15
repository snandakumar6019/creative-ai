import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Boxes, ImageIcon, Plus, Sparkles, WandSparkles } from "lucide-react";

import { DashboardMetric } from "@/components/dashboard/dashboard-metric";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProductSummary = {
  id: string;
  product_name: string;
  brand_name: string;
  product_description: string;
  target_audience: string;
  brand_colors: string[];
  brand_voice: string;
  website: string | null;
  existing_assets: string;
  notes: string;
  updated_at: string;
};

type CreativeSummary = {
  product_id: string | null;
  status: string;
  generation_date: string;
};

function completeness(product: ProductSummary) {
  const values = [
    product.product_description,
    product.target_audience,
    product.brand_colors.length ? "colors" : "",
    product.brand_voice,
    product.website,
    product.existing_assets,
    product.notes
  ];

  return Math.round((values.filter(Boolean).length / values.length) * 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

async function getDashboardData() {
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

  const [productsResult, creativesResult] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, product_name, brand_name, product_description, target_audience, brand_colors, brand_voice, website, existing_assets, notes, updated_at"
      )
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("generated_creatives")
      .select("product_id, status, generation_date")
      .eq("owner_id", user.id)
      .order("generation_date", { ascending: false })
  ]);

  return {
    products: (productsResult.data ?? []) as ProductSummary[],
    creatives: (creativesResult.data ?? []) as CreativeSummary[],
    error: productsResult.error?.message ?? creativesResult.error?.message
  };
}

export default async function DashboardPage() {
  const { products, creatives, error } = await getDashboardData();
  const readyProducts = products.filter((product) => completeness(product) >= 70).length;
  const readyCreatives = creatives.filter((creative) => creative.status === "Ready").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Choose a product to continue with its competitors, generator, assets, and creative history."
        action={
          <Button asChild>
            <Link href="/dashboard/product-pages#new-product">
              <Plus className="mr-2 size-4" />
              New product
            </Link>
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <DashboardMetric label="Product workspaces" value={String(products.length)} trend="Persistent context" />
        <DashboardMetric label="Context-ready" value={String(readyProducts)} trend="70%+ complete" />
        <DashboardMetric label="Creatives ready" value={String(readyCreatives)} trend={`${creatives.length} saved total`} />
      </section>

      {products.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-muted">
              <Boxes className="size-6 text-primary" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Create your first product workspace</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              Add product and brand context once, then keep competitors, creative generation, assets, and history together.
            </p>
            <Button asChild className="mt-5">
              <Link href="/dashboard/product-pages#new-product">Create product</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-normal">Continue working</h2>
              <p className="text-sm text-muted-foreground">Open a product and pick up with its context already loaded.</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/product-pages">View all</Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.slice(0, 6).map((product) => {
              const productCreatives = creatives.filter((creative) => creative.product_id === product.id);
              const completion = completeness(product);

              return (
                <Card key={product.id} className="group transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                        <Boxes className="size-5 text-primary" />
                      </div>
                      <Badge variant={completion >= 70 ? "default" : "outline"}>{completion}% context</Badge>
                    </div>
                    <CardTitle className="text-lg">{product.product_name}</CardTitle>
                    <CardDescription>{product.brand_name} · Updated {formatDate(product.updated_at)}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {product.product_description || "Add a product description to improve generation context."}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-md border bg-muted/20 p-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <ImageIcon className="size-3.5" /> Creative history
                        </div>
                        <p className="mt-2 text-lg font-semibold">{productCreatives.length}</p>
                      </div>
                      <div className="rounded-md border bg-muted/20 p-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Sparkles className="size-3.5" /> Ready
                        </div>
                        <p className="mt-2 text-lg font-semibold">
                          {productCreatives.filter((creative) => creative.status === "Ready").length}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link href={`/dashboard/product-pages/${product.id}`}>
                          Open workspace
                          <ArrowUpRight className="ml-2 size-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="icon" aria-label={`Generate for ${product.product_name}`}>
                        <Link href={`/dashboard/product-pages/${product.id}?tab=generator`}>
                          <WandSparkles className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
