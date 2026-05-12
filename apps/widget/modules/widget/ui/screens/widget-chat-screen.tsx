"use client";

import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form, FormField } from "@workspace/ui/components/form";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";

import { Button } from "@workspace/ui/components/button";
import { WidgetHeader } from "../components/widget-header";
import { ArrowLeftIcon, MenuIcon } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai/react";
import { contactSessionIdAtomFamily, conversationIdAtom, organizationIdAtom, screenAtom } from "../../atoms/widget-atoms";
import { useAction, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { AIConversation, AIConversationContent, AIConversationScrollButton,} from "@workspace/ui/components/ai/conversation";
import { AIInput, AIInputSubmit, AIInputTextarea, AIInputToolbar, AIInputTools } from "@workspace/ui/components/ai/input";
import { AIMessage, AIMessageContent } from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { AISuggestion, AISuggestions} from "@workspace/ui/components/ai/suggestion";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});
 
export const WidgetChatScreen = () => {
    const setScreen = useSetAtom(screenAtom);
    const setConversationId = useSetAtom(conversationIdAtom);

    const conversationId = useAtomValue(conversationIdAtom);
    const organizationId = useAtomValue(organizationIdAtom);

    const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || ""));

    const onBack = () => {
      setConversationId(null);
      setScreen("selection");
  };

    const conversation = useQuery(
        api.public.conversations.getOne, 
        conversationId && contactSessionId
        ?   {
              conversationId,
              contactSessionId,
            } 
        : "skip"
    );

    const messages = useThreadMessages(
        api.public.messages.getMany,
        (conversation?.threadId && contactSessionId
          ? {
              threadId: conversation.threadId,
              contactSessionId: contactSessionId,
            }
          : "skip") as any,
        { initialNumItems: 10 }
      );

      const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } = useInfiniteScroll({
        status: messages.status,
        loadMore: messages.loadMore,
        loadSize: 10
      });

      const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          message: "",
        },
      });

      const createMessage = useAction(api.public.messages.create) as any;
      const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!conversation || !contactSessionId) {
          return;
        }

        form.reset();

        await createMessage({
          threadId: conversation.threadId,
          prompt: values.message,
          contactSessionId,
        });
      };

      

    return (
        <>
          <WidgetHeader className="flex items-center justify-between">
               <div className="flex items-center gap-x-2">
                   <Button onClick={onBack} size="icon" variant="transparent">
                      <ArrowLeftIcon />
                   </Button>
                   <p>
                      chat
                   </p>  
               </div>
               <Button size="icon" variant="transparent">
                  <MenuIcon />
               </Button>
          </WidgetHeader>
          <AIConversation className="flex flex-col h-full">
            <AIConversationContent>
              <InfiniteScrollTrigger canLoadMore={canLoadMore} isLoadingMore={isLoadingMore} onLoadMore={handleLoadMore} ref={topElementRef} />
              {toUIMessages(messages.results ?? [])?.map((message) => {
                return (
                  <AIMessage from={message.role == "user" ? "user" : "assistant"} key={message.id}>
                     <AIMessageContent>
                      <AIResponse>
                        {(message as any).content}
                      </AIResponse>
                     </AIMessageContent>
                     {message.role === "assistant" && (
                      <DicebearAvatar 
                         imageUrl="/logo.svg"
                         seed="assistant"
                         size={32}
                      />
                     )}
                  </AIMessage>
                )
              })}
            </AIConversationContent>
            {/* TODO: Add suggestions */}
            <Form {...form}>
               <AIInput className=" sticky bottom-0 mt-auto bg-white border-t rounded-none border-x-0 border-b-0" onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    disabled={conversation?.status === "resolved"} 
                    name="message"
                    render={({ field }) => (
                      <AIInputTextarea 
                        {...field} 
                        disabled={conversation?.status === "resolved"} 
                        onChange={field.onChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            form.handleSubmit(onSubmit)();
                          }
                        }}
                        placeholder={
                          conversation?.status === "resolved"
                            ? "This conversation has been resolved."
                            : "Type your message..."
                        }
                        value={field.value}
                     />
                   )}
                 />
                 <AIInputToolbar className="flex flex-row-reverse justify-between item-center w-full">
                  <AIInputTools>
                    <AIInputSubmit disabled={conversation?.status === "resolved" || !form.formState.isValid} status="ready" type="submit" 
                    />
                  </AIInputTools>
                 </AIInputToolbar>
               </AIInput>
            </Form>
          </AIConversation>
        </>
    );
    
};