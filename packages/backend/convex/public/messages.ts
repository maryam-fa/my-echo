import { v } from "convex/values";
import { action, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { ConvexError } from "convex/values";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { paginationOptsValidator } from "convex/server";
import { error } from "console";

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

    // TODO: Implement subscription check

    // 4. Generate AI response
    await supportAgent.generateText(
      ctx,
      { threadId: args.threadId },
      {
        prompt: args.prompt,
      }
    );
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