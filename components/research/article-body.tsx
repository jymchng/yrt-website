import type { ResearchBlock } from '@/lib/content/types';

/**
 * Typed block renderer (design-system §14.1). No HTML strings and no
 * `dangerouslySetInnerHTML`: a content module can only produce these blocks.
 */
export function ArticleBody({ blocks }: { blocks: readonly ResearchBlock[] }) {
  return (
    <div className="flex max-w-[68ch] flex-col gap-4">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'p':
            return (
              <p key={index} className="text-body text-text-secondary">
                {block.text}
              </p>
            );
          case 'h2':
            return (
              <h2 key={index} className="mt-8 text-h2 text-text-primary">
                {block.text}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={index} className="mt-4 text-h3 text-text-primary">
                {block.text}
              </h3>
            );
          case 'quote':
            return (
              <blockquote key={index} className="border-l-2 border-accent pl-4 text-lead text-text-secondary">
                {block.text}
              </blockquote>
            );
          case 'list':
            return (
              <ul key={index} className="flex list-disc flex-col gap-2 pl-5 text-body text-text-secondary marker:text-text-tertiary">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case 'code':
            return (
              <pre
                key={index}
                tabIndex={0}
                aria-label={`Code block: ${block.language}`}
                className="overflow-x-auto rounded-md border border-border bg-surface-1 p-4 font-mono text-code text-text-primary"
              >
                <code>{block.code}</code>
              </pre>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
