import { groq } from "@ai-sdk/groq"
import { components } from "../../../_generated/api";
import { Agent } from "@convex-dev/agent";

export const supportAgent = new Agent(components.agent, {
    chat: groq("llama-3.1-8b-instant"),
    instructions: "You are a customer support agent"
});

