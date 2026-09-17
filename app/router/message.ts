import z from "zod";
import { standardSecurityMiddleware } from "../middlewares/arcjet/standard";
import { writeSecurityMiddleware } from "../middlewares/arcjet/write";
import { reactionSecurityMiddleware } from "../middlewares/arcjet/reaction";
import { requiredAuthMiddleware } from "../middlewares/auth";
import { base } from "../middlewares/base";
import { requiredWorkspaceMiddleware } from "../middlewares/workspace";
import { prisma } from "@/lib/db";
import {
  createMessageSchema,
  GroupedReactionSchemaType,
  ReactionDeltaSchema,
  toggleReactionSchema,
  updateMessageSchema,
} from "../schemas/message";
import { getAvatar } from "@/lib/get-avatar";
import { readSecurityMiddleware } from "../middlewares/arcjet/read";
import { MessageListItem } from "@/lib/types";

interface TiptapNode {
  type?: string;
  text?: string;
  content?: TiptapNode[];
}

function groupReactions(
  reactions: { emoji: string; userId: string }[],
  userId: string,
): GroupedReactionSchemaType[] {
  const reactionMap = new Map<
    string,
    { count: number; reactedByMe: boolean }
  >();

  for (const reaction of reactions) {
    const existing = reactionMap.get(reaction.emoji);

    if (existing) {
      existing.count++;
      if (reaction.userId === userId) {
        existing.reactedByMe = true;
      }
    } else {
      reactionMap.set(reaction.emoji, {
        count: 1,
        reactedByMe: reaction.userId === userId,
      });
    }
  }
  return Array.from(reactionMap.entries()).map(([emoji, data]) => ({
    emoji,
    count: data.count,
    reactedByMe: data.reactedByMe,
  }));
}

async function getMessageWithRealtimeData(
  messageId: string,
  userId: string,
): Promise<MessageListItem | null> {
  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
    },
    include: {
      MessageReaction: {
        select: {
          emoji: true,
          userId: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });

  if (!message) {
    return null;
  }

  return {
    id: message.id,
    content: message.content,
    imageUrl: message.imageUrl,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    deletedAt: message.deletedAt,
    authorId: message.authorId,
    authorAvatar: message.authorAvatar,
    authorEmail: message.authorEmail,
    authorName: message.authorName,
    channelId: message.channelId,
    threadId: message.threadId,
    replyCount: message._count.replies,
    reactions: groupReactions(
      message.MessageReaction.map((reaction) => ({
        emoji: reaction.emoji,
        userId: reaction.userId,
      })),
      userId,
    ),
  };
}

export const createMessage = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(writeSecurityMiddleware)
  .route({
    method: "POST",
    path: "/messages",
    summary: "Create a message",
    tags: ["Messages"],
  })
  .input(createMessageSchema)
  .output(z.custom<MessageListItem>())
  .handler(async ({ input, context, errors }) => {
    // Verify the channel belongs to the user's organization

    const channel = await prisma.channel.findFirst({
      where: {
        id: input.channelId,
        workspaceId: context.workspace.orgCode,
      },
    });

    if (!channel) {
      throw errors.FORBIDDEN();
    }

    // If this is a thread reply, validate the parent message
    if (input.threadId) {
      const parentMessage = await prisma.message.findFirst({
        where: {
          id: input.threadId,
          Channel: {
            workspaceId: context.workspace.orgCode,
          },
        },
      });

      if (
        !parentMessage ||
        parentMessage.channelId !== input.channelId ||
        parentMessage.threadId !== null
      ) {
        throw errors.BAD_REQUEST();
      }
    }
    const created = await prisma.message.create({
      data: {
        content: input.content,
        imageUrl: input.imageUrl,
        channelId: input.channelId,
        authorId: context.user.id,
        authorEmail: context.user.email!,
        authorName: context.user.given_name ?? "John Doe",
        authorAvatar: getAvatar(context.user.picture, context.user.email!),
        threadId: input.threadId,
      },
    });

    const realtimeMessage = await getMessageWithRealtimeData(
      created.id,
      context.user.id,
    );

    if (!realtimeMessage) {
      throw errors.NOT_FOUND();
    }

    return realtimeMessage;
  });

