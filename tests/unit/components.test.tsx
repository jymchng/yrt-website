import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

/** next/link needs an App Router context; the stub keeps these unit tests about
 * one component at a time. The real link behaviour is covered by Playwright. */
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const { Badge } = await import('@/components/ui/badge');
const { Button } = await import('@/components/ui/button');
const { EmptyState } = await import('@/components/shared/empty-state');
const { Formula } = await import('@/components/shared/formula');
const { Eyebrow, PageIntro, Prose } = await import('@/components/shared/primitives');

describe('Eyebrow', () => {
  it('is a paragraph, never a heading', () => {
    const { container } = render(<Eyebrow>Simulated \u00b7 Illustrative</Eyebrow>);
    const element = container.firstElementChild;
    expect(element?.tagName).toBe('P');
    expect(screen.queryByRole('heading')).toBeNull();
  });
});

describe('Prose', () => {
  it('caps the measure at the documented widths', () => {
    const { container: body } = render(<Prose>text</Prose>);
    expect(body.innerHTML).toContain('max-w-[72ch]');

    const { container: lead } = render(<Prose measure="lead">text</Prose>);
    expect(lead.innerHTML).toContain('max-w-[60ch]');
  });
});

describe('PageIntro', () => {
  it('renders exactly one h1 per page', () => {
    render(<PageIntro eyebrow="Research" title="The research archive" lead="Notes, experiments and dead ends." />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('The research archive');
  });
});

describe('Badge', () => {
  it('is a span carrying a word, not a control', () => {
    render(<Badge variant="illustrative">Illustrative</Badge>);
    const badge = screen.getByText('Illustrative');
    expect(badge.tagName).toBe('SPAN');
    expect(badge.className).toContain('text-info-text');
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('Button', () => {
  it('retains the primary ink colour alongside custom font-size tokens', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { unmount } = render(
        <Button variant="primary" size={size}>
          Continue
        </Button>,
      );
      expect(screen.getByRole('button').className).toContain('text-accent-ink');
      unmount();
    }
  });
});

describe('EmptyState', () => {
  it('offers exactly one recovery action with descriptive text', () => {
    render(
      <EmptyState
        headline="No matching entries"
        body="Nothing in the archive matches that combination."
        actionHref="/research"
        actionLabel="Clear filters"
      />,
    );

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '/research');
    expect(links[0]).toHaveTextContent('Clear filters');
  });
});

describe('Formula', () => {
  it('renders its parts and a figcaption gloss as the text alternative', () => {
    render(
      <Formula
        spec={{
          parts: [
            { role: 'var', text: 'z' },
            { role: 'op', text: ' = (' },
            { role: 'var', text: 's' },
            { role: 'op', text: ' \u2212 ' },
            { role: 'var', text: '\u03bc' },
            { role: 'op', text: ') / ' },
            { role: 'var', text: '\u03c3' },
            { role: 'sub', text: 't' },
          ],
          gloss: 'The spread is standardised by its own mean and standard deviation.',
        }}
      />,
    );

    expect(screen.getByText(/standardised by its own mean/)).toBeInTheDocument();
    expect(screen.getByText(/\u03bc/)).toBeInTheDocument();
    const subscript = document.querySelector('sub');
    expect(subscript?.textContent).toBe('t');
  });
});
