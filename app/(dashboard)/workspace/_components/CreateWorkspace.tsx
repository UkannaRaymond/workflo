"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { z } from "zod";
import { workspaceSchema, WorkspaceSchemaType } from "@/app/schemas/workspace";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";

export function CreateWorkspace() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof workspaceSchema>>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  const createWorkspaceMutation = useMutation(
    orpc.workspace.create.mutationOptions({
      onSuccess: (newWorkspace) => {
        toast.success(
          `Workspace ${newWorkspace.workspaceName} created successfully`,
        );

        queryClient.invalidateQueries({
          queryKey: orpc.workspace.list.queryKey(),
        });

        form.reset();
        setOpen(false);
      },
      onError: () => {
        toast.error("Failed to create workspace, try again!");
      },
    }),
  );

  function onSubmit(values: WorkspaceSchemaType) {
    createWorkspaceMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-12 rounded-xl border-2 border-dashed
                border-muted-foreground/50 text-muted-foreground
                hover:border-muted-foreground hover:text-foreground hover:rounded-lg
                transition-all duration-200"
              >
                <Plus className="size-5" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Create Workspace</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>
            Start a new workspace to organize your projects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="name">Name</FieldLabel>

            <Input
              id="name"
              placeholder="My Workspace"
              {...form.register("name")}
            />

            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>

          <Button disabled={createWorkspaceMutation.isPending} type="submit">
            {createWorkspaceMutation.isPending
              ? "Creating..."
              : "Create Workspace"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
