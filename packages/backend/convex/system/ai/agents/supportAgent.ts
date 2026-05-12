import { groq } from "@ai-sdk/groq"
import { components } from "../../../_generated/api";
import { Agent } from "@convex-dev/agent";
import { SUPPORT_AGENT_PROMPT } from "../constants";


export const supportAgent = new Agent(components.agent, {
    chat: groq("llama-3.1-8b-instant"),
    instructions: SUPPORT_AGENT_PROMPT,
});

