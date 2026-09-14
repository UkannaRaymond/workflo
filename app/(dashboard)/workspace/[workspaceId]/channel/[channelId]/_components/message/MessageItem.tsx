import { SafeContent } from "@/components/rich-text-editor/SafeContent";
import { getAvatar } from "@/lib/get-avatar";
import Image from "next/image";
import { MessageHoverToolbar } from "../toolbar";
import { useCallback, useState } from "react";
import { EditMessage } from "../toolbar/EditMessage";
import { MessageListItem } from "@/lib/types";
import { MessageSquare } from "lucide-react";
import { useThread } from "@/providers/ThreadProviders";
import { orpc } from "@/lib/orpc";
import { useQueryClient } from "@tanstack/react-query";
import { ReactionBar } from "../reaction/ReactionsBar";

interface iMessageItemProps {
  message: MessageListItem;
  currentUserId: string;
}

export function MessageItem({ message, currentUserId }: iMessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { openThread } = useThread();
  const queryClient = useQueryClient();

  const prefetchThread = useCallback(() => {
    const options = orpc.message.thread.list.queryOptions({
      input: {
        messageId: message.id,
      },
    });
    queryClient
      .prefetchQuery({ ...options, staleTime: 60_000 })
      .catch(() => {});
  }, [message.id, queryClient]);

  return (
    <div className="flex space-x-3 relative p-3 rounded-lg group hover:bg-muted/50">
      <Image
        src={getAvatar(message.authorAvatar, message.authorEmail)}
        alt="User Avatar"
        width={32}
        height={32}
        className="size-8 rounded-lg"
      />

      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center gap-x-2">
          <p className="font-medium leading-none">{message.authorName}</p>

          <p className="text-xs text-muted-foreground leading-none">
            {new Intl.DateTimeFormat("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(message.createdAt)}{" "}
            {new Intl.DateTimeFormat("en-NG", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }).format(message.createdAt)}
          </p>
        </div>

        {isEditing ? (
          <EditMessage
            message={message}
            onCancel={() => setIsEditing(false)}
            onSave={() => setIsEditing(false)}
          />
        ) : (
          <>
            {message.deletedAt ? (
              <div className="text-sm text-muted-foreground line-through italic">
                <SafeContent
                  className="prose dark:prose-invert max-w-none mark:text-primary"
                  content={JSON.parse(message.content)}
                />
              </div>
            ) : (
              <SafeContent
                className="text-sm wrap-break-word prose dark:prose-invert max-w-none mark:text-primary"
                content={JSON.parse(message.content)}
              />
            )}

            {message.imageUrl && (
              <div className="mt-3">
                <Image
                  src={message.imageUrl}
                  alt="Attachment"
                  width={512}
                  height={512}
                  className="rounded-md max-h-80 w-auto object-contain"
                />
              </div>
            )}

            {/* Reactions */}
            <ReactionBar
              messageId={message.id}
              reactions={message.reactions}
              context={{ type: "list", channelId: message.channelId! }}
            />

            {message.replyCount > 0 && (
              <button
                type="button"
                className="mt-1 inline-flex items-center gap-1 text-xs
                text-muted-foreground hover:text-foreground
                focus-visible:outline-none focus-visible:ring-1
                focus-visible:ring-border cursor-pointer"
                onClick={() => openThread(message.id)}
                onMouseEnter={prefetchThread}
                onFocus={prefetchThread}
              >
                <MessageSquare className="size-3.5" />
                <span>
                  {message.replyCount}{" "}
                  {message.replyCount === 1 ? "reply" : "replies"}
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                  View Thread
                </span>
              </button>
            )}
          </>
        )}
      </div>

      <MessageHoverToolbar
        messageId={message.id}
        canEdit={message.authorId === currentUserId}
        onEdit={() => setIsEditing(true)}
      />
    </div>
  );
}