export const listMessages = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(readSecurityMiddleware)
  .route({
    method: "GET",
    path: "/messages",
    summary: "List all messages",
    tags: ["Messages"],
  })
  .input(
    z.object({
      channelId: z.string(),
      limit: z.number().min(1).max(100).optional(),
      cursor: z.string().optional(),
    }),
  )
  .output(
    z.object({
      items: z.array(z.custom<MessageListItem>()),
      nextCursor: z.string().optional(),
    }),
  )
  .handler(async ({ input, context, errors }) => {
    const channel = await prisma.channel.findFirst({
      where: {
        id: input.channelId,
        workspaceId: context.workspace.orgCode,
      },
    });

    if (!channel) {
      throw errors.FORBIDDEN();
    }

    const limit = input.limit ?? 30;

    const messages = await prisma.message.findMany({
      where: {
        channelId: input.channelId,
        threadId: null,
      },
      ...(input.cursor
        ? {
            cursor: { id: input.cursor },
            skip: 1,
          }
        : {}),
      take: limit,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        _count: { select: { replies: true } },
        MessageReaction: {
          select: {
            emoji: true,
            userId: true,
          },
        },
      },
    });

    const items: MessageListItem[] = messages.map((m) => ({
      id: m.id,
      content: m.content,
      imageUrl: m.imageUrl,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      deletedAt: m.deletedAt,
      authorId: m.authorId,
      authorAvatar: m.authorAvatar,
      authorEmail: m.authorEmail,
      authorName: m.authorName,
      channelId: m.channelId,
      threadId: m.threadId,
      replyCount: m._count.replies,
      reactions: groupReactions(
        m.MessageReaction.map((r) => ({
          emoji: r.emoji,
          userId: r.userId,
        })),
        context.user.id,
      ),
    }));

    const nextCursor =
      messages.length === limit ? messages[messages.length - 1].id : undefined;

    return {
      items: items,
      nextCursor,
    };
  });

export const updateMessage = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(writeSecurityMiddleware)
  .route({
    method: "PUT",
    path: "/messages/:messageId",
    summary: "Update a message",
    tags: ["Messages"],
  })
  .input(updateMessageSchema)
  .output(
    z.object({
      message: z.custom<MessageListItem>(),
      canEdit: z.boolean(),
    }),
  )
  .handler(async ({ input, context, errors }) => {
    const message = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!message) {
      throw errors.NOT_FOUND();
    }

    if (message.authorId !== context.user.id) {
      throw errors.FORBIDDEN();
    }

    // NEW: check whether the edited content contains text
    let hasText = false;

    try {
      const content = JSON.parse(input.content);

      hasText =
        content.content?.some((node: TiptapNode) =>
          node.content?.some(
            (child: TiptapNode) =>
              typeof child.text === "string" && child.text.trim().length > 0,
          ),
        ) ?? false;
    } catch {
      throw errors.BAD_REQUEST();
    }

    // CHANGED: normal edit vs deleted message
    const updated = await prisma.message.update({
      where: {
        id: input.messageId,
      },
      data: hasText
        ? {
            content: input.content,
            deletedAt: null,
          }
        : {
            deletedAt: new Date(),
          },
    });

    const realtimeMessage = await getMessageWithRealtimeData(
      updated.id,
      context.user.id,
    );

    if (!realtimeMessage) {
      throw errors.NOT_FOUND();
    }

    return {
      message: realtimeMessage,
      canEdit: realtimeMessage.authorId === context.user.id,
    };
  });

