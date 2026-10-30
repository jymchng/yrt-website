export type Capability = {
  readonly slug: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly points: readonly string[];
  readonly href: string;
  readonly linkLabel: string;
};

/** The four capability cards on the home page (brief §4.1). */
export const capabilities: readonly Capability[] = [
  {
    slug: 'quantitative-research',
    eyebrow: '01 / RESEARCH',
    title: 'Quantitative Research',
    description:
      'Statistical modelling, hypothesis testing and signal discovery: the discipline of deciding what is evidence before deciding what is a strategy.',
    points: ['Statistical modelling', 'Hypothesis testing', 'Signal discovery', 'Empirical market research'],
    href: '/research',
    linkLabel: 'Read the research',
  },
  {
    slug: 'algorithmic-trading',
    eyebrow: '02 / EXECUTION',
    title: 'Algorithmic Trading',
    description:
      'Automated execution and systematic strategy implementation, where every decision between a signal and a fill is measured rather than assumed.',
    points: ['Automated execution', 'Systematic strategies', 'Execution optimisation', 'Market connectivity'],
    href: '/strategies',
    linkLabel: 'See the strategies',
  },
  {
    slug: 'statistical-arbitrage',
    eyebrow: '03 / RELATIVE VALUE',
    title: 'Statistical Arbitrage',
    description:
      'Relative-value modelling and market-neutral research across instruments and venues, built on relationships that can be estimated and monitored.',
    points: ['Relative-value modelling', 'Market-neutral research', 'Cross-market analysis', 'Statistical relationships'],
    href: '/strategies',
    linkLabel: 'Strategy notes',
  },
  {
    slug: 'market-microstructure',
    eyebrow: '04 / MICROSTRUCTURE',
    title: 'Market Microstructure',
    description:
      'Order-book analytics, liquidity modelling and market-impact analysis — the study of how prices actually form once an order meets a queue.',
    points: ['Order-book analytics', 'Liquidity modelling', 'Market-impact analysis', 'Execution dynamics'],
    href: '/technology',
    linkLabel: 'How we build it',
  },
];

/** The six technology capabilities listed on the home page (brief §4.1). */
export const technologyStack: readonly { readonly name: string; readonly note: string }[] = [
  { name: 'Python', note: 'Research, statistics and experiment orchestration' },
  { name: 'Rust', note: 'Low-latency services where allocation is not acceptable' },
  { name: 'C++', note: 'Deterministic hot paths and market-data decoding' },
  { name: 'Machine Learning', note: 'Applied with leakage controls, not as a default' },
  { name: 'Distributed Computing', note: 'Backtests and parameter sweeps across a scheduler' },
  { name: 'High-Performance Data Processing', note: 'Columnar storage, zero-copy parsing, bounded memory' },
];

export type TechnologyArea = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly capabilities: readonly string[];
};

/** The seven capability areas of /technology (brief §4.4). */
export const technologyAreas: readonly TechnologyArea[] = [
  {
    slug: 'trading-infrastructure',
    title: 'Trading Infrastructure',
    description:
      'Service topology, process supervision and configuration discipline for systems whose failure mode is measured in basis points. Infrastructure is treated as part of the strategy, because it is.',
    capabilities: ['Service boundaries with explicit contracts', 'Supervised processes and health probes', 'Configuration as a reviewed artefact', 'Deterministic replay of recorded sessions'],
  },
  {
    slug: 'market-data-processing',
    title: 'Market Data Processing',
    description:
      'Ingest, normalise and validate market data so that every downstream statistic is computed from a known-quality feed. Gaps and reconnects are first-class events, never silent.',
    capabilities: ['Bounded-memory decoders', 'Sequence-gap detection', 'Clock discipline and event ordering', 'Normalisation to one internal schema'],
  },
  {
    slug: 'backtesting',
    title: 'Strategy Backtesting',
    description:
      'Event-driven simulation with an explicit fill model, an explicit cost model and an explicit statement of what the result does not include. A backtest is an argument, and it should show its assumptions.',
    capabilities: ['Event-driven replay of recorded data', 'Configurable fill and cost models', 'Walk-forward and purged splits', 'Reproducible by seed and configuration'],
  },
  {
    slug: 'execution-systems',
    title: 'Execution Systems',
    description:
      'Order construction, routing and state reconciliation, designed so that a partially filled or rejected order leaves the system in a state it can describe.',
    capabilities: ['Idempotent order state machines', 'Latency budgets per segment', 'Reconciliation against venue state', 'Explicit refusal paths'],
  },
  {
    slug: 'statistical-computing',
    title: 'Statistical Computing',
    description:
      'Estimators, resampling and inference implemented so that the uncertainty is part of the output. A number without an interval is treated as an unfinished result.',
    capabilities: ['Numerically stable estimation routines', 'Block bootstrap and permutation tests', 'Multiple-testing aware reporting', 'Intervals reported with every estimate'],
  },
  {
    slug: 'distributed-systems',
    title: 'Distributed Systems',
    description:
      'Work distribution for research workloads where throughput matters more than latency: parameter sweeps, cross-validation folds and data preparation, all reproducible from a manifest.',
    capabilities: ['Manifest-driven job submission', 'Deterministic partitioning of work', 'Failure isolation per shard', 'Result assembly with provenance'],
  },
  {
    slug: 'performance-engineering',
    title: 'Performance Engineering',
    description:
      'Measurement before optimisation. Profiling, allocation discipline and cache-aware data layout, applied where the profile says it matters rather than where it is fashionable.',
    capabilities: ['Profile-first optimisation', 'Bounded allocation in hot paths', 'Layout-aware data structures', 'Regression benchmarks in CI'],
  },
];

/**
 * Code-inspired visuals on /technology. Static text, labelled, no execution —
 * there is no live system behind any of it.
 */
export const codeSamples: readonly { readonly title: string; readonly language: string; readonly code: string }[] = [
  {
    title: 'Cost-aware signal gate',
    language: 'rust',
    code: `// admit a cycle only when the net edge clears every cost
let net_bps = gross_bps - fee_bps - slippage_bps;
if net_bps <= min_edge_bps {
    metrics::reject(Cycle::Cost, net_bps);
    return None;
}
Some(Signal { net_bps, ..cycle })`,
  },
  {
    title: 'Deterministic feature window',
    language: 'python',
    code: `def signed_flow(buckets: Sequence[Bucket], *, window: int) -> float:
    """Net order-flow imbalance over a fixed, non-overlapping window."""
    sample = buckets[-window:]
    volume = sum(b.volume for b in sample)
    if volume == 0:
        return 0.0
    return sum(b.signed_volume for b in sample) / volume`,
  },
  {
    title: 'Replay manifest',
    language: 'yaml',
    code: `session: 2026-06-30T08:00:00Z/2026-06-30T09:30:00Z
seed: 7741
fill_model: depth_vwap
latency_ms: 150
features: []          # every feature off unless named
outputs: [summary, events]`,
  },
];
