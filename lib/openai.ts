import { z } from "zod";

export const generatedCreativeSchema = z.object({
  title: z.string(),
  format: z.string(),
  status: z.string(),
  hook: z.string(),
  cta: z.string(),
  prompt: z.string(),
  palette: z.enum([
    "from-teal-500 via-cyan-500 to-slate-950",
    "from-amber-400 via-orange-500 to-neutral-950",
    "from-rose-500 via-fuchsia-500 to-zinc-950"
  ])
});

export const creativeGenerationResultSchema = z.object({
  headlines: z.array(z.string()).min(3),
  adCopy: z.array(z.string()).min(3),
  hooks: z.array(z.string()).min(3),
  imagePrompt: z.string(),
  videoScript: z.object({
    title: z.string(),
    duration: z.string(),
    scenes: z.array(
      z.object({
        timestamp: z.string(),
        visual: z.string(),
        voiceover: z.string(),
        onScreenText: z.string()
      })
    )
  }),
  generatedCreatives: z.array(generatedCreativeSchema).min(3)
});

export type GeneratedCreativeOutput = z.infer<typeof generatedCreativeSchema>;
export type CreativeGenerationResult = z.infer<typeof creativeGenerationResultSchema>;

export type CreativeGenerationInput = {
  productInformation: string;
  competitorAnalysis: string;
  userInstructions: string;
  controls: {
    hookStyle: string;
    tone: string;
    visualStyle: string;
    creatorPersona: string;
    background: string;
    cta: string;
    videoLength: string;
  };
};

const creativeGenerationJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["headlines", "adCopy", "hooks", "imagePrompt", "videoScript", "generatedCreatives"],
  properties: {
    headlines: {
      type: "array",
      minItems: 3,
      items: { type: "string" }
    },
    adCopy: {
      type: "array",
      minItems: 3,
      items: { type: "string" }
    },
    hooks: {
      type: "array",
      minItems: 3,
      items: { type: "string" }
    },
    imagePrompt: { type: "string" },
    videoScript: {
      type: "object",
      additionalProperties: false,
      required: ["title", "duration", "scenes"],
      properties: {
        title: { type: "string" },
        duration: { type: "string" },
        scenes: {
          type: "array",
          minItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["timestamp", "visual", "voiceover", "onScreenText"],
            properties: {
              timestamp: { type: "string" },
              visual: { type: "string" },
              voiceover: { type: "string" },
              onScreenText: { type: "string" }
            }
          }
        }
      }
    },
    generatedCreatives: {
      type: "array",
      minItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "format", "status", "hook", "cta", "prompt", "palette"],
        properties: {
          title: { type: "string" },
          format: { type: "string" },
          status: { type: "string" },
          hook: { type: "string" },
          cta: { type: "string" },
          prompt: { type: "string" },
          palette: {
            type: "string",
            enum: [
              "from-teal-500 via-cyan-500 to-slate-950",
              "from-amber-400 via-orange-500 to-neutral-950",
              "from-rose-500 via-fuchsia-500 to-zinc-950"
            ]
          }
        }
      }
    }
  }
} as const;

type OpenAIResponseBody = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
};

export async function generateCreative(
  input: CreativeGenerationInput
): Promise<CreativeGenerationResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are a senior performance creative strategist. Generate practical, channel-ready ad creative. Return only JSON that matches the requested schema."
        },
        {
          role: "user",
          content: JSON.stringify({
            task:
              "Given product information, competitor analysis, and user instructions, generate creative outputs for the Creative AI UI.",
            productInformation: input.productInformation,
            competitorAnalysis: input.competitorAnalysis,
            userInstructions: input.userInstructions,
            generationControls: input.controls,
            requirements: {
              headlines: "Return at least 3 short paid-social headlines.",
              adCopy: "Return at least 3 ad copy variants.",
              hooks: "Return at least 3 opening hooks.",
              imagePrompt: "Return one detailed image generation prompt.",
              videoScript:
                "Return a short video script with timestamped scenes, visual direction, voiceover, and on-screen text.",
              generatedCreatives:
                "Return at least 3 card-ready generated creatives with title, format, status, hook, cta, prompt, and one of the allowed palette enum values."
            }
          })
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "creative_generation_response",
          strict: true,
          schema: creativeGenerationJsonSchema
        }
      }
    })
  });

  const data = (await response.json()) as OpenAIResponseBody;

  if (!response.ok) {
    throw new Error(data.error?.message ?? "OpenAI generation failed.");
  }

  const outputText =
    data.output_text ??
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .find(Boolean);

  if (!outputText) {
    throw new Error("OpenAI returned an empty response.");
  }

  const parsedJson = JSON.parse(outputText);
  return creativeGenerationResultSchema.parse(parsedJson);
}
