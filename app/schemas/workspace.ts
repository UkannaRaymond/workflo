import { z } from "zod";

export const workspaceSchema = z.object({
  name: z
    .string()
    .min(2, "Workspace name must be at least 2 characters long.")
    .max(50, "Workspace name must be less than 50 characters long."),
});

export type WorkspaceSchemaType = z.infer<typeof workspaceSchema>;
