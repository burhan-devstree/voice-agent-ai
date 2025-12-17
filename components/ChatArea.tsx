"use client";
import { useChatHistoryById } from "@/hooks/api/use-history";
import { cn } from "@/lib/utils";
import { Bot, Clock, MessageSquareOff, User } from "lucide-react";
import { useRef } from "react";

interface ChatAreaProps {
  conversationId: string;
}

export const ChatArea = ({ conversationId }: ChatAreaProps) => {
  const { data: conversationData, isLoading } =
    useChatHistoryById(conversationId);
  console.log("🚀 ~ ChatArea ~ conversationData:", conversationData);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom - REMOVED for history view as per request
  // We want to start at the top for history
  /*
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversationData, isLoading]);
  */

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-indigo-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Bot className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          Loading conversation...
        </p>
      </div>
    );
  }

  const messages = conversationData?.transcript || [];

  if (!conversationData || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
        <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6 ring-1 ring-border">
          <MessageSquareOff className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No messages found
        </h3>
        <p className="text-muted-foreground max-w-xs mx-auto text-sm">
          This conversation appears to be empty or could not be loaded.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
      ref={scrollRef}
    >
      <div className="max-w-3xl mx-auto space-y-6 pb-10">
        <div className="text-center py-4 space-y-4">
          <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border">
            Conversation History
          </span>
          {conversationData?.transcript_summary && (
            <div className="mx-auto max-w-2xl bg-gradient-to-br from-primary/10 to-muted/20 p-6 rounded-2xl border border-primary/10 shadow-lg">
              <h4 className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide">
                Summary
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed italic">
                {conversationData.transcript_summary}
              </p>
            </div>
          )}
        </div>

        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id || idx}
              className={cn(
                "flex gap-4 items-end group transition-opacity duration-500",
                isUser ? "justify-end" : "justify-start"
              )}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border shadow-sm mt-1">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}

              <div
                className={cn(
                  "flex flex-col max-w-[85%] md:max-w-[75%]",
                  isUser ? "items-end" : "items-start"
                )}
              >
                <div className="flex items-center gap-2 mb-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    {isUser ? "You" : "AI Assistant"}
                  </span>
                  {msg.created_at && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>

                <div
                  className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all duration-200",
                    isUser
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground border border-border rounded-bl-sm"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {msg.message || msg.content}
                  </p>
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 mt-1">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
