import z from "zod";

export const createMessageSchema = z.object({
  channelId: z.string(),
  content: z.string(),
  imageUrl: z.url().optional(),
  threadId: z.string().optional(),
});

export const updateMessageSchema = z.object({
  messageId: z.string(),
  content: z.string(),
});

export const toggleReactionSchema = z.object({
  messageId: z.string(),
  emoji: z.string().min(1),
});

export const GroupedReactionSchema = z.object({
  emoji: z.string(),
  count: z.number(),
  reactedByMe: z.boolean(),
});

// A viewer-agnostic fact: "this user added/removed this emoji". Safe to
// broadcast to everyone, since nothing in it depends on who's looking.
export const ReactionDeltaSchema = z.object({
  messageId: z.string(),
  emoji: z.string(),
  userId: z.string(),
  added: z.boolean(),
});

export type CreateMessageSchemaType = z.infer<typeof createMessageSchema>;
export type UpdateMessageSchemaType = z.infer<typeof updateMessageSchema>;
export type GroupedReactionSchemaType = z.infer<typeof GroupedReactionSchema>;
export type ReactionDeltaSchemaType = z.infer<typeof ReactionDeltaSchema>;
