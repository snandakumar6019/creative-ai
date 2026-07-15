"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const competitorSchema = z.object({
  productId: z.string().uuid("Invalid product id."),
  name: z.string().trim().min(1, "Competitor name is required.").max(160),
  facebookAdLibraryUrl: z.string().trim().min(1, "Facebook Ad Library URL is required.").max(1000),
  notes: z.string().trim().max(2000).default("")
});

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function workspaceUrl(
  productId: string,
  params: { error?: string; message?: string }
) {
  const searchParams = new URLSearchParams({ tab: "competitors" });

  if (params.error) {
    searchParams.set("error", params.error);
  }

  if (params.message) {
    searchParams.set("message", params.message);
  }

  return `/dashboard/product-pages/${productId}?${searchParams.toString()}`;
}

function normalizeFacebookAdLibraryUrl(value: string) {
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(candidate);
    const hostname = url.hostname.toLowerCase();
    const isFacebookHost = hostname === "facebook.com" || hostname.endsWith(".facebook.com");
    const isAdLibraryPath = url.pathname.toLowerCase().startsWith("/ads/library");

    if (!isFacebookHost || !isAdLibraryPath) {
      return null;
    }

    url.protocol = "https:";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function pageIdFromUrl(value: string) {
  const url = new URL(value);
  return (
    url.searchParams.get("view_all_page_id") ??
    url.searchParams.get("page_id") ??
    url.searchParams.get("id")
  );
}

function friendlyDatabaseError(message: string) {
  if (message.includes("product_competitors")) {
    return "Competitor storage is not set up yet. Run supabase/product-workspaces.sql in Supabase, then try again.";
  }

  return message;
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

export async function addProductCompetitor(formData: FormData) {
  const parsed = competitorSchema.safeParse({
    productId: readString(formData, "productId"),
    name: readString(formData, "name"),
    facebookAdLibraryUrl: readString(formData, "facebookAdLibraryUrl"),
    notes: readString(formData, "notes")
  });

  const fallbackProductId = readString(formData, "productId");

  if (!parsed.success) {
    redirect(
      workspaceUrl(fallbackProductId, {
        error: parsed.error.issues[0]?.message ?? "Check the competitor details."
      })
    );
  }

  const normalizedUrl = normalizeFacebookAdLibraryUrl(parsed.data.facebookAdLibraryUrl);

  if (!normalizedUrl) {
    redirect(
      workspaceUrl(parsed.data.productId, {
        error: "Paste a valid facebook.com/ads/library URL."
      })
    );
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", parsed.data.productId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (!product) {
    redirect(workspaceUrl(parsed.data.productId, { error: "Product not found." }));
  }

  const { error } = await supabase.from("product_competitors").insert({
    owner_id: userId,
    product_id: parsed.data.productId,
    name: parsed.data.name,
    facebook_ad_library_url: normalizedUrl,
    facebook_page_id: pageIdFromUrl(normalizedUrl),
    notes: parsed.data.notes
  });

  if (error) {
    const message =
      error.code === "23505"
        ? "That Facebook Ad Library page is already attached to this product."
        : friendlyDatabaseError(error.message);
    redirect(workspaceUrl(parsed.data.productId, { error: message }));
  }

  revalidatePath(`/dashboard/product-pages/${parsed.data.productId}`);
  redirect(workspaceUrl(parsed.data.productId, { message: "Competitor page attached." }));
}

export async function deleteProductCompetitor(formData: FormData) {
  const productId = readString(formData, "productId");
  const competitorId = readString(formData, "competitorId");

  if (!z.string().uuid().safeParse(productId).success || !z.string().uuid().safeParse(competitorId).success) {
    redirect(workspaceUrl(productId, { error: "Invalid competitor reference." }));
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const { error } = await supabase
    .from("product_competitors")
    .delete()
    .eq("id", competitorId)
    .eq("product_id", productId)
    .eq("owner_id", userId);

  if (error) {
    redirect(workspaceUrl(productId, { error: friendlyDatabaseError(error.message) }));
  }

  revalidatePath(`/dashboard/product-pages/${productId}`);
  redirect(workspaceUrl(productId, { message: "Competitor page removed." }));
}
