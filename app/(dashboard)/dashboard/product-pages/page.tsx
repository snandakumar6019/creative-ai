import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  Boxes,
  Brush,
  ExternalLink,
  FileText,
  Layers3,
  Megaphone,
  Palette,
  Pencil,
  Plus,
  Save,
  StickyNote,
  Trash2,
  Users
} from "lucide-react";

import { createProduct, deleteProduct, updateProduct } from "./actions";
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

type ProductPageSearchParams = Promise<{
  error?: string | string[];
  message?: string | string[];
}>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function serializeBrandColors(colors: string[] | null | undefined) {
  return Array.isArray(colors) ? colors.join(", ") : "";
}

function isHexColor(value: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
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

async function getProducts() {
  const { supabase, userId } = await getAuthenticatedSupabase();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, owner_id, product_name, brand_name, product_description, target_audience, brand_colors, brand_voice, website, existing_assets, notes, created_at, updated_at"
    )
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  return {
    products: (data ?? []) as Product[],
    error
  };
}

export default async function ProductPagesPage({
  searchParams
}: {
  searchParams?: ProductPageSearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const message = firstParam(params.message);
  const actionError = firstParam(params.error);
  const { products, error: loadError } = await getProducts();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Pages"
        description="Manage product and brand context for creative generation."
        action={
          <Button asChild variant="outline">
            <Link href="#new-product">
              <Plus className="mr-2 size-4" />
              New product
            </Link>
          </Button>
        }
      />

      {(message || actionError || loadError) && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            actionError || loadError
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-primary/25 bg-primary/10 text-primary"
          )}
        >
          {actionError ?? loadError?.message ?? message}
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
        <Card id="new-product" className="h-fit scroll-mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Plus className="size-5 text-primary" />
              Create product
            </CardTitle>
            <CardDescription>
              Save the inputs your creative workflow needs before generating campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createProduct} className="grid gap-5">
              <ProductFormFields />
              <Button type="submit">
                <Save className="mr-2 size-4" />
                Save product
              </Button>
            </form>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-normal">Product library</h2>
              <p className="text-sm text-muted-foreground">
                {products.length} {products.length === 1 ? "product" : "products"} stored in
                Supabase
              </p>
            </div>
            <Badge variant="outline">{loadError ? "Schema needed" : "Live"}</Badge>
          </div>

          {products.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-muted">
                  <Boxes className="size-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No products yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Add your first product with brand voice, audience, colors, assets, and notes.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

function ProductFormFields({ product }: { product?: Product }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Product Name" htmlFor={fieldId(product, "productName")}>
          <Input
            id={fieldId(product, "productName")}
            name="productName"
            defaultValue={product?.product_name ?? ""}
            placeholder="AI video editor"
            required
          />
        </Field>
        <Field label="Brand Name" htmlFor={fieldId(product, "brandName")}>
          <Input
            id={fieldId(product, "brandName")}
            name="brandName"
            defaultValue={product?.brand_name ?? ""}
            placeholder="FrameForge"
            required
          />
        </Field>
      </div>

      <Field label="Product Description" htmlFor={fieldId(product, "productDescription")}>
        <Textarea
          id={fieldId(product, "productDescription")}
          name="productDescription"
          defaultValue={product?.product_description ?? ""}
          placeholder="What the product does, the problem it solves, and why it matters."
          rows={4}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Target Audience" htmlFor={fieldId(product, "targetAudience")}>
          <Textarea
            id={fieldId(product, "targetAudience")}
            name="targetAudience"
            defaultValue={product?.target_audience ?? ""}
            placeholder="Creative teams at performance marketing agencies."
            rows={4}
          />
        </Field>
        <Field label="Brand Voice" htmlFor={fieldId(product, "brandVoice")}>
          <Textarea
            id={fieldId(product, "brandVoice")}
            name="brandVoice"
            defaultValue={product?.brand_voice ?? ""}
            placeholder="Confident, inventive, direct, and clear."
            rows={4}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Brand Colors" htmlFor={fieldId(product, "brandColors")}>
          <Input
            id={fieldId(product, "brandColors")}
            name="brandColors"
            defaultValue={serializeBrandColors(product?.brand_colors)}
            placeholder="#0f766e, #f59e0b, coral"
          />
        </Field>
        <Field label="Website" htmlFor={fieldId(product, "website")}>
          <Input
            id={fieldId(product, "website")}
            name="website"
            defaultValue={product?.website ?? ""}
            placeholder="https://frameforge.ai"
            inputMode="url"
          />
        </Field>
      </div>

      <Field label="Existing Assets" htmlFor={fieldId(product, "existingAssets")}>
        <Textarea
          id={fieldId(product, "existingAssets")}
          name="existingAssets"
          defaultValue={product?.existing_assets ?? ""}
          placeholder="Asset URLs, folders, prior campaign references, product shots, logos."
          rows={3}
        />
      </Field>

      <Field label="Notes" htmlFor={fieldId(product, "notes")}>
        <Textarea
          id={fieldId(product, "notes")}
          name="notes"
          defaultValue={product?.notes ?? ""}
          placeholder="Constraints, launch details, claims to avoid, positioning ideas."
          rows={3}
        />
      </Field>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-4 border-b bg-muted/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl">{product.product_name}</CardTitle>
              <Badge variant="secondary">{product.brand_name}</Badge>
            </div>
            <CardDescription className="mt-2">
              Updated {formatDate(product.updated_at)}
            </CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/product-pages/${product.id}`}>
                <Layers3 className="mr-2 size-4" />
                Details
              </Link>
            </Button>
            {product.website && (
              <Button asChild variant="outline" size="sm">
                <Link href={product.website} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 size-4" />
                  Website
                </Link>
              </Button>
            )}
            <form action={deleteProduct}>
              <input type="hidden" name="id" value={product.id} />
              <Button type="submit" variant="destructive" size="sm">
                <Trash2 className="mr-2 size-4" />
                Delete
              </Button>
            </form>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <p className="text-sm leading-6 text-muted-foreground">
          {product.product_description || "No product description added yet."}
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          <ProductDetail icon={Users} label="Target Audience" value={product.target_audience} />
          <ProductDetail icon={Megaphone} label="Brand Voice" value={product.brand_voice} />
          <ProductDetail icon={FileText} label="Existing Assets" value={product.existing_assets} />
          <ProductDetail icon={StickyNote} label="Notes" value={product.notes} />
        </div>

        <div className="rounded-lg border bg-background p-4">
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

        <details className="group rounded-lg border bg-background">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium">
            <span className="flex items-center gap-2">
              <Pencil className="size-4 text-primary" />
              Edit product
            </span>
            <Brush className="size-4 text-muted-foreground transition group-open:rotate-45" />
          </summary>
          <form action={updateProduct} className="grid gap-5 border-t p-4">
            <input type="hidden" name="id" value={product.id} />
            <ProductFormFields product={product} />
            <Button type="submit">
              <Save className="mr-2 size-4" />
              Save changes
            </Button>
          </form>
        </details>
      </CardContent>
    </Card>
  );
}

function ProductDetail({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
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

function Field({
  label,
  htmlFor,
  children
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function fieldId(product: Product | undefined, name: string) {
  return product ? `${product.id}-${name}` : `new-${name}`;
}
