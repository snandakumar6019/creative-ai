"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const PRODUCT_PAGE_PATH = "/dashboard/product-pages";

const productFormSchema = z.object({
  productName: z.string().trim().min(1, "Product name is required.").max(120),
  brandName: z.string().trim().min(1, "Brand name is required.").max(120),
  productDescription: z.string().trim().max(2500).default(""),
  targetAudience: z.string().trim().max(1200).default(""),
  brandColors: z.string().trim().max(500).default(""),
  brandVoice: z.string().trim().max(1200).default(""),
  website: z.string().trim().max(240).default(""),
  existingAssets: z.string().trim().max(2500).default(""),
  notes: z.string().trim().max(2500).default("")
});

type ProductFormValues = z.infer<typeof productFormSchema>;

function productPagesUrl(params: { error?: string; message?: string }) {
  const searchParams = new URLSearchParams();

  if (params.error) {
    searchParams.set("error", params.error);
  }

  if (params.message) {
    searchParams.set("message", params.message);
  }

  const query = searchParams.toString();
  return query ? `${PRODUCT_PAGE_PATH}?${query}` : PRODUCT_PAGE_PATH;
}

function readFormValue(formData: FormData, key: keyof ProductFormValues) {
  return String(formData.get(key) ?? "");
}

function parseBrandColors(value: string) {
  return value
    .split(/[,;\n]+/)
    .map((color) => color.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function normalizeWebsite(value: string) {
  if (!value) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    return new URL(withProtocol).toString();
  } catch {
    return null;
  }
}

function readProductForm(formData: FormData) {
  const parsed = productFormSchema.safeParse({
    productName: readFormValue(formData, "productName"),
    brandName: readFormValue(formData, "brandName"),
    productDescription: readFormValue(formData, "productDescription"),
    targetAudience: readFormValue(formData, "targetAudience"),
    brandColors: readFormValue(formData, "brandColors"),
    brandVoice: readFormValue(formData, "brandVoice"),
    website: readFormValue(formData, "website"),
    existingAssets: readFormValue(formData, "existingAssets"),
    notes: readFormValue(formData, "notes")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the product details and try again."
    };
  }

  const website = normalizeWebsite(parsed.data.website);

  if (parsed.data.website && !website) {
    return { error: "Website must be a valid URL." };
  }

  return {
    values: {
      product_name: parsed.data.productName,
      brand_name: parsed.data.brandName,
      product_description: parsed.data.productDescription,
      target_audience: parsed.data.targetAudience,
      brand_colors: parseBrandColors(parsed.data.brandColors),
      brand_voice: parsed.data.brandVoice,
      website,
      existing_assets: parsed.data.existingAssets,
      notes: parsed.data.notes
    }
  };
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

export async function createProduct(formData: FormData) {
  const result = readProductForm(formData);

  if ("error" in result) {
    redirect(productPagesUrl({ error: result.error }));
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const { error } = await supabase.from("products").insert({
    ...result.values,
    owner_id: userId
  });

  if (error) {
    redirect(productPagesUrl({ error: error.message }));
  }

  revalidatePath(PRODUCT_PAGE_PATH);
  redirect(productPagesUrl({ message: "Product created." }));
}

export async function updateProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect(productPagesUrl({ error: "Missing product id." }));
  }

  const result = readProductForm(formData);

  if ("error" in result) {
    redirect(productPagesUrl({ error: result.error }));
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const { error } = await supabase
    .from("products")
    .update(result.values)
    .eq("id", id)
    .eq("owner_id", userId);

  if (error) {
    redirect(productPagesUrl({ error: error.message }));
  }

  revalidatePath(PRODUCT_PAGE_PATH);
  redirect(productPagesUrl({ message: "Product updated." }));
}

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect(productPagesUrl({ error: "Missing product id." }));
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("owner_id", userId);

  if (error) {
    redirect(productPagesUrl({ error: error.message }));
  }

  revalidatePath(PRODUCT_PAGE_PATH);
  redirect(productPagesUrl({ message: "Product deleted." }));
}
