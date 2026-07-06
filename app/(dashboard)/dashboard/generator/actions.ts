"use server";

import { generateCreative, type CreativeGenerationResult } from "@/lib/openai";

export type CreativeGeneratorState = {
  status: "idle" | "success" | "error";
  result?: CreativeGenerationResult;
  error?: string;
};

export const initialCreativeGeneratorState: CreativeGeneratorState = {
  status: "idle"
};

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function generateCreativeAction(
  _state: CreativeGeneratorState,
  formData: FormData
): Promise<CreativeGeneratorState> {
  try {
    const userInstructions = [
      readString(formData, "userInstructions"),
      readString(formData, "generationNotes")
    ]
      .filter(Boolean)
      .join("\n\nGeneration notes:\n");

    const result = await generateCreative({
      productInformation: readString(formData, "productInformation"),
      competitorAnalysis: readString(formData, "competitorAnalysis"),
      userInstructions,
      controls: {
        hookStyle: readString(formData, "hookStyle"),
        tone: readString(formData, "tone"),
        visualStyle: readString(formData, "visualStyle"),
        creatorPersona: readString(formData, "creatorPersona"),
        background: readString(formData, "background"),
        cta: readString(formData, "cta"),
        videoLength: readString(formData, "videoLength")
      }
    });

    return {
      status: "success",
      result
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Creative generation failed."
    };
  }
}
