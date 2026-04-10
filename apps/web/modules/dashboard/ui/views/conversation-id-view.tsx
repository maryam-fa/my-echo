"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { useEffect, useRef} from "react";

import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Button } from "@workspace/ui/components/button";
import { MoreHorizontalIcon, Wand2Icon } from "lucide-react";

import { 
    AIConversation, 
    AIConversationContent, 
    AIConversationScrollButton 
} from "@workspace/ui/components/ai/conversation";
import {
    AIInput,
    AIInputButton,
    AIInputSubmit,
    AIInputTextarea,
    AIInputToolbar,
    AIInputTools,
} from "@workspace/ui/components/ai/input";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { Form, FormField } from "@workspace/ui/components/form";
import { z } from "zod";
import { AIMessage, AIMessageContent } from "@workspace/ui/components/ai/message";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export const ConversationIdView = ({
  conversationId,
}: {
  conversationId: Id<"conversations">,
}) => {
    // Hooks lazmi component ke andar hone chahiye
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
          message: "",
      },
    });

    const createMessage = useMutation(api.private.messages.create); 


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
      try {
        await createMessage({
          conversationId,
          prompt: values.message,
        });

        form.reset();
      } catch {
        console.error("error");
      }
    };

    const conversation = useQuery(api.private.conversations.getOne, {
        conversationId,
    });

    const messages = useThreadMessages(
      api.private.messages.getMany,
      conversation?.threadId ? { threadId: conversation.threadId } : "skip" as any,
      { initialNumItems: 10, }
    );
    const messageEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.results]);

    return (
      <div className="flex h-screen flex-col bg-muted overflow-hidden">
        {/* 1. Header */}
        <header className="flex-none flex items-center justify-between border-b bg-background p-2.5">
          <Button size="sm" variant="ghost">
            <MoreHorizontalIcon />
          </Button>
        </header>
    
        {/* 2. Main Body */}
        <div className="flex-1 min-h-0 flex flex-col relative">
          <div className="absolute inset-0 overflow-y-auto flex flex-col">
            <div className="flex flex-col min-h-full">
              <AIConversation className="flex flex-col flex-1">
                <AIConversationContent className="p-4 flex-1">
                  {toUIMessages(messages.results ?? [])?.map((message) => (
                    <AIMessage 
                      from={message.role === "user" ? "assistant" : "user"} 
                      key={message.id}
                    >
                      <AIMessageContent>
                        <AIResponse>{message.content}</AIResponse>
                      </AIMessageContent>
                      {message.role === "user" && (
                        <DicebearAvatar 
                          seed={conversation?.contactSessionId ?? "user"} 
                          size={32}
                        />
                      )}
                    </AIMessage>
                  ))}
                  <div ref={messageEndRef} />
                  
                </AIConversationContent>
                
                <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm p-2">
                  <AIConversationScrollButton />
                </div>
              </AIConversation>
            </div>
          </div>
        </div>
    
        {/* 3. Professional Operator Input (Fixed Spacing) */}
        <div className="p-2"> 
          <Form {...form}>
            <AIInput 
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                disabled={conversation?.status === "resolved"}
                name="message"
                render={({ field }) => (
                  <AIInputTextarea
                    disabled={
                      conversation?.status === "resolved" ||
                      form.formState.isSubmitting
                    }
                    onChange={field.onChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        form.handleSubmit(onSubmit)();
                      }
                    }}
                    placeholder={
                      conversation?.status === "resolved"
                        ? "This conversation has been resolved"
                        : "Type your response as an operator..."
                    }
                    value={field.value}
                  />
                )}
              />
              
              <AIInputToolbar>
                <AIInputTools>
                  <AIInputButton>
                    <Wand2Icon/>
                    Enhance
                  </AIInputButton>
                </AIInputTools>
                
                  <AIInputSubmit
                    disabled={
                      conversation?.status === "resolved" ||
                      !form.formState.isValid ||
                      form.formState.isSubmitting
                    }
                    status="ready"
                    type="submit"
                  />
              </AIInputToolbar>
            </AIInput>
          </Form>
        </div>
      </div>
    );
};