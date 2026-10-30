import type { FormulaSpec } from '@/lib/content/strategies';
import { cn } from '@/lib/utils';

/**
 * Design-system §6.13: formulas are hand-built from HTML/CSS primitives — no
 * KaTeX, no MathML, no new dependency. Variables are primary text, operators
 * and brackets are tertiary, and the `<figcaption>` gloss is the mandatory
 * accessible text alternative.
 */
export function Formula({ spec, className }: { spec: FormulaSpec; className?: string }) {
  return (
    <figure className={cn('flex flex-col gap-3 rounded-md border border-border bg-surface-card p-5', className)}>
      <p className="overflow-hidden font-mono text-body text-text-primary">
        {spec.parts.map((part, index) => {
          if (part.role === 'op') {
            return (
              <span key={index} className="text-text-tertiary">
                {part.text}
              </span>
            );
          }
          if (part.role === 'sub') {
            return (
              <sub key={index} className="text-[0.72em] leading-0">
                {part.text}
              </sub>
            );
          }
          return (
            <span key={index} className={part.role === 'var' ? 'text-text-primary' : 'text-text-primary'}>
              {part.text}
            </span>
          );
        })}
      </p>
      <figcaption className="max-w-[60ch] font-mono text-caption text-text-tertiary">{spec.gloss}</figcaption>
    </figure>
  );
}
