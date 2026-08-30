"use client";

import {
  createMessageSchema,
  CreateMessageSchemaType,
} from "@/app/schemas/message";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { MessageComposer } from "./MessageComposer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";

interface IAppProps {
  channelId: string;
}

export function MessageInputForm({ channelId }: IAppProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof createMessageSchema>>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      channelId,
      content: "",
    },
  });

  const createMessageMutation = useMutation(
    orpc.message.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.message.list.key(),
        });
        return toast.success("message created successfully");
      },
      onError: () => {
        return toast.error("something went wrong");
      },
    }),
  );

  const onSubmit = (values: CreateMessageSchemaType) => {
    createMessageMutation.mutate(values);
  };

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
                  value={field.value}
                  onChange={field.onChange}
                  onSubmit={() => onSubmit(form.getValues())}
                  isSubmitting={createMessageMutation.isPending}
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
