"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const GENERATED_PATH = "/dashboard/generated";

const saveCreativeSchema = z.object({
  productRef: z.string().trim().optional(),
  productId: z.string().uuid().optional().or(z.literal("")),
  productName: z.string().trim().max(160).default(""),
  competitorName: z.string().trim().min(1, "Competitor is required.").max(160),
  generationDate: z.string().trim().default(""),
  prompt: z.string().trim().min(1, "Prompt is required.").max(5000),
  title: z.string().trim().min(1, "Creative title is required.").max(160),
  format: z.string().trim().min(1).max(80),
  status: z.string().trim().min(1).max(80),
  hook: z.string().trim().max(1200).default(""),
  cta: z.string().trim().max(160).default(""),
  assetUrl: z.string().trim().max(500).default("/creative-ai-preview.png")
});

function generatedUrl(params: { error?: string; message?: string }) {
  const searchParams = new URLSearchParams();

  if (params.error) {
    searchParams.set("error", params.error);
  }

  if (params.message) {
    searchParams.set("message", params.message);
  }

  const query = searchParams.toString();
  return query ? `${GENERATED_PATH}?${query}` : GENERATED_PATH;
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function parseGenerationDate(value: string) {
  if (!value) {
    return new Date().toISOString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseProductRef(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as { id?: unknown; name?: unknown };

    if (typeof parsed.id === "string" && typeof parsed.name === "string") {
      return { id: parsed.id, name: parsed.name };
    }
  } catch {
    return null;
  }

  return null;
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

export async function saveGeneratedCreative(formData: FormData) {
  const parsed = saveCreativeSchema.safeParse({
    productRef: readString(formData, "productRef"),
    productId: readString(formData, "productId"),
    productName: readString(formData, "productName"),
    competitorName: readString(formData, "competitorName"),
    generationDate: readString(formData, "generationDate"),
    prompt: readString(formData, "prompt"),
    title: readString(formData, "title"),
    format: readString(formData, "format"),
    status: readString(formData, "status"),
    hook: readString(formData, "hook"),
    cta: readString(formData, "cta"),
    assetUrl: readString(formData, "assetUrl")
  });

  if (!parsed.success) {
    redirect(generatedUrl({ error: parsed.error.issues[0]?.message ?? "Check the creative details." }));
  }

  const generationDate = parseGenerationDate(parsed.data.generationDate);
  const productRef = parseProductRef(parsed.data.productRef);
  const productId = productRef?.id ?? parsed.data.productId;
  const productName = productRef?.name ?? parsed.data.productName;

  if (!generationDate) {
    redirect(generatedUrl({ error: "Generation date must be valid." }));
  }

  if (!productName) {
    redirect(generatedUrl({ error: "Product is required." }));
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const { error } = await supabase.from("generated_creatives").insert({
    owner_id: userId,
    product_id: productId || null,
    product_name: productName,
    competitor_name: parsed.data.competitorName,
    generation_date: generationDate,
    prompt: parsed.data.prompt,
    title: parsed.data.title,
    format: parsed.data.format,
    status: parsed.data.status,
    hook: parsed.data.hook,
    cta: parsed.data.cta,
    asset_url: parsed.data.assetUrl || "/creative-ai-preview.png"
  });

  if (error) {
    redirect(generatedUrl({ error: error.message }));
  }

  revalidatePath(GENERATED_PATH);
  redirect(generatedUrl({ message: "Generated creative saved." }));
}

export async function renameGeneratedCreative(formData: FormData) {
  const id = readString(formData, "id");
  const title = readString(formData, "title").trim();

  if (!id || !title) {
    redirect(generatedUrl({ error: "Creative id and title are required." }));
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const { error } = await supabase
    .from("generated_creatives")
    .update({ title })
    .eq("id", id)
    .eq("owner_id", userId);

  if (error) {
    redirect(generatedUrl({ error: error.message }));
  }

  revalidatePath(GENERATED_PATH);
  redirect(generatedUrl({ message: "Creative renamed." }));
}

export async function toggleGeneratedCreativeFavorite(formData: FormData) {
  const id = readString(formData, "id");
  const nextValue = readString(formData, "nextValue") === "true";

  if (!id) {
    redirect(generatedUrl({ error: "Missing creative id." }));
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const { error } = await supabase
    .from("generated_creatives")
    .update({ is_favorite: nextValue })
    .eq("id", id)
    .eq("owner_id", userId);

  if (error) {
    redirect(generatedUrl({ error: error.message }));
  }

  revalidatePath(GENERATED_PATH);
  redirect(generatedUrl({ message: nextValue ? "Creative favorited." : "Creative unfavorited." }));
}

export async function duplicateGeneratedCreative(formData: FormData) {
  const id = readString(formData, "id");

  if (!id) {
    redirect(generatedUrl({ error: "Missing creative id." }));
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const { data, error: loadError } = await supabase
    .from("generated_creatives")
    .select(
      "product_id, product_name, competitor_name, prompt, title, format, status, hook, cta, asset_url"
    )
    .eq("id", id)
    .eq("owner_id", userId)
    .single();

  if (loadError || !data) {
    redirect(generatedUrl({ error: loadError?.message ?? "Creative not found." }));
  }

  const { error } = await supabase.from("generated_creatives").insert({
    ...data,
    owner_id: userId,
    title: `Copy of ${data.title}`,
    generation_date: new Date().toISOString(),
    is_favorite: false
  });

  if (error) {
    redirect(generatedUrl({ error: error.message }));
  }

  revalidatePath(GENERATED_PATH);
  redirect(generatedUrl({ message: "Creative duplicated." }));
}

export async function deleteGeneratedCreative(formData: FormData) {
  const id = readString(formData, "id");

  if (!id) {
    redirect(generatedUrl({ error: "Missing creative id." }));
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const { error } = await supabase
    .from("generated_creatives")
    .delete()
    .eq("id", id)
    .eq("owner_id", userId);

  if (error) {
    redirect(generatedUrl({ error: error.message }));
  }

  revalidatePath(GENERATED_PATH);
  redirect(generatedUrl({ message: "Creative deleted." }));
}

export async function markGeneratedCreativeExported(formData: FormData) {
  const id = readString(formData, "id");
  const exportCount = Number(readString(formData, "exportCount"));

  if (!id) {
    redirect(generatedUrl({ error: "Missing creative id." }));
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const { error } = await supabase
    .from("generated_creatives")
    .update({
      export_count: Number.isFinite(exportCount) ? exportCount + 1 : 1,
      last_exported_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("owner_id", userId);

  if (error) {
    redirect(generatedUrl({ error: error.message }));
  }

  revalidatePath(GENERATED_PATH);
  redirect(generatedUrl({ message: "Creative export tracked." }));
}
