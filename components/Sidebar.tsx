import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useChatHistory } from "@/hooks/api/use-history";
import { useVoiceSession } from "@/hooks/useVoiceSession";
import { cn } from "@/lib/utils";
import { MessageSquare, Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { IMAGES } from "@/utils/Images";

interface SidebarProps extends React.ComponentProps<typeof ShadcnSidebar> {
  onConversationSelect: (id: string) => void;
  onNewChat: () => void;
  selectedId: string | null;
  overlay?: boolean;
}

export const Sidebar = ({
  onConversationSelect,
  onNewChat,
  selectedId,
  ...props
}: SidebarProps) => {
  const {
    data: history,
    isLoading,
    refetch,
  } = useChatHistory({
    skip: 0,
    limit: 100, // TODO: Pagination pending, using static limit 100
  });

  const { setOpenMobile, isMobile } = useSidebar();
  const { status } = useVoiceSession();
  const prevStatus = useRef(status);

  useEffect(() => {
    // Only refetch when transitioning from a non-idle state to idle (disconnect)
    // This allows the backend some time to save the session before we fetch
    if (prevStatus.current !== "idle" && status === "idle") {
      // Add a small delay to ensure backend has processed the save
      const timer = setTimeout(() => {
        refetch();
      }, 1000);
      return () => clearTimeout(timer);
    }
    prevStatus.current = status;
  }, [status, refetch]);

  const handleSelect = (id: string) => {
    onConversationSelect(id);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleNewChat = () => {
    onNewChat();
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <ShadcnSidebar
      collapsible="icon"
      {...props}
      className={cn(
        "border-sidebar-border",
        props.side !== "right" && "border-r",
        props.variant !== "floating" && "bg-sidebar",
        props.className
      )}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col gap-2 pb-2 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-2 px-2 py-1">
                <div className="h-8 w-8 flex items-center justify-center rounded-md ">
                  <Image
                    src={IMAGES.DevstreeDLogo}
                    alt="Devstree Logo"
                    width={100}
                    height={100}
                    className="w-7 h-7"
                  />
                </div>
                <span className="font-bold text-sidebar-foreground tracking-tight">
                  Voice Chat
                </span>
              </div>
              <Button
                onClick={handleNewChat}
                size="sm"
                className="w-full justify-start gap-2 h-auto py-3 bg-gradient-to-r to-primary/45 from-primary  hover:from-primary/90  text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95 "
              >
                <Plus className="w-4 h-4" />{" "}
                <span className="truncate font-medium">New Voice Session</span>
              </Button>
            </div>
            {/* Icon-only fallback for collapsed state */}
            <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center py-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewChat}
                className="h-8 w-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>History</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-4">
              {isLoading ? (
                <div className="space-y-2 px-2 py-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-full bg-muted/50 rounded-md animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <>
                  {history?.map((item, idx) => {
                    const conversationId =
                      item.id || item.conversation_id || `temp-${idx}`;
                    const displayTitle =
                      item.transcript_summary ||
                      item.summary ||
                      `Session ${history.length - idx}`;
                    const isTemp =
                      !conversationId || conversationId.startsWith("temp-");

                    return (
                      <SidebarMenuItem key={conversationId}>
                        <SidebarMenuButton
                          onClick={() =>
                            !isTemp && handleSelect(conversationId)
                          }
                          isActive={selectedId === conversationId}
                          disabled={isTemp}
                          className={cn(
                            "group/item p-5 transition-all duration-200 ",
                            selectedId === conversationId
                              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm border-sidebar-border font-medium"
                              : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                            isTemp && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <MessageSquare
                            className={cn(
                              "w-4 h-4",
                              selectedId === conversationId
                                ? "text-primary"
                                : "text-muted-foreground group-hover/item:text-sidebar-foreground"
                            )}
                          />
                          <div className="flex flex-col gap-0.5 overflow-hidden text-left flex-1 min-w-0">
                            <span className="truncate">{displayTitle}</span>
                            {item.created_at && (
                              <span className="text-[10px] text-muted-foreground truncate font-normal">
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
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                  {(!history || history.length === 0) && (
                    <div className="px-2 py-8 text-center flex flex-col items-center group-data-[collapsible=icon]:hidden">
                      <MessageSquare className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground italic">
                        No history found
                      </p>
                    </div>
                  )}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </ShadcnSidebar>
  );
};
