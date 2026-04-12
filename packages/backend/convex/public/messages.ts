import { v } from "convex/values";
import { action, query } from "../_generated/server";
import { components, internal } from "../_generated/api";
import { ConvexError } from "convex/values";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { paginationOptsValidator } from "convex/server";
import { resolveConversation } from "../system/ai/tools/resolveConversation";
import { escalateConversation } from "../system/ai/tools/escalateConversation copy";
import { saveMessage } from "@convex-dev/agent";
export const create = action({
  args: {
    prompt: v.string(),
    threadId: v.string(),
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    // 1. Get and validate the contact session
    const contactSession = await ctx.runQuery(
      internal.system.contactSessions.getOne,
      {
        contactSessionId: args.contactSessionId,
      }
    );

    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session",
      });
    }

    // 2. Fetch the conversation by thread ID
    const conversation = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      {
        threadId: args.threadId,
      }
    );

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      });
    }

    // 3. Check if conversation is already resolved
    if (conversation.status === "resolved") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Conversation resolved",
      });
    }

    // TODO: Implement subscription 

    // 4. Generate AI response
    const shouldTriggerAgent = 
      conversation.status === "unresolved";
      if (shouldTriggerAgent) {
        await supportAgent.generateText(
          ctx,
          { threadId: args.threadId },
          {
            prompt: args.prompt,
            tools: {
              resolveConversation,
              escalateConversation,
          }
          },
        )
      } else {
        await saveMessage(ctx, components.agent, {
          threadId: args.threadId,
          prompt: args.prompt,
        });
      }
    
  },
});


export const getMany = query({
   args: {
    threadId: v.string(),
    paginationOpts: v.optional(paginationOptsValidator),
    contactSessionId: v.id("contactSessions"),

   },
   handler: async (ctx, args) => {
     const contactSession = await ctx.db.get(args.contactSessionId);
     
       if (!contactSession || contactSession.expiresAt < Date.now()) {
           throw new ConvexError({
              code: "UNAUTHORIZED",
              message: "Invalid session",
           });
     
        }

       const paginated = await supportAgent.listMessages(ctx, {
          threadId: args.threadId,
          paginationOpts: args.paginationOpts!,

        });

       return paginated;
    },
});