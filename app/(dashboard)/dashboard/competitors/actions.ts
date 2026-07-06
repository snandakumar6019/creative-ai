"use server";

import {
  searchFacebookAdLibrary,
  type FacebookAdLibraryActiveStatus,
  type FacebookAdLibraryCreative,
  type FacebookAdLibraryMediaType,
  type FacebookAdLibrarySearchMode
} from "@/lib/services/facebook-ad-library";

export type FacebookAdLibraryState = {
  status: "idle" | "success" | "error";
  creatives: FacebookAdLibraryCreative[];
  error?: string;
  query?: string;
};

export const initialFacebookAdLibraryState: FacebookAdLibraryState = {
  status: "idle",
  creatives: []
};

const activeStatuses = new Set(["ACTIVE", "ALL", "INACTIVE"]);
const mediaTypes = new Set(["ALL", "IMAGE", "VIDEO"]);
const searchModes = new Set(["brand", "app"]);

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function searchFacebookAdLibraryAction(
  _state: FacebookAdLibraryState,
  formData: FormData
): Promise<FacebookAdLibraryState> {
  const query = readString(formData, "facebookQuery").trim();
  const country = readString(formData, "facebookCountry") || "US";
  const activeStatus = readString(formData, "facebookActiveStatus");
  const mediaType = readString(formData, "facebookMediaType");
  const searchMode = readString(formData, "facebookSearchMode");

  if (!query) {
    return {
      status: "error",
      creatives: [],
      error: "Enter a brand or app name to search."
    };
  }

  try {
    const creatives = await searchFacebookAdLibrary({
      query,
      country,
      activeStatus: activeStatuses.has(activeStatus)
        ? (activeStatus as FacebookAdLibraryActiveStatus)
        : "ACTIVE",
      mediaType: mediaTypes.has(mediaType)
        ? (mediaType as FacebookAdLibraryMediaType)
        : "ALL",
      searchMode: searchModes.has(searchMode)
        ? (searchMode as FacebookAdLibrarySearchMode)
        : "brand"
    });

    return {
      status: "success",
      creatives,
      query
    };
  } catch (error) {
    return {
      status: "error",
      creatives: [],
      query,
      error: error instanceof Error ? error.message : "Facebook Ad Library search failed."
    };
  }
}
