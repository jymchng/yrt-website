export type ResearchCategory =
  | 'Market Microstructure'
  | 'Statistical Arbitrage'
  | 'Portfolio Optimisation'
  | 'Algorithmic Execution'
  | 'Time-Series Analysis'
  | 'Financial Machine Learning';

export type ResearchKind = 'Article' | 'Technical note' | 'Mathematical exploration' | 'Market observation' | 'Experiment';

/**
 * Article bodies are typed blocks, never HTML: there is no
 * `dangerouslySetInnerHTML` anywhere in this project (implementation guide §11).
 */
export type ResearchBlock =
  | { readonly type: 'p'; readonly text: string }
  | { readonly type: 'h2'; readonly text: string }
  | { readonly type: 'h3'; readonly text: string }
  | { readonly type: 'quote'; readonly text: string }
  | { readonly type: 'list'; readonly items: readonly string[] }
  | { readonly type: 'code'; readonly language: string; readonly code: string };

export type ResearchReference = {
  readonly label: string;
  readonly href?: string;
};

export type ResearchEntry = {
  readonly slug: string;
  readonly title: string;
  readonly category: ResearchCategory;
  readonly kind: ResearchKind;
  /** ISO date, fixed in the content module — never derived from the clock. */
  readonly date: string;
  readonly readMinutes: number;
  readonly summary: string;
  /** Every entry on this site is illustrative; the flag drives the badge. */
  readonly illustrative: boolean;
  readonly body: readonly ResearchBlock[];
  readonly takeaways: readonly string[];
  readonly references: readonly ResearchReference[];
};
