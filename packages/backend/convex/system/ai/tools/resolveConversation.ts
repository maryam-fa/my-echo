import { createTool } from "@convex-dev/agent";
import z from "zod";
import { internal } from "../../../_generated/api";
import { supportAgent } from "../agents/supportAgent";

export const resolveConversation = createTool({
  description: "Resolve a conversation",
  args: z.object({}),
  handler: async (ctx) => {
    // Check if threadId exists
    if (!ctx.threadId) {
      return "Missing thread ID";
    }

    // Run mutation to resolve the conversation in the system
    await ctx.runMutation(internal.system.conversations.resolve, {
      threadId: ctx.threadId,
    });

    // Save the resolution message via the support agent
    await supportAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: {
        role: "assistant",
        content: "Conversation resolved.",
      },
    });

    return "Conversation resolved";
  },
});