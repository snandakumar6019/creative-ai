export type FacebookAdLibrarySearchMode = "brand" | "app";
export type FacebookAdLibraryActiveStatus = "ACTIVE" | "ALL" | "INACTIVE";
export type FacebookAdLibraryMediaType = "ALL" | "IMAGE" | "VIDEO";

export type FacebookAdLibrarySearchInput = {
  query: string;
  searchMode: FacebookAdLibrarySearchMode;
  country: string;
  activeStatus: FacebookAdLibraryActiveStatus;
  mediaType: FacebookAdLibraryMediaType;
  limit?: number;
};

export type FacebookAdLibraryCreative = {
  id: string;
  brandName: string;
  pageId: string;
  adType: string;
  mediaType: "Image" | "Video" | "Mixed";
  country: string;
  activeStatus: "Active" | "Inactive" | "Unknown";
  date: string;
  cta: string;
  headline: string;
  description: string;
  thumbnailUrl: string | null;
  creativeUrl: string | null;
  snapshotUrl: string | null;
  platforms: string[];
};

type MetaAdsArchiveResponse = {
  data?: MetaAdsArchiveAd[];
  error?: {
    message?: string;
  };
};

type MetaAdsArchiveAd = {
  id?: string;
  page_id?: string;
  page_name?: string;
  ad_creation_time?: string;
  ad_delivery_start_time?: string;
  ad_delivery_stop_time?: string;
  ad_snapshot_url?: string;
  ad_creative_bodies?: string[];
  ad_creative_link_titles?: string[];
  ad_creative_link_descriptions?: string[];
  ad_creative_link_captions?: string[];
  publisher_platforms?: string[];
};

const fields = [
  "id",
  "page_id",
  "page_name",
  "ad_creation_time",
  "ad_delivery_start_time",
  "ad_delivery_stop_time",
  "ad_snapshot_url",
  "ad_creative_bodies",
  "ad_creative_link_titles",
  "ad_creative_link_descriptions",
  "ad_creative_link_captions",
  "publisher_platforms"
].join(",");

export async function searchFacebookAdLibrary(
  input: FacebookAdLibrarySearchInput
): Promise<FacebookAdLibraryCreative[]> {
  const accessToken = process.env.FACEBOOK_AD_LIBRARY_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("FACEBOOK_AD_LIBRARY_ACCESS_TOKEN is not configured.");
  }

  const apiVersion = process.env.FACEBOOK_GRAPH_API_VERSION ?? "v25.0";
  const searchTerms =
    input.searchMode === "app" ? `${input.query} app` : input.query;
  const url = new URL(`https://graph.facebook.com/${apiVersion}/ads_archive`);

  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("fields", fields);
  url.searchParams.set("search_terms", searchTerms);
  url.searchParams.set("ad_type", "ALL");
  url.searchParams.set("ad_active_status", input.activeStatus);
  url.searchParams.set("ad_reached_countries", JSON.stringify([input.country]));
  url.searchParams.set("limit", String(input.limit ?? 24));

  if (input.mediaType !== "ALL") {
    url.searchParams.set("media_type", input.mediaType);
  }

  const response = await fetch(url, {
    next: { revalidate: 300 }
  });
  const body = (await response.json()) as MetaAdsArchiveResponse;

  if (!response.ok) {
    throw new Error(body.error?.message ?? "Facebook Ad Library request failed.");
  }

  return (body.data ?? []).map((ad) =>
    normalizeFacebookAd(ad, input.country, input.activeStatus, input.mediaType)
  );
}

function normalizeFacebookAd(
  ad: MetaAdsArchiveAd,
  country: string,
  activeStatus: FacebookAdLibraryActiveStatus,
  mediaType: FacebookAdLibraryMediaType
): FacebookAdLibraryCreative {
  const title = firstValue(ad.ad_creative_link_titles);
  const body = firstValue(ad.ad_creative_bodies);
  const description = firstValue(ad.ad_creative_link_descriptions);
  const caption = firstValue(ad.ad_creative_link_captions);

  return {
    id: ad.id ?? crypto.randomUUID(),
    brandName: ad.page_name ?? "Unknown brand",
    pageId: ad.page_id ?? "",
    adType: mediaType === "VIDEO" ? "Video Ad" : mediaType === "IMAGE" ? "Image Ad" : "Meta Ad",
    mediaType: mediaType === "VIDEO" ? "Video" : mediaType === "IMAGE" ? "Image" : "Mixed",
    country,
    activeStatus:
      activeStatus === "ACTIVE" ? "Active" : activeStatus === "INACTIVE" ? "Inactive" : "Unknown",
    date: ad.ad_delivery_start_time ?? ad.ad_creation_time ?? new Date().toISOString(),
    cta: caption || "View ad",
    headline: title || body || "Untitled Meta creative",
    description: description || body || "No creative text returned by Meta for this ad.",
    thumbnailUrl: null,
    creativeUrl: null,
    snapshotUrl: ad.ad_snapshot_url ?? null,
    platforms: ad.publisher_platforms ?? []
  };
}

function firstValue(values: string[] | undefined) {
  return values?.find(Boolean) ?? "";
}
