import { baseExtension } from "@/components/rich-text-editor/extensions";
import { renderToMarkdown } from "@tiptap/static-renderer/pm/markdown";

function normalizeWhiteSpace(markdown: string) {
  return markdown
    .replace(/\s+$/gm, "") // trim trailing spaces per line
    .replace(/\n{3,}/g, "\n\n") //collapse >2 blank lines
    .trim();
}

export async function tipTapJsonToMarkdown(json: string) {
  // Parse json
  let content;
  try {
    content = JSON.parse(json);
  } catch {
    return "";
  }

  const markdown = renderToMarkdown({
    extensions: baseExtension,
    content: content,
  });
  return normalizeWhiteSpace(markdown);
}
