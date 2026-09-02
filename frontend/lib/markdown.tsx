import React from "react";

export type MarkdownBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "paragraph"; text: string };

/**
 * Parses Markdown syntax into structured blocks (headings, lists, paragraphs).
 */
export function parseMarkdown(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let currentList: { items: string[]; ordered: boolean } | null = null;

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      currentList = null;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      currentList = null;
      blocks.push({
        type: "heading",
        level: heading[1].length,
        text: heading[2],
      });
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      if (!currentList || currentList.ordered) {
        const items: string[] = [];
        currentList = { items, ordered: false };
        blocks.push({ type: "list", items, ordered: false });
      }
      currentList.items.push(bullet[1]);
      continue;
    }

    const numbered = line.match(/^\d+\.\s+(.*)$/);
    if (numbered) {
      if (!currentList || !currentList.ordered) {
        const items: string[] = [];
        currentList = { items, ordered: true };
        blocks.push({ type: "list", items, ordered: true });
      }
      currentList.items.push(numbered[1]);
      continue;
    }

    currentList = null;
    blocks.push({ type: "paragraph", text: line });
  }

  return blocks;
}

/**
 * Turns inline Markdown syntax (**bold**, *italic*, <u>underline</u>, `code`) into formatted React nodes.
 */
export function renderInline(text: string): React.ReactNode[] {
  const parts = text
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|<u>.*?<\/u>|`[^`]+`)/g)
    .filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold !text-[#f4dc4d]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (
      (part.startsWith("*") && part.endsWith("*")) ||
      (part.startsWith("_") && part.endsWith("_"))
    ) {
      return (
        <em key={index} className="italic !text-yellow-100 opacity-95">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("<u>") && part.endsWith("</u>")) {
      return (
        <u key={index} className="underline !text-yellow-200">
          {part.slice(3, -4)}
        </u>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="bg-black/40 px-1 py-0.5 rounded text-xs font-mono !text-yellow-200"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={index} className="!text-emerald-50">{part}</span>;
  });
}

/**
 * FormattedMarkdown Component for AI Assistant Chat Bubbles & Recommendation Cards.
 * Ensures all text elements render bright and readable against dark green backgrounds.
 */
export function FormattedMarkdown({ content }: { content: string }) {
  const blocks = parseMarkdown(content);

  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed font-medium !text-emerald-50">
      {blocks.map((block, idx) => {
        if (block.type === "heading") {
          if (block.level === 1) {
            return (
              <h1
                key={idx}
                className="text-lg sm:text-xl font-extrabold mt-4 mb-2 !text-[#f4dc4d] border-b border-white/20 pb-1"
              >
                {renderInline(block.text)}
              </h1>
            );
          }
          if (block.level === 2) {
            return (
              <h2
                key={idx}
                className="text-base sm:text-lg font-bold mt-3 mb-1.5 !text-[#f4dc4d]"
              >
                {renderInline(block.text)}
              </h2>
            );
          }
          return (
            <h3
              key={idx}
              className="text-sm sm:text-base font-bold mt-2.5 mb-1 !text-yellow-200"
            >
              {renderInline(block.text)}
            </h3>
          );
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag
              key={idx}
              className={`my-1.5 space-y-1 !text-emerald-50 ${
                block.ordered ? "list-decimal pl-5" : "list-disc pl-5"
              }`}
            >
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="!text-emerald-50">
                  {renderInline(item)}
                </li>
              ))}
            </ListTag>
          );
        }

        return (
          <p key={idx} className="my-1.5 !text-emerald-50">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}
