import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { ConvexError } from "convex/values";
import type { StorageActionWriter } from "convex/server";
import { assert } from "convex-helpers";
import { Id } from "../_generated/dataModel";

const AI_MODELS = {
  image: groq("llama-3.2-11b-vision-preview"),
  pdf: groq("llama-3.1-70b-versatile"),
  html: groq("llama-3.1-8b-instant"),
} as const;

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const SYSTEM_PROMPTS = {
  image:
    "You turn images into text. If it is a photo of a document, transcribe it. If it is not a document, describe it.",
  pdf: "You transform PDF files into text.",
  html: "You transform content into markdown.",
};

export type ExtractTextContentArgs = {
  storageId: Id<"_storage">;
  filename: string;
  bytes?: ArrayBuffer;
  mimeType: string;
};

export async function extractTextContent(
  ctx: { storage: StorageActionWriter },
  args: ExtractTextContentArgs
): Promise<string> {
  const { storageId, filename, bytes, mimeType } = args;

  const url = await ctx.storage.getUrl(storageId);
  assert(url, "Failed to get storage URL");

  if (SUPPORTED_IMAGE_TYPES.some((type) => type === mimeType)) {
    return extractImageText(url);
  }

  if (mimeType.toLowerCase().includes("pdf")) {
    return extractPdfText(url, mimeType, filename);
  }

  if (
    mimeType.toLowerCase().includes("text") ||
    mimeType.toLowerCase().includes("markdown")
  ) {
    if (bytes) {
      return new TextDecoder().decode(bytes);
    }

    const response = await fetch(url);
    return response.text();
  }

  if (mimeType.toLowerCase().includes("html")) {
    return extractHtmlText(url);
  }

  throw new ConvexError({
    code: "BAD_REQUEST",
    message: `Unsupported file type: ${mimeType}`,
  });
}

async function extractHtmlText(url: string): Promise<string> {
  const response = await fetch(url);
  const html = await response.text();

  const result = await generateText({
    model: AI_MODELS.html,
    system: SYSTEM_PROMPTS.html,
    prompt: html,
  });

  return result.text;
}

async function extractPdfText(
  url: string,
  mimeType: string,
  filename: string
): Promise<string> {
  const result = await generateText({
    model: AI_MODELS.pdf,
    system: SYSTEM_PROMPTS.pdf,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Please extract and transcribe the text from the PDF at this URL: ${url}`,
          },
        ],
      },
    ],
  });

  return result.text;
}

async function extractImageText(url: string): Promise<string> {
  const result = await generateText({
    model: AI_MODELS.image,
    system: SYSTEM_PROMPTS.image,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            image: new URL(url),
          },
        ],
      },
    ],
  });

  return result.text;
}