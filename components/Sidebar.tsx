import { useChatHistory } from "@/hooks/api/use-history";
import { cn } from "@/lib/utils";
import { MessageSquare, PanelLeftClose, Plus } from "lucide-react";
import { Button } from "./ui/button";

interface SidebarProps {
  onSelect: (id: string) => void;
  onNewChat: () => void;
  selectedId: string | null;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export const Sidebar = ({
  onSelect,
  onNewChat,
  selectedId,
  className,
  isOpen,
  onClose,
  isMobile,
}: SidebarProps) => {
  const { data: history, isLoading } = useChatHistory({ skip: 0, limit: 100 });

  return (
    <div
      className={cn(
        "bg-slate-950/95 backdrop-blur-xl border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col h-full shrink-0",
        isMobile ? "fixed inset-y-0 left-0 z-50 w-72" : "relative",
        isMobile && !isOpen && "-translate-x-full",
        !isMobile && (isOpen ? "w-72" : "w-0 border-none"),
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50 overflow-hidden shrink-0 h-16">
        <Button
          onClick={onNewChat}
          size="sm"
          className="flex-1 justify-start gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 transition-all active:scale-95"
          disabled={!isOpen && !isMobile}
        >
          <Plus className="w-4 h-4" />{" "}
          <span className="truncate">New Chat</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="ml-2 text-slate-400 hover:text-white shrink-0"
          title="Close sidebar"
        >
          <PanelLeftClose className="w-5 h-5" />
        </Button>
      </div>

      <div
        className={cn(
          "flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent transition-opacity duration-200",
          !isOpen && !isMobile ? "opacity-0" : "opacity-100"
        )}
      >
        {isLoading ? (
          <div className="space-y-2 px-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-10 w-full bg-slate-800/50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mb-1 flex items-center justify-between">
              <span>History</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">
                {history?.length || 0}
              </span>
            </h3>
            {history?.map((item, idx) => {
              const conversationId =
                item.id || item.conversation_id || `temp-${idx}`;
              // Fallback title logic: Use summary if available, else "Session {n}", else "New Conversation"
              const displayTitle =
                item.transcript_summary ||
                item.summary ||
                `Session ${history.length - idx}`;

              return (
                <button
                  key={conversationId}
                  onClick={() => {
                    if (conversationId && !conversationId.startsWith("temp-")) {
                      onSelect(conversationId);
                      if (isMobile) onClose();
                    }
                  }}
                  disabled={
                    !conversationId || conversationId.startsWith("temp-")
                  }
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-all duration-200 text-left group border border-transparent",
                    selectedId === conversationId
                      ? "bg-slate-800 text-slate-100 shadow-md shadow-black/20 border-slate-700"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:border-slate-800",
                    (!conversationId || conversationId.startsWith("temp-")) &&
                      "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div
                    className={cn(
                      "p-1.5 rounded-md transition-colors shrink-0",
                      selectedId === conversationId
                        ? "bg-indigo-500/20 text-indigo-400"
                        : "bg-slate-800 text-slate-500 group-hover:text-slate-400"
                    )}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col overflow-hidden text-left">
                    <span className="truncate font-medium block w-full">
                      {displayTitle}
                    </span>
                    {item.created_at && (
                      <span className="text-[10px] text-slate-600 bg-transparent truncate">
                        {new Date(item.created_at).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
            {(!history || history.length === 0) && (
              <div className="px-3 py-10 text-center flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center mb-2">
                  <MessageSquare className="w-4 h-4 text-slate-700" />
                </div>
                <p className="text-xs text-slate-500 italic">
                  No history found
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={cn(
          "p-4 border-t border-slate-800/50 shrink-0 transition-opacity duration-200",
          !isOpen && !isMobile ? "opacity-0" : "opacity-100"
        )}
      >
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-900/50 p-2 rounded-md border border-slate-800/50">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
          </div>
          System Operational
        </div>
      </div>
    </div>
  );
};
