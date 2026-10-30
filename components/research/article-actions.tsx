'use client';

import { useState } from 'react';
import { Check, Copy, Link2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Low-frequency article actions (design-system §6.12). Both actions accelerate
 * something also reachable by navigation — the link is the page URL and the
 * citation is printed in the footer — so the menu is never the only route.
 */
export function ArticleActions({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 2400);
    } catch {
      setCopied('unavailable');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm">
            <Link2 aria-hidden="true" />
            Article actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={() => void copy('link', `${window.location.origin}${path}`)}>
            <Copy aria-hidden="true" className="size-4 text-text-tertiary" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() =>
              void copy('citation', `Yishun River Trading — “${title}”. ${window.location.origin}${path}`)
            }
          >
            <Copy aria-hidden="true" className="size-4 text-text-tertiary" />
            Copy citation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <p aria-live="polite" className="font-mono text-caption text-text-tertiary">
        {copied === 'link'
          ? 'Link copied to clipboard.'
          : copied === 'citation'
            ? 'Citation copied to clipboard.'
            : copied === 'unavailable'
              ? 'Clipboard unavailable — copy the URL from the address bar.'
              : ''}
      </p>
      {copied === 'link' || copied === 'citation' ? <Check aria-hidden="true" className="size-4 text-accent" /> : null}
    </div>
  );
}
