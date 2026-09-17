import { GroupedReactionSchemaType } from "@/app/schemas/message";

/**
 * Applies a single reaction delta (one user added/removed one emoji) to a
 * viewer's own cached reactions array, computing `count` and `reactedByMe`
 * relative to `viewerId` — never relative to whoever triggered the toggle.
 */
export function applyReactionDelta(
  reactions: GroupedReactionSchemaType[],
  emoji: string,
  userId: string,
  added: boolean,
  viewerId?: string,
): GroupedReactionSchemaType[] {
  const idx = reactions.findIndex((r) => r.emoji === emoji);
  const isViewer = userId === viewerId;

  if (added) {
    if (idx === -1) {
      return [...reactions, { emoji, count: 1, reactedByMe: isViewer }];
    }
    return reactions.map((r, i) =>
      i === idx
        ? { ...r, count: r.count + 1, reactedByMe: r.reactedByMe || isViewer }
        : r,
    );
  }

  if (idx === -1) return reactions;

  const dec = reactions[idx].count - 1;

  if (dec <= 0) {
    return reactions.filter((_, i) => i !== idx);
  }

  return reactions.map((r, i) =>
    i === idx
      ? { ...r, count: dec, reactedByMe: isViewer ? false : r.reactedByMe }
      : r,
  );
}
