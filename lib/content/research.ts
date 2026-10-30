import type { ResearchEntry } from '@/lib/content/types';

/**
 * Twelve illustrative research entries. Nothing in this file reports a live or
 * historical result: the figures are hypothetical constructions used to explain
 * a method, and every entry carries `illustrative: true` so the badge renders
 * directly beneath the title (design-system §14.1).
 *
 * The set is deliberately two entries per category so the index's category
 * filter always has something to show for each chip.
 */
export const researchEntries: readonly ResearchEntry[] = [
  {
    slug: 'order-flow-imbalance-as-a-feature',
    title: 'Order-flow imbalance as a feature, not a signal',
    category: 'Market Microstructure',
    kind: 'Article',
    date: '2026-08-18',
    readMinutes: 9,
    summary:
      'Signed order-flow imbalance decays within seconds at the top of book and within minutes deeper in the queue. Treating it as a directional signal confuses a liquidity statistic with a forecast.',
    illustrative: true,
    body: [
      {
        type: 'p',
        text: 'Order-flow imbalance is the most over-interpreted quantity in microstructure research. It is simple to compute, it looks like a leading indicator, and it is almost always measured over a window that flatters it. The useful question is not whether imbalance predicts the next trade but what it measures about the queue.',
      },
      {
        type: 'p',
        text: 'For a book with bid depth B and ask depth A over the first k levels, the normalised imbalance is a number in [-1, 1]. It is a ratio of resting liquidity, not of intent: a large positive value says the visible bid is thicker, which is as consistent with a single patient participant as with broad buying interest.',
      },
      {
        type: 'h2',
        text: 'What the statistic actually measures',
      },
      {
        type: 'p',
        text: 'Split the book into a persistent component and a transient one. The persistent component is where liquidity providers choose to sit; the transient component is the replenishment race after a trade. Only the second has a short, exploitable horizon, and it is precisely the one that disappears when you add latency to your own reaction time.',
      },
      {
        type: 'list',
        items: [
          'Measure imbalance in event time, not clock time — a quiet market accumulates elapsed time without accumulating order flow.',
          'Normalise by depth at the same instant, never by an average of depth, or the feature absorbs a volatility regime.',
          'Report decay explicitly: the horizon at which the relationship halves is more informative than the correlation itself.',
        ],
      },
      {
        type: 'h2',
        text: 'A note on research hygiene',
      },
      {
        type: 'p',
        text: 'The temptation is to search windows until the relationship looks strong. That search is the finding. Report the decay curve for a fixed window grid decided in advance, and show what happens when you shift the signal by one bucket — a feature that dies under a one-bucket shift was never tradeable.',
      },
      {
        type: 'quote',
        text: 'A liquidity statistic tells you which side is thinner. It does not tell you which side is right.',
      },
    ],
    takeaways: [
      'Imbalance is a description of resting liquidity, not a forecast of direction.',
      'The decay horizon, measured on a pre-registered grid, is the useful output.',
      'A one-bucket shift test separates a feature from an artefact.',
    ],
    references: [
      { label: 'Cont, Kukanov & Stoikov — The price impact of order book events' },
      { label: 'Easley, López de Prado & O’Hara — Flow toxicity and liquidity' },
    ],
  },
  {
    slug: 'pairs-selection-under-structural-breaks',
    title: 'Pairs selection when the relationship has a break in it',
    category: 'Statistical Arbitrage',
    kind: 'Article',
    date: '2026-07-02',
    readMinutes: 11,
    summary:
      'Cointegration tests reward pairs that were stable in-sample. A break-aware screen asks a different question: how much of the estimated relationship survives a regime change?',
    illustrative: true,
    body: [
      {
        type: 'p',
        text: 'A pairs screen typically ranks candidates by the strength of a cointegration test over a fixed window. The ranking is then used out of sample, where the relationship was estimated. When the pair breaks, the loss is attributed to “regime change”, as if that were a weather event rather than the thing the screen failed to price.',
      },
      {
        type: 'h2',
        text: 'Estimating the relationship',
      },
      {
        type: 'p',
        text: 'Regress log price A on log price B, and treat the residual as the spread. The hedge ratio β is the quantity you are actually betting on: if it drifts, the residual stops being stationary even though neither leg has done anything unusual.',
      },
      {
        type: 'h2',
        text: 'What a break-aware screen adds',
      },
      {
        type: 'list',
        items: [
          'Estimate β on rolling windows and report its dispersion — a stable mean with a wide β distribution is not a stable relationship.',
          'Score candidates on residual stationarity *after* a break, not on the undivided window.',
          'Reject pairs whose apparent edge sits inside a single event window; an event is not a sample.',
        ],
      },
      {
        type: 'p',
        text: 'The practical consequence is fewer candidates and lower in-sample significance. That is the correct direction: a screen optimised for significance will always prefer the pair with the most observations in the most agreeable period.',
      },
      {
        type: 'h3',
        text: 'Why this is a research problem, not a modelling one',
      },
      {
        type: 'p',
        text: 'No estimator recovers a relationship that has genuinely ended. The contribution of a break-aware screen is honesty about the uncertainty, not a better forecast. A pair that survives it is not safe; it is merely less obviously fragile.',
      },
    ],
    takeaways: [
      'Rank on post-break stationarity, not whole-window significance.',
      'Report the dispersion of the hedge ratio, not only its level.',
      'Fewer, weaker-looking candidates is the intended outcome.',
    ],
    references: [
      { label: 'Engle & Granger — Co-integration and error correction' },
      { label: 'Gatev, Goetzmann & Rouwenhorst — Pairs trading: performance of a relative-value rule' },
    ],
  },
  {
    slug: 'backtest-fill-assumptions',
    title: 'Your backtest loves the fill you did not get',
    category: 'Algorithmic Execution',
    kind: 'Article',
    date: '2026-06-11',
    readMinutes: 8,
    summary:
      'A mid-price fill is a generous assumption when the same book, at the same instant, was paying spread in both directions. The gap between assumed and realised fill is usually larger than the edge being tested.',
    illustrative: true,
    body: [
      {
        type: 'p',
        text: 'Most backtests fill at the mid, at the touch, or at the close, and then apply a fee. Each of those is a model of execution. The model is rarely validated against the thing it stands in for, which means the backtest is measuring the strategy and the fill model together, and reporting a single number.',
      },
      {
        type: 'h2',
        text: 'Three cheap validations',
      },
      {
        type: 'list',
        items: [
          'Replay the same signals at three fill assumptions — mid, touch, and touch plus one level — and report the spread of outcomes rather than the mean.',
          'Add a latency of one and two update cycles and check whether the sign of the edge survives.',
          'Compare any simulated fill against the depth that was visibly available at that timestamp, and log the shortfall rather than smoothing it.',
        ],
      },
      {
        type: 'p',
        text: 'None of these require more data than the backtest already has. They require refusing to report a single number as if it were an estimate.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'assumed_edge_bps = 6.0\nspread_cost_bps = 4.0\nlatency_cost_bps = 2.5\n--------------------------------\nresidual_edge_bps = -0.5',
      },
      {
        type: 'p',
        text: 'The arithmetic above is the whole argument. An edge smaller than the sum of the costs that sit between the signal and the fill is not an edge; it is a cost estimate waiting to be discovered.',
      },
    ],
    takeaways: [
      'A fill assumption is a model; validate it or label the result as a joint measurement.',
      'Report the distribution across fill assumptions, not one mean.',
      'If the edge is smaller than spread plus latency cost, it does not exist yet.',
    ],
    references: [
      { label: 'Almgren & Chriss — Optimal execution of portfolio transactions' },
      { label: 'Perold — The implementation shortfall' },
    ],
  },
  {
    slug: 'covariance-shrinkage-in-small-universes',
    title: 'Covariance shrinkage when the universe is small',
    category: 'Portfolio Optimisation',
    kind: 'Mathematical exploration',
    date: '2026-05-22',
    readMinutes: 10,
    summary:
      'With more assets than observations the sample covariance is singular, and an optimiser will happily turn noise into a position. Shrinkage buys stability at the cost of bias — and the trade is measurable.',
    illustrative: true,
    body: [
      {
        type: 'p',
        text: 'A mean–variance optimiser is an amplifier. Feed it an estimated covariance matrix and it responds to the smallest eigenvalues, which are exactly the directions estimated with the least data. When the number of assets approaches the number of observations, the sample matrix becomes ill-conditioned and then singular.',
      },
      {
        type: 'h2',
        text: 'The shrinkage estimator',
      },
      {
        type: 'p',
        text: 'Shrink the sample covariance toward a structured target — a diagonal matrix or a constant-correlation matrix — and choose the intensity λ rather than assuming it. The estimator is a convex combination of a noisy estimate and a biased one; the bias is the price of conditioning.',
      },
      {
        type: 'list',
        items: [
          'Pick the target by what you believe about the data: constant correlation is a strong claim, a diagonal target is a weak one.',
          'Choose λ by cross-validation on portfolio-level loss, not on matrix distance.',
          'Report the condition number before and after, because that is what the optimiser actually experiences.',
        ],
      },
      {
        type: 'h3',
        text: 'What shrinkage does not fix',
      },
      {
        type: 'p',
        text: 'It does not fix a non-stationary covariance, and it does not fix an optimiser that is allowed unbounded leverage. Shrinkage reduces the variance of the estimate; it leaves the objective exactly as fragile as it was.',
      },
    ],
    takeaways: [
      'Singular covariance is a data problem; shrinkage is a conditioning response.',
      'Tune the intensity on portfolio-level loss.',
      'Constrain the optimiser independently of the estimator.',
    ],
    references: [
      { label: 'Ledoit & Wolf — A well-conditioned estimator for large-dimensional covariance matrices' },
      { label: 'Michaud — The Markowitz optimisation enigma' },
    ],
  },
  {
    slug: 'half-life-estimation-for-mean-reversion',
    title: 'Half-life estimation is a diagnostic, not a parameter',
    category: 'Time-Series Analysis',
    kind: 'Mathematical exploration',
    date: '2026-04-09',
    readMinutes: 7,
    summary:
      'Fitting an Ornstein–Uhlenbeck process to a spread gives a half-life that looks like a trading parameter. It is better read as a stability diagnostic with a standard error attached.',
    illustrative: true,
    body: [
      {
        type: 'p',
        text: 'Regress the change in a spread on its lagged level. The slope is the mean-reversion speed; the half-life follows from it. The number is easy to compute and easy to over-trust, because a point estimate with a wide interval is not a trading horizon.',
      },
      {
        type: 'h2',
        text: 'Reading the estimate properly',
      },
      {
        type: 'list',
        items: [
          'Report the confidence interval of the slope and translate it to a half-life interval; a range of two to forty days is not a parameter.',
          'Re-estimate on rolling windows and plot the path — a half-life that drifts monotonically is a break, not a slow market.',
          'Compare the half-life with the sampling interval. A half-life shorter than the bar size is unmeasurable at that frequency.',
        ],
      },
      {
        type: 'p',
        text: 'A half-life is most useful when it disagrees with your assumption. That disagreement is a signal to stop, which is a more valuable output than a number to feed into a position sizer.',
      },
    ],
    takeaways: [
      'Always attach an interval to the estimate.',
      'Rolling re-estimation detects breaks that one window hides.',
      'A half-life below the sampling interval is not measurable.',
    ],
    references: [{ label: 'Chan — Algorithmic Trading: mean-reversion half-life' }],
  },
  {
    slug: 'gradient-boosting-order-books',
    title: 'Gradient boosting on order-book snapshots, and the leakage that follows',
    category: 'Financial Machine Learning',
    kind: 'Experiment',
    date: '2026-03-14',
    readMinutes: 12,
    summary:
      'Snapshot features are almost always computed with information from the end of the bar. When the label is the next bar, the model is not forecasting — it is reading the answer off a lagged column.',
    illustrative: true,
    body: [
      {
        type: 'p',
        text: 'Tree ensembles on order-book snapshots are a standard research exercise: build a few hundred features, label the next interval’s direction, rank by importance. The result is usually a model with a plausible AUC and a trading result of zero, because the split between train and test respected rows rather than time.',
      },
      {
        type: 'h2',
        text: 'Where the leakage enters',
      },
      {
        type: 'list',
        items: [
          'Features normalised across the full sample carry the future into the past through the scaling constant.',
          'Rolling windows that end at the label timestamp include the label interval itself.',
          'Purging and embargoing are not optional when consecutive rows overlap in label horizon.',
        ],
      },
      {
        type: 'p',
        text: 'The embarrassing version of this failure is not a spectacular backtest; it is a mediocre one that cannot be reproduced forward. Mediocrity hides leakage well.',
      },
      {
        type: 'h3',
        text: 'A cheap detector',
      },
      {
        type: 'p',
        text: 'Shuffle the labels within each training fold and re-fit. If the pipeline still reports skill, the skill is in the pipeline.',
      },
    ],
    takeaways: [
      'Split by time, purge overlapping labels, embargo the boundary.',
      'Fit scalers inside the fold, never on the full sample.',
      'A label-shuffle control is the cheapest leakage test available.',
    ],
    references: [
      { label: 'López de Prado — Advances in Financial Machine Learning, ch. 7' },
      { label: 'Kaufman et al. — Leakage in data mining' },
    ],
  },
  {
    slug: 'triangular-arbitrage-fee-floor',
    title: 'The fee floor in triangular arbitrage',
    category: 'Statistical Arbitrage',
    kind: 'Technical note',
    date: '2026-02-27',
    readMinutes: 4,
    summary:
      'A triangular cycle pays a fee on every leg. A gross-edge threshold below the round-trip cost admits only losing trades, by construction.',
    illustrative: true,
    body: [
      {
        type: 'p',
        text: 'For a cycle A→B→C→A, the gross edge is the product of the three quoted rates minus one. If each leg costs ten basis points, the round trip costs roughly thirty. A gate set at fifteen admits every signal whose gross edge lands between fifteen and thirty — a set that is, without exception, unprofitable.',
      },
      {
        type: 'p',
        text: 'The fix is not a better gate; it is a gate expressed in the right units. Set the threshold at fees plus a slippage buffer plus the minimum edge you require, and the population of admitted signals changes character rather than merely shrinking.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'gross_bps = 15.27\nfee_bps   = 30.00   // 3 legs x 10\nnet_bps   = -14.73  // admitted, and losing',
      },
    ],
    takeaways: [
      'Gate on net edge, not gross.',
      'Express the threshold as fees + buffer + required edge.',
      'A gate below the cost floor is a filter for losses.',
    ],
    references: [{ label: 'Round-trip cost arithmetic, design-system worked example' }],
  },
  {
    slug: 'latency-budget-arithmetic',
    title: 'A latency budget you can actually defend',
    category: 'Algorithmic Execution',
    kind: 'Technical note',
    date: '2026-02-03',
    readMinutes: 5,
    summary:
      'Decompose the path from market data to fill into measured segments. Any segment without a measurement is where the assumption goes.',
    illustrative: true,
    body: [
      {
        type: 'p',
        text: '“Our latency is low” is a claim about a distribution, not a component. Write the path down — feed handler, normalisation, signal, order construction, transport, matching — and attach a measured p50 and p99 to each segment. The unmeasured segment is where the budget will be spent.',
      },
      {
        type: 'list',
        items: [
          'Measure at the points where the message actually crosses a boundary, not inside a loop.',
          'Keep the tail, not just the mean: execution decisions are made in the tail.',
          'Re-measure after every dependency upgrade; a latency budget has a shelf life.',
        ],
      },
    ],
    takeaways: [
      'A latency figure without a percentile is not a measurement.',
      'Budget the segments, then measure each one.',
    ],
    references: [{ label: 'Implementation shortfall decomposition, Almgren & Chriss' }],
  },
  {
    slug: 'volatility-scaling-fallacy',
    title: 'The volatility-scaling fallacy in position sizing',
    category: 'Portfolio Optimisation',
    kind: 'Technical note',
    date: '2026-01-20',
    readMinutes: 4,
    summary:
      'Scaling exposure by inverse volatility assumes the estimate is stable and the relationship is linear. Both assumptions fail at exactly the moments the scaling matters.',
    illustrative: true,
    body: [
      {
        type: 'p',
        text: 'Target-volatility sizing divides a target by an estimate of realised volatility. When volatility is estimated from a short window, the estimate is noisy; when it is estimated from a long window, it is stale. Neither window is wrong — they fail in opposite directions, which is why a single number is a poor control.',
      },
      {
        type: 'p',
        text: 'The defensible version states the estimator, the window, the cap and the floor, and shows what the exposure path would have been under two alternate windows. If the exposure path changes sign under a reasonable alternate, the sizing rule is the strategy.',
      },
    ],
    takeaways: [
      'Always publish the volatility estimator and window.',
      'Test alternate windows; if exposure inverts, the rule is the risk.',
    ],
    references: [{ label: 'Moreira & Muir — Volatility-managed portfolios' }],
  },
  {
    slug: 'autocorrelation-of-signed-volume',
    title: 'Autocorrelation of signed volume, measured honestly',
    category: 'Time-Series Analysis',
    kind: 'Technical note',
    date: '2025-12-12',
    readMinutes: 5,
    summary:
      'Signed volume is persistent, but persistence measured on overlapping windows is mostly an artefact of the overlap. Use non-overlapping buckets and report the standard error.',
    illustrative: true,
    body: [
      {
        type: 'p',
        text: 'Aggregate trades into buckets, sign each by the aggressor, and compute autocorrelation at several lags. With overlapping windows the effective sample size is far smaller than the row count, so the confidence band is too narrow and almost everything looks significant.',
      },
      {
        type: 'list',
        items: [
          'Use non-overlapping buckets; longer buckets with independent observations beat short overlapping ones.',
          'Report the autocorrelation function with a band computed from the effective sample size.',
          'Check that the result is not driven by a handful of event days.',
        ],
      },
    ],
    takeaways: [
      'Overlap inflates significance; use independent buckets.',
      'A persistence result that needs one week of data is a story about that week.',
    ],
    references: [{ label: 'Bouchaud et al. — Trades, quotes and prices' }],
  },
  {
    slug: 'queue-position-and-adverse-selection',
    title: 'Queue position is a risk factor, not a nicety',
    category: 'Market Microstructure',
    kind: 'Technical note',
    date: '2025-11-28',
    readMinutes: 6,
    summary:
      'A passive order’s fill rate and its adverse-selection cost move together. Modelling one without the other produces a market-making strategy that is profitable only in simulation.',
    illustrative: true,
    body: [
      {
        type: 'p',
        text: 'A resting order sits in a queue. Being late in that queue means fewer fills; being early means the fills you get are disproportionately the ones that were about to become unprofitable. Fill probability and mark-out are two views of the same event, so estimating them separately is how a backtest finds a spread that does not exist.',
      },
      {
        type: 'p',
        text: 'Simulating this honestly requires queue position as state, a cancellation model, and a mark-out horizon fixed in advance. Without the third, the mark-out will be chosen to fit.',
      },
    ],
    takeaways: [
      'Model fill probability and mark-out jointly.',
      'Fix the mark-out horizon before looking at results.',
    ],
    references: [{ label: 'Moallemi & Yuan — A model for queue position valuation' }],
  },
  {
    slug: 'feature-importance-is-not-causality',
    title: 'Feature importance is not a causal statement',
    category: 'Financial Machine Learning',
    kind: 'Technical note',
    date: '2025-11-05',
    readMinutes: 5,
    summary:
      'Impurity-based importance rewards features that are merely convenient splits. Permutation importance on held-out, time-ordered data is the weakest defensible substitute.',
    illustrative: true,
    body: [
      {
        type: 'p',
        text: 'A high-importance feature is one the model found useful, which can mean it is predictive, correlated with something predictive, or an artefact of how the tree grew. None of those are causal claims, and only the first is even a forecasting claim.',
      },
      {
        type: 'p',
        text: 'Use permutation importance on out-of-sample, time-ordered folds, report the uncertainty across folds, and treat any feature whose importance is not stable across folds as undetermined rather than important.',
      },
    ],
    takeaways: [
      'Impurity importance describes the fitted model, not the market.',
      'Stability across time-ordered folds is the bar.',
    ],
    references: [{ label: 'Strobl et al. — Conditional variable importance' }],
  },
];

export const researchCategories = [
  'Market Microstructure',
  'Statistical Arbitrage',
  'Algorithmic Execution',
  'Portfolio Optimisation',
  'Time-Series Analysis',
  'Financial Machine Learning',
] as const;

export function getResearchEntry(slug: string): ResearchEntry | undefined {
  return researchEntries.find((entry) => entry.slug === slug);
}

export function getAdjacentEntries(slug: string): { previous: ResearchEntry | undefined; next: ResearchEntry | undefined } {
  const index = researchEntries.findIndex((entry) => entry.slug === slug);
  if (index === -1) return { previous: undefined, next: undefined };
  return { previous: researchEntries[index - 1], next: researchEntries[index + 1] };
}
