"use client";

import {
  createMessageSchema,
  CreateMessageSchemaType,
} from "@/app/schemas/message";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { MessageComposer } from "./MessageComposer";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { useState } from "react";
import { useAttachmentUpload } from "@/hooks/use-attachment-upload";
import { Message } from "@/lib/generated/prisma/client";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getAvatar } from "@/lib/get-avatar";
import { useChannelRealtime } from "@/providers/ChannelRealtimeProviders";

interface IAppProps {
  channelId: string;
  user: KindeUser<Record<string, unknown>>;
}

interface TiptapNode {
  type?: string;
  text?: string;
  content?: TiptapNode[];
}

type MessagePage = {
  items: Message[];
  nextCursor?: string;
};

type InfiniteMessages = InfiniteData<MessagePage>;

export function MessageInputForm({ channelId, user }: IAppProps) {
  const queryClient = useQueryClient();
  const [editorKey, setEditorKey] = useState(0);
  const upload = useAttachmentUpload();
  const { send } = useChannelRealtime();

  const form = useForm<z.infer<typeof createMessageSchema>>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      channelId,
      content: "",
    },
  });

  const createMessageMutation = useMutation(
    orpc.message.create.mutationOptions({
      onMutate: async (data) => {
        /*
         * Get the current cache BEFORE making the optimistic change.
         * This gives us something to restore if the request fails.
         */
        const previousMessages = queryClient.getQueryData<InfiniteMessages>([
          "message.list",
          channelId,
        ]);

        /*
         * Save the submitted values for rollback.
         */
        const previousContent = data.content;
        const previousImageUrl = data.imageUrl ?? null;

        /*
         * Clear the form immediately.
         *
         * This happens BEFORE waiting for cancelQueries(), so the
         * editor does not have to wait for the network/cache operation.
         */
        form.reset({
          channelId,
          content: "",
        });

        upload.clear();
        setEditorKey((k) => k + 1);

        /*
         * Stop any currently running messages query from overwriting
         * our optimistic update.
         */
        await queryClient.cancelQueries({
          queryKey: ["message.list", channelId],
        });

        const tempId = `optimistic-${crypto.randomUUID()}`;

        const optimisticMessage: Message = {
          id: tempId,
          content: data.content,
          imageUrl: data.imageUrl ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: user.id,
          deletedAt: null,
          authorEmail: user.email!,
          authorName: user.given_name ?? "Ukanna Raymond",
          authorAvatar: getAvatar(user.picture, user.email!),
          channelId,
          threadId: data.threadId ?? null,
        };

        /*
         * Add the optimistic message to the cache immediately.
         */
        queryClient.setQueryData<InfiniteMessages>(
          ["message.list", channelId],
          (old) => {
            if (!old) {
              return {
                pages: [
                  {
                    items: [optimisticMessage],
                    nextCursor: undefined,
                  },
                ],
                pageParams: [undefined],
              };
            }

            const firstPage = old.pages[0] ?? {
              items: [],
              nextCursor: undefined,
            };

            const updatedFirstPage: MessagePage = {
              ...firstPage,
              items: [optimisticMessage, ...firstPage.items],
            };

            return {
              ...old,
              pages: [updatedFirstPage, ...old.pages.slice(1)],
            };
          },
        );

        /*
         * Return everything required to rollback if the request fails.
         */
        return {
          previousMessages,
          tempId,
          previousContent,
          previousImageUrl,
        };
      },

      /*
       * The server accepted the message.
       *
       * Replace the temporary optimistic message with the real
       * message returned by the server.
       */
      onSuccess: (data, _variables, context) => {
        queryClient.setQueryData<InfiniteMessages>(
          ["message.list", channelId],
          (old) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                items: page.items.map((message) =>
                  message.id === context.tempId ? data : message,
                ),
              })),
            };
          },
        );

        send({
          type: "message:created",
          payload: { message: data },
        });

        toast.success("Message sent");
      },

      /*
       * The server rejected the message or the request failed.
       *
       * Restore both:
       * 1. The message list
       * 2. The content the user typed
       */
      onError: (_error, _variables, context) => {
        if (!context) {
          toast.error("Failed to create message");
          return;
        }

        /*
         * Restore the message cache.
         */
        if (context.previousMessages) {
          queryClient.setQueryData<InfiniteMessages>(
            ["message.list", channelId],
            context.previousMessages,
          );
        }

        /*
         * Restore the user's text.
         */
        form.reset({
          channelId,
          content: context.previousContent,
        });

        /*
         * Remount the editor so Tiptap receives the restored content.
         */
        setEditorKey((k) => k + 1);

        /*
         * Restore the uploaded image if there was one.
         */
        if (context.previousImageUrl) {
          upload.onUploaded(context.previousImageUrl);
        }

        toast.error("Failed to create message");
      },

      /*
       * Always synchronize the local cache with the server.
       */
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["message.list", channelId],
        });
      },
    }),
  );

  function onSubmit(values: CreateMessageSchemaType) {
    /*
     * Don't submit an empty editor.
     */
    if (!values.content || values.content === '""') {
      return;
    }

    try {
      const content = JSON.parse(values.content);

      /*
       * Make sure the stored content is actually a Tiptap document.
       */
      if (content?.type !== "doc") {
        return;
      }

      /*
       * Check whether the document contains actual text.
       */
      const hasText = content.content?.some((node: TiptapNode) =>
        node.content?.some(
          (child: TiptapNode) =>
            typeof child.text === "string" && child.text.trim().length > 0,
        ),
      );

      /*
       * Allow image-only messages, but don't allow completely
       * empty messages.
       */
      if (!hasText && !upload.stageUrl) {
        return;
      }
    } catch {
      return;
    }

    createMessageMutation.mutate({
      ...values,
      imageUrl: upload.stageUrl ?? undefined,
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <Controller
            name="content"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <MessageComposer
                  key={editorKey}
                  value={field.value}
                  onChange={field.onChange}
                  onSubmit={() => onSubmit(form.getValues())}
                  isSubmitting={createMessageMutation.isPending}
                  upload={upload}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </>
            )}
          />
        </Field>
      </FieldGroup>
    </form>
  );
}
