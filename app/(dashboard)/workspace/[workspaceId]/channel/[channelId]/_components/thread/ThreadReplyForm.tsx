"use client";

import {
  createMessageSchema,
  CreateMessageSchemaType,
} from "@/app/schemas/message";
import { Field } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { MessageComposer } from "../message/MessageComposer";
import { useAttachmentUpload } from "@/hooks/use-attachment-upload";
import { useEffect, useState } from "react";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { Message } from "@/lib/generated/prisma/client";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getAvatar } from "@/lib/get-avatar";
import { MessageListItem } from "@/lib/types";
import { m } from "motion/react";

interface ThreadReplyFormProps {
  threadId: string;
  user: KindeUser<Record<string, unknown>>;
}

export function ThreadReplyForm({ threadId, user }: ThreadReplyFormProps) {
  const { channelId } = useParams<{ channelId: string }>();
  const queryClient = useQueryClient();

  const upload = useAttachmentUpload();
  const [editorKey, setEditorKey] = useState(0);

  const form = useForm({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      content: "",
      channelId: channelId,
      threadId: threadId,
    },
  });

  useEffect(() => {
    form.setValue("threadId", threadId);
  }, [threadId, form]);

  const createMessageMutation = useMutation(
    orpc.message.create.mutationOptions({
      onMutate: async (data) => {
        const listOptions = orpc.message.thread.list.queryOptions({
          input: {
            messageId: threadId,
          },
        });

        type MessagePageType = {
          items: Array<MessageListItem>;
          nextCursor?: string;
        };

        type InfiniteMessagesType = InfiniteData<MessagePageType>;

        await queryClient.cancelQueries({ queryKey: listOptions.queryKey });

        const previous = queryClient.getQueryData(listOptions.queryKey);
        const optimistic: Message = {
          id: `optimistic:${crypto.randomUUID()}`,
          content: data.content,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: user.id,
          authorEmail: user.email!,
          authorName: user.given_name ?? "Ukanna Raymond",
          authorAvatar: getAvatar(user.picture, user.email!),
          channelId: data.channelId,
          threadId: data.threadId!,
          imageUrl: data.imageUrl ?? null,
          deletedAt: null,
        };

        queryClient.setQueryData(listOptions.queryKey, (old) => {
          if (!old) return old;

          return {
            ...old,
            messages: [...old.messages, optimistic],
          };
        });

        //Optimistically bump repliesCount in main messageList for the parent message
        queryClient.setQueryData<InfiniteMessagesType>(
          ["message.list", channelId],
          (old) => {
            if (!old) return old;

            const pages = old.pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m.id === threadId
                  ? { ...m, repliesCount: m.repliesCount + 1 }
                  : m,
              ),
            }));

            return { ...old, pages };
          },
        );
        return {
          listOptions,
          previous,
        };
      },
      onSuccess: (_data, _vars, ctx) => {
        queryClient.invalidateQueries({ queryKey: ctx.listOptions.queryKey });

        form.reset({ channelId, content: "", threadId });
        upload.clear();
        setEditorKey((k) => k + 1);
        return toast.success("Message sent");
      },
      onError: (_err, _vars, ctx) => {
        if (!ctx) return;

        const { listOptions, previous } = ctx;
        if (!previous) {
          queryClient.setQueryData(listOptions.queryKey, previous);
        }
        return toast.error("Something went wrong");
      },
    }),
  );

  function onSubmit(data: CreateMessageSchemaType) {
    createMessageMutation.mutate({
      ...data,
      imageUrl: upload.stageUrl ?? undefined,
    });
  }
  return (
    <Field onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        name="content"
        control={form.control}
        render={({ field }) => (
          <MessageComposer
            value={field.value}
            onChange={field.onChange}
            upload={upload}
            key={editorKey}
            onSubmit={() => onSubmit(form.getValues())}
            isSubmitting={createMessageMutation.isPending}
          />
        )}
      />
    </Field>
  );
}
