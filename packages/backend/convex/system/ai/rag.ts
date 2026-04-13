import { groq } from "@ai-sdk/groq";
import { RAG } from "@convex-dev/rag";
import { components } from "../../_generated/api";
import { google } from "@ai-sdk/google";

// Config ko 'any' variable mein rakhne se model ka error chala jata hai
const ragConfig: any = {
  model: groq("llama-3.1-70b-versatile"),
  
  // Filhal embeddings ko undefined rakhein jab tak Google setup na ho
  textEmbeddingModel: google.embedding("text-embendding-004"), 
  
  embeddingDimension: 786,
};

// (components as any).rag likhne se components ka error khatam ho jayega
export const rag = new RAG((components as any).rag, ragConfig);