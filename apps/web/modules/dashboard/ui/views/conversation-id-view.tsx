"use client";

import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { useEffect, useRef, useState} from "react";

import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { Button } from "@workspace/ui/components/button";
import { MoreHorizontalIcon, Wand2Icon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

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
import { ConversationStatusButton } from "../components/conversation-status-button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { toast } from "sonner";

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

    const [isEnhancing, setIsEnhancing] = useState(false);

    const enhanceResponse = useAction(api.private.messages.enhanceResponse);
    const hanndleEnhanceResponse = async () => {
      setIsEnhancing(true);
      const currentValue = form.getValues("message");
      try {
        const response = await enhanceResponse({ prompt: currentValue });
        form.setValue("message", response);
      } catch (error) {
        toast.error("Something went wrong");
        console.error(error);
      } finally {
        setIsEnhancing(false);
      }
    }

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
    const [isUpdateStatus, setIsUpdatingStatus] = useState(false);

    const updateConversationStatus = useMutation(api.private.conversations.updateStatus);
    const handleToggleStatus = async () => {
      if (!conversation) {
        return;
      }

      setIsUpdatingStatus(true);
    
      let newStatus: "unresolved" | "resolved" | "escalated";
    
      // Cycle through states: unresolved -> escalated -> resolved -> unresolved
      if (conversation.status === "unresolved") {
        newStatus = "escalated";
      } else if (conversation.status === "escalated") {
        newStatus = "resolved";
      } else {
        newStatus = "unresolved";
      }
    
      try {
        await updateConversationStatus({
          conversationId,
          status: newStatus,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsUpdatingStatus(false);
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

    const {
      topElementRef,
      handleLoadMore,
      canLoadMore,
      isLoadingMore,
    } = useInfiniteScroll({
      status: messages.status,
      loadMore: messages.loadMore,
      loadSize: 10,
    })

    const messageEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.results]);

    if (conversation === undefined || messages.status === "LoadingFirstPage") {
      return <ConversationIdViewLoading />
    }

    return (
      <div className="flex h-screen flex-col bg-muted overflow-hidden">
        {/* 1. Header */}
        <header className="flex-none flex items-center justify-between border-b bg-background p-2.5">
          <Button size="sm" variant="ghost">
            <MoreHorizontalIcon />
          </Button>
          {!!conversation && (
            <ConversationStatusButton 
              onClick={handleToggleStatus}
              status={conversation?.status}
              disabled={isUpdateStatus}
            />
          )}
          
        </header>
    
        {/* 2. Main Body */}
        <div className="flex-1 min-h-0 flex flex-col relative">
          <div className="absolute inset-0 overflow-y-auto flex flex-col">
            <div className="flex flex-col min-h-full">
              <AIConversation className="flex flex-col flex-1">
                <AIConversationContent className="p-4 flex-1">
                  <InfiniteScrollTrigger
                     canLoadMore={canLoadMore}
                     isLoadingMore={isLoadingMore}
                     onLoadMore={handleLoadMore}
                     ref={topElementRef}
                     
                  />
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
                  <AIInputButton onClick={hanndleEnhanceResponse} disabled={conversation?.status === "resolved" || isEnhancing || !form.formState.isValid}>
                    <Wand2Icon/>
                    {isEnhancing ? "Enhancing..." : "Enhance"}
                  </AIInputButton>
                </AIInputTools>
                
                  <AIInputSubmit
                    disabled={
                      conversation?.status === "resolved" ||
                      !form.formState.isValid ||
                      form.formState.isSubmitting ||
                      isEnhancing
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

export const ConversationIdViewLoading = () => {
  return (
    <div className="flex h-full flex-col bg-muted">
      <header className="flex items-center justify-between border-b bg-background p-2.5">
        <Button disabled size="sm" variant="ghost">
          <MoreHorizontalIcon />

        </Button>
      </header>
      <AIConversation className="max-h-[calc(100vh-180px)]">
        <AIConversationContent>
          {Array.from({ length: 8 }, (_, index) => {
            const isUser = index % 2 === 0;
            const widths = ["w-48", "w-60", "w-72"];
            const width = widths[index % widths.length];

            return (
              <div className={cn( "groupflex w-full justify-end gap-2 py-2 [&>div]:max-w-[80%]",
                isUser ? "is-user" : "is-assistant flex-row-reverse"
              )} key={index} >
                <Skeleton className={`h-9 ${width} rounded-lg bg-neutral-200`} />
                <Skeleton className="size-8 rounded-full bg-neutral-200" />
            </div>
            );
          })}
        </AIConversationContent>
      </AIConversation>

      <div className="p-2">
        <AIInput>
          <AIInputTextarea disabled placeholder="Type your response as an operator..." />
          <AIInputToolbar>
            <AIInputTools />
            <AIInputSubmit disabled status="ready" />
          </AIInputToolbar>
        </AIInput>

      </div>

    </div>
  );
};