export const listThreadReplies = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(readSecurityMiddleware)
  .route({
    method: "GET",
    path: "/messages/:messageId/thread",
    summary: "List replies in a thread",
    tags: ["messages"],
  })
  .input(
    z.object({
      messageId: z.string(),
    }),
  )
  .output(
    z.object({
      parent: z.custom<MessageListItem>(),
      messages: z.array(z.custom<MessageListItem>()),
    }),
  )
  .handler(async ({ input, context, errors }) => {
    const parentRow = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      include: {
        _count: {
          select: {
            replies: true,
          },
        },
        MessageReaction: {
          select: {
            emoji: true,
            userId: true,
          },
        },
      },
    });

    if (!parentRow) {
      throw errors.NOT_FOUND();
    }

    // Fetch all messages with replies

    const messagesQuery = await prisma.message.findMany({
      where: {
        threadId: input.messageId,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      include: {
        _count: {
          select: {
            replies: true,
          },
        },
        MessageReaction: {
          select: {
            emoji: true,
            userId: true,
          },
        },
      },
    });

    const parent: MessageListItem = {
      id: parentRow.id,
      content: parentRow.content,
      imageUrl: parentRow.imageUrl,
      authorAvatar: parentRow.authorAvatar,
      authorEmail: parentRow.authorEmail,
      authorName: parentRow.authorName,
      authorId: parentRow.authorId,
      channelId: parentRow.channelId,
      createdAt: parentRow.createdAt,
      updatedAt: parentRow.updatedAt,
      threadId: parentRow.threadId,
      deletedAt: parentRow.deletedAt,
      replyCount: parentRow._count.replies,
      reactions: groupReactions(
        parentRow.MessageReaction.map((r) => ({
          emoji: r.emoji,
          userId: r.userId,
        })),
        context.user.id,
      ),
    };
    const messages: MessageListItem[] = messagesQuery.map((m) => ({
      id: m.id,
      content: m.content,
      imageUrl: m.imageUrl,
      authorAvatar: m.authorAvatar,
      authorEmail: m.authorEmail,
      authorName: m.authorName,
      authorId: m.authorId,
      channelId: m.channelId,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      deletedAt: m.deletedAt,
      threadId: m.threadId,
      replyCount: m._count.replies,
      reactions: groupReactions(
        m.MessageReaction.map((r) => ({
          emoji: r.emoji,
          userId: r.userId,
        })),
        context.user.id,
      ),
    }));

    return {
      parent,
      messages,
    };
  });

export const toggleReaction = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(reactionSecurityMiddleware)
  .route({
    method: "POST",
    path: "/messages/:messageId/reactions",
    summary: "Toggle a reaction",
    tags: ["Messages"],
  })
  .input(toggleReactionSchema)
  .output(ReactionDeltaSchema)
  .handler(async ({ input, context, errors }) => {
    const messages = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      select: {
        id: true,
      },
    });

    if (!messages) {
      throw errors.NOT_FOUND();
    }

    const inserted = await prisma.messageReaction.createMany({
      data: [
        {
          emoji: input.emoji,
          messageId: input.messageId,
          userId: context.user.id,
          userName: context.user.given_name ?? "Ukanna Raymond",
          userAvatar: getAvatar(context.user.picture, context.user.email!),
          userEmail: context.user.email!,
        },
      ],
      skipDuplicates: true,
    });

    let added = true;

    if (inserted.count === 0) {
      await prisma.messageReaction.deleteMany({
        where: {
          messageId: input.messageId,
          userId: context.user.id,
          emoji: input.emoji,
        },
      });
      added = false;
    }

    // Report only WHAT changed — who, which emoji, added or removed.
    // Each client (including everyone else's browser) derives its own
    // count and reactedByMe from this, so no client's screen gets
    // stamped with the toggling user's own reactedByMe value.
    return {
      messageId: input.messageId,
      emoji: input.emoji,
      userId: context.user.id,
      added,
    };
  });
