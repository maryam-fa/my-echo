import { groq } from "@ai-sdk/groq";
import { RAG } from "@convex-dev/rag";
import { components } from "../../_generated/api";

const googleEmbedder = {
  modelId: "gemini-embedding-001",
  doEmbed: async ({ values }: { values: string[] }) => {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=AIzaSyDDet3J5QWB0djM87Z5tRc8SIGmKSMGyd0`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: values.map((text) => ({
            model: "models/gemini-embedding-001",
            content: { parts: [{ text }] },
          })),
        }),
      }
    );
    const data = await response.json();
    return {
      embeddings: data.embeddings.map((e: any) => e.values),
    };
  },
};

const ragConfig: any = {
  model: groq("llama-3.1-70b-versatile"),
  textEmbeddingModel: googleEmbedder,
  embeddingDimension: 3072,
};

export const rag = new RAG((components as any).rag, ragConfig);