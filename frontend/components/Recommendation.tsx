import { parseMarkdown, renderInline, type MarkdownBlock } from "@/lib/markdown";

export default function Recommendation({ content }: { content: string }) {
  const blocks = parseMarkdown(content);
  const overview = blocks.find(
    (block): block is Extract<MarkdownBlock, { type: "heading" }> =>
      block.type === "heading" && block.level === 1
  );

  const cards: Array<{ title: string; blocks: MarkdownBlock[] }> = [];
  let currentCard: { title: string; blocks: MarkdownBlock[] } | null = null;

  for (const block of blocks) {
    if (block.type === "heading" && block.level === 1) {
      continue;
    }
    if (block.type === "heading" && block.level === 2) {
      currentCard = { title: block.text, blocks: [] };
      cards.push(currentCard);
    } else if (currentCard) {
      currentCard.blocks.push(block);
    }
  }

  return (
    <div className="recommendation">
      <h3>AI Recommendation</h3>
      {overview && (
        <p className="recommendation-overview">{renderInline(overview.text)}</p>
      )}
      <div className="recommendation-cards">
        {cards.map((card, cardIndex) => (
          <article className="recommendation-card" key={`${card.title}-${cardIndex}`}>
            <h4>{renderInline(card.title)}</h4>
            {card.blocks.map((block, index) => {
              if (block.type === "heading") {
                return <h5 key={index}>{renderInline(block.text)}</h5>;
              }
              if (block.type === "list") {
                return (
                  <ul key={index}>
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{renderInline(item)}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={index}>{renderInline(block.text)}</p>;
            })}
          </article>
        ))}
      </div>
    </div>
  );
}
