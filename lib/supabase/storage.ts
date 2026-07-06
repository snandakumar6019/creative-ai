import type { SupabaseClient } from "@supabase/supabase-js";

export const STORAGE_BUCKETS = {
  creativeAssets: "creative-assets",
  competitorScreenshots: "competitor-screenshots",
  productMedia: "product-media"
} as const;

export async function getSignedAssetUrl(
  supabase: SupabaseClient,
  bucket: keyof typeof STORAGE_BUCKETS,
  path: string
) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .createSignedUrl(path, 60 * 10);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}
