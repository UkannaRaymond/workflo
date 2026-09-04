import z from "zod";

export const inviteMemberSchema = z.object({
  name: z
    .string()
    .min(3, "Name is required")
    .max(60, "Name must be less than 60 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .max(100, "Email must be less than 100 characters"),
});

export type InviteMemberSchemaType = z.infer<typeof inviteMemberSchema>;
