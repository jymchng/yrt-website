import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Tailwind v4 @theme font-size tokens use `text-*` names. tailwind-merge
// otherwise classifies unknown `text-small`/`text-body-sm` utilities as colours
// and removes a preceding text-colour utility (e.g. button label contrast).
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-display',
        'text-h1',
        'text-h2',
        'text-h3',
        'text-h4',
        'text-lead',
        'text-body',
        'text-body-sm',
        'text-small',
        'text-caption',
        'text-eyebrow',
        'text-data-xl',
        'text-data',
        'text-code',
      ],
    },
  },
});

/**
 * Compose class names, letting later Tailwind utilities win over earlier ones.
 * Vendored shadcn/ui sources are written against `cn()`; the token names they
 * pass are translated to this project's vocabulary (see docs/architecture.md).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
