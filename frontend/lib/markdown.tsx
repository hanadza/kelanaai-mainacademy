export type MarkdownBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string };

/**
 * Amazon Bedrock is asked for Markdown (# / ## headers, - bullets,
 * **bold**). This tiny parser is intentionally forgiving so real-world
 * output always renders as clean UI - no react-markdown dependency needed.
 */
export function parseMarkdown(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let currentList: string[] | null = null;

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      currentList = null;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      currentList = null;
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      if (!currentList) {
        currentList = [];
        blocks.push({ type: "list", items: currentList });
      }
      currentList.push(bullet[1]);
      continue;
    }

    currentList = null;
    blocks.push({ type: "paragraph", text: line });
  }

  return blocks;
}

// Turns "**bold**" segments into <strong> without a Markdown library.
export function renderInline(text: string) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, index) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={index}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={index}>{part}</span>
      )
    );
}
