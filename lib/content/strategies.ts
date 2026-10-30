export type FormulaPart = {
  /** `sub` renders as a subscript; operators are dimmed so variables read first. */
  readonly role: 'var' | 'op' | 'num' | 'sub';
  readonly text: string;
};

/**
 * Design-system §6.13: formulas are hand-built HTML/CSS primitives — no KaTeX,
 * no MathML — and every one sits in a `<figure>` whose `<figcaption>` states it
 * in words. This spec is deliberately tiny for that reason.
 */
export type FormulaSpec = {
  readonly parts: readonly FormulaPart[];
  readonly gloss: string;
};

export type Strategy = {
  readonly slug: string;
  readonly name: string;
  readonly tagline: string;
  readonly overview: readonly string[];
  readonly math: FormulaSpec;
  readonly mathProse: readonly string[];
  readonly data: readonly string[];
  readonly risks: readonly string[];
  readonly implementation: readonly string[];
};

/**
 * Seven strategies, each a *conceptual* research programme. None of this copy
 * claims a strategy is deployed, funded or profitable (§10, content integrity);
 * the register is "is designed to", never "delivers".
 */
export const strategies: readonly Strategy[] = [
  {
    slug: 'statistical-arbitrage',
    name: 'Statistical Arbitrage',
    tagline: 'Relative value between instruments whose relationship has a measurable half-life.',
    overview: [
      'Statistical arbitrage treats a group of instruments as a system rather than a set of independent bets. The object of study is the residual: the part of an instrument’s return that is not explained by its peers. If that residual is stationary, deviations from it are candidates for mean-reverting positions.',
      'The discipline is in the estimation, not the idea. Which peers, over which window, with which hedge ratio, and with what evidence that the relationship has not simply ended — those choices decide whether the residual is a signal or a memory.',
    ],
    math: {
      parts: [
        { role: 'var', text: 'z' },
        { role: 'op', text: ' = (' },
        { role: 'var', text: 's' },
        { role: 'op', text: ' − ' },
        { role: 'var', text: 'μ' },
        { role: 'op', text: ') / ' },
        { role: 'var', text: 'σ' },
      ],
      gloss: 'The spread s is standardised by its estimated mean μ and standard deviation σ, so a deviation is expressed in units of its own variability.',
    },
    mathProse: [
      'Standardising the spread makes the entry and exit thresholds comparable across pairs with very different volatilities. A two-sigma entry on a quiet pair and a two-sigma entry on a noisy pair are the same statement about relative deviation, not the same statement about risk.',
    ],
    data: [
      'Synchronised price and quote data for both legs, at a granularity fine enough to resolve the intended holding period.',
      'Corporate actions and contract rolls, so a split is not mistaken for a spread.',
      'Borrow availability and financing costs where the short leg requires them.',
    ],
    risks: [
      'Structural breaks: the hedge ratio can change for reasons unrelated to the spread, and the position has no way to know.',
      'Crowding: a widely observed residual is often a widely held position, which changes the exit liquidity precisely when the position needs it.',
      'Short-leg constraints: recall risk and borrow cost can remove the theoretical hedge at the moment it is needed.',
    ],
    implementation: [
      'Estimate the hedge ratio on a rolling window and report its dispersion alongside the spread.',
      'Define exits in the same units as entries, and pre-register the maximum holding period.',
      'Monitor residual stationarity continuously; a break should reduce size before it closes the position.',
    ],
  },
  {
    slug: 'market-making',
    name: 'Market Making',
    tagline: 'Quoting two prices and managing the inventory that follows.',
    overview: [
      'A market maker sells liquidity to both sides and earns the spread, less the cost of the inventory that accumulates when one side fills more often than the other. The strategy is a control problem, not a forecasting problem: the forecast matters far less than the inventory policy.',
      'Every quote is a trade-off between fill probability and adverse selection. Being filled is not the objective; being filled by uninformed flow is, and the two are only distinguishable after the fact.',
    ],
    math: {
      parts: [
        { role: 'var', text: 'q' },
        { role: 'op', text: '(' },
        { role: 'var', text: 'δ' },
        { role: 'op', text: ') = ' },
        { role: 'var', text: 's' },
        { role: 'op', text: ' / 2 − ' },
        { role: 'var', text: 'γ' },
        { role: 'op', text: ' · ' },
        { role: 'var', text: 'σ' },
        { role: 'op', text: '² · ' },
        { role: 'var', text: 'i' },
      ],
      gloss: 'The half-spread quoted around a fair value widens with volatility σ² and with inventory i, scaled by a risk-aversion parameter γ.',
    },
    mathProse: [
      'The inventory term is the whole point. With no inventory, quoting is a symmetric spread-capture problem; with inventory, the quote becomes asymmetric, skewing toward the side that reduces exposure. A maker that quotes symmetrically regardless of inventory is running an unhedged directional book by accident.',
    ],
    data: [
      'Full depth and trade data with aggressor side, at event granularity.',
      'Queue position and cancellation history, if the venue exposes it.',
      'Fee schedule including rebates, which change the sign of the strategy in some regimes.',
    ],
    risks: [
      'Adverse selection: fills cluster in the moments the quote is stale, which is the mechanism by which a passive book loses money.',
      'Inventory risk: a one-sided fill sequence becomes a directional position with no thesis behind it.',
      'Latency asymmetry: a slower participant is systematically the last to know the quote is wrong.',
    ],
    implementation: [
      'Model fill probability and mark-out jointly — one without the other is a spread that does not exist.',
      'Cap inventory in units of expected daily volatility, not in notional.',
      'Treat cancellations as part of the cost model; a quote you cannot cancel is a quote you did not place.',
    ],
  },
  {
    slug: 'cross-exchange-arbitrage',
    name: 'Cross-Exchange Arbitrage',
    tagline: 'The same asset, two venues, and a basis that must clear its own costs.',
    overview: [
      'The same asset trading on two venues at different prices is an arbitrage only after fees, transfer time and the risk that the gap closes before both legs settle. The gross basis is the beginning of the calculation, not the end of it.',
      'This strategy is a study in cost floors: the number of legs, the fee tier on each, the settlement route between venues and the capital that must be pre-positioned on both sides.',
    ],
    math: {
      parts: [
        { role: 'var', text: 'edge' },
        { role: 'op', text: ' = ' },
        { role: 'var', text: 'p' },
        { role: 'sub', text: 'B' },
        { role: 'op', text: ' − ' },
        { role: 'var', text: 'p' },
        { role: 'sub', text: 'A' },
        { role: 'op', text: ' − ' },
        { role: 'var', text: 'fees' },
        { role: 'op', text: ' − ' },
        { role: 'var', text: 'transfer' },
        { role: 'op', text: ' − ' },
        { role: 'var', text: 'buffer' },
      ],
      gloss: 'The executable edge is the price difference between venues minus both fee legs, the cost of moving value between them, and a buffer for the gap closing mid-execution.',
    },
    mathProse: [
      'The buffer is not conservatism for its own sake. It prices the probability that the second leg fills at a worse price than the first, which is the dominant failure mode of a two-venue trade.',
    ],
    data: [
      'Synchronised top-of-book from both venues with local receive timestamps.',
      'Fee tiers, withdrawal and deposit status per venue — a suspended route changes the trade entirely.',
      'Pre-positioned balances per venue, since the capital constraint binds before the price constraint.',
    ],
    risks: [
      'Leg risk: one fill without the other is an unhedged position, not an arbitrage.',
      'Transfer risk: the settlement route can be slower or paused when the basis is widest.',
      'Venue risk: counterparty and operational differences that a price feed does not show.',
    ],
    implementation: [
      'Gate on the net edge with every cost leg enumerated, never on the quoted spread.',
      'Require pre-positioned inventory on both venues; treat transfers as a separate, slower strategy.',
      'Log every rejection with the cost component that caused it, so the gate stays auditable.',
    ],
  },
  {
    slug: 'momentum',
    name: 'Momentum Strategies',
    tagline: 'Persistence in returns, treated as a hypothesis with a decay profile.',
    overview: [
      'Momentum is the observation that recent relative performance has, in many samples, continued. The research question is not whether that is true on average but where it is true, over what horizon, and what it costs to harvest.',
      'A momentum study is mostly a study of turnover. The signal is slow, the rebalancing is not, and the cost of changing your mind is the difference between a published effect and a tradeable one.',
    ],
    math: {
      parts: [
        { role: 'var', text: 'score' },
        { role: 'sub', text: 'i' },
        { role: 'op', text: ' = ' },
        { role: 'var', text: 'r' },
        { role: 'sub', text: 'i' },
        { role: 'op', text: ' / ' },
        { role: 'var', text: 'σ' },
        { role: 'sub', text: 'i' },
      ],
      gloss: 'The trailing return r of each instrument is scaled by its own volatility σ, so ranking compares risk-adjusted persistence rather than raw performance.',
    },
    mathProse: [
      'Scaling by volatility keeps the ranking from being a ranking of volatility. Without it, the highest-scoring instruments are simply the noisiest ones, and the portfolio is a volatility bet wearing a momentum label.',
    ],
    data: [
      'Adjusted price history long enough to cover the formation window plus the holding window.',
      'A survivorship-free universe, or the result is a study of instruments that were already successful.',
      'Turnover and cost data at the rebalancing frequency actually intended.',
    ],
    risks: [
      'Momentum crashes: the strategy’s worst outcomes cluster in sharp reversals after periods of stress.',
      'Turnover cost: the signal survives gross and dies net more often than the literature suggests.',
      'Look-ahead in the universe: today’s index membership is not yesterday’s.',
    ],
    implementation: [
      'Pre-register the formation and holding windows; a grid search over both is a search for the sample.',
      'Model rebalancing cost with the same fill assumptions used elsewhere.',
      'Report results per regime, not only pooled.',
    ],
  },
  {
    slug: 'mean-reversion',
    name: 'Mean Reversion',
    tagline: 'A restoring force, with a half-life that must be measured rather than assumed.',
    overview: [
      'Mean reversion models a price or spread as being pulled back toward a level. The pull is only meaningful if it is faster than the cost of waiting for it, so the half-life of the process is the central quantity, not a footnote.',
      'The failure mode is a spread that looks mean-reverting because it has not yet finished trending. Distinguishing the two is a question about the sample, and about how much of the sample is one event.',
    ],
    math: {
      parts: [
        { role: 'var', text: 'ds' },
        { role: 'op', text: ' = ' },
        { role: 'var', text: 'θ' },
        { role: 'op', text: '(' },
        { role: 'var', text: 'μ' },
        { role: 'op', text: ' − ' },
        { role: 'var', text: 's' },
        { role: 'op', text: ') ' },
        { role: 'var', text: 'dt' },
        { role: 'op', text: ' + ' },
        { role: 'var', text: 'σ' },
        { role: 'var', text: ' dW' },
      ],
      gloss: 'An Ornstein–Uhlenbeck process: the spread s is pulled toward μ at speed θ, with σ scaling the random shocks dW.',
    },
    mathProse: [
      'The half-life follows from θ as ln(2)/θ. Estimated on a rolling window it is unstable exactly when stability would be most useful, which is why the interval around the estimate matters more than the point value.',
    ],
    data: [
      'A price series long enough to estimate the speed with a usable confidence interval.',
      'Event markers for the period, so a single shock is not read as a slow trend.',
      'Trading calendar detail; a half-life measured in calendar days is a different number.',
    ],
    risks: [
      'Regime drift: the reversion level can move, and a spread reverting to a stale mean is a losing position.',
      'Estimation error: short windows produce confident half-lives with no evidential support.',
      'Capacity: reversion opportunities are often small and disappear above modest size.',
    ],
    implementation: [
      'Estimate on non-overlapping samples and report the interval.',
      'Re-estimate on a schedule and reduce exposure when the interval widens.',
      'Set a maximum holding period independent of the estimate.',
    ],
  },
  {
    slug: 'liquidity-provision',
    name: 'Liquidity Provision',
    tagline: 'Being paid to hold the option you just wrote.',
    overview: [
      'Providing liquidity is economically the sale of an option on immediacy: the provider earns a fee when others demand liquidity and bears the price impact when they are informed. Whether that is a business depends on the ratio of the two, measured on the horizon you actually hold.',
      'Compared with market making, liquidity provision emphasises depth and duration: quoting further from the touch, for longer, with explicit inventory and adverse-selection budgets.',
    ],
    math: {
      parts: [
        { role: 'var', text: 'E[PnL]' },
        { role: 'op', text: ' = ' },
        { role: 'var', text: 'fills' },
        { role: 'op', text: ' · (' },
        { role: 'var', text: 'spread' },
        { role: 'op', text: ' − ' },
        { role: 'var', text: 'impact' },
        { role: 'op', text: ') − ' },
        { role: 'var', text: 'carry' },
      ],
      gloss: 'Expected profit is the number of fills multiplied by the spread captured less the price impact of the informed flow, minus the cost of carrying the resulting inventory.',
    },
    mathProse: [
      'The impact term is the one that is measured least and matters most. A provider that cannot estimate it is estimating a business from its revenue line only.',
    ],
    data: [
      'Trade and quote data at the granularity of the quoting horizon.',
      'Mark-out series at a pre-registered horizon, used as the adverse-selection estimate.',
      'Rebate and fee schedules, since the sign of the edge can depend on them.',
    ],
    risks: [
      'Adverse selection at exactly the wrong times: the fills you get are the ones you did not want.',
      'Inventory concentration: depth provision accumulates exposure in the instruments with the most flow.',
      'Rebate dependence: an edge that exists only because of a fee tier is a policy risk.',
    ],
    implementation: [
      'Pre-register the mark-out horizon used to evaluate fills, and hold it fixed across experiments.',
      'Budget adverse selection per instrument, not only per portfolio.',
      'Model the fee tier as an input, so a schedule change is a visible scenario rather than a surprise.',
    ],
  },
  {
    slug: 'portfolio-optimisation',
    name: 'Portfolio Optimisation',
    tagline: 'Constraining an amplifier so that it produces a portfolio, not a bet.',
    overview: [
      'Portfolio construction turns a set of imperfect return forecasts and an estimated covariance into positions. Because the optimiser amplifies estimation error, most of the engineering is in the constraints rather than the objective.',
      'The honest framing is that the optimiser is a translator with no judgement of its own. It will express whatever you told it, including the parts you did not mean.',
    ],
    math: {
      parts: [
        { role: 'var', text: 'max' },
        { role: 'op', text: '  ' },
        { role: 'var', text: 'w' },
        { role: 'op', text: 'ᵀ' },
        { role: 'var', text: 'μ' },
        { role: 'op', text: ' − (' },
        { role: 'var', text: 'λ' },
        { role: 'op', text: '/2) ' },
        { role: 'var', text: 'w' },
        { role: 'op', text: 'ᵀ' },
        { role: 'var', text: 'Σ' },
        { role: 'var', text: 'w' },
      ],
      gloss: 'Maximise expected return wᵀμ net of a risk penalty (λ/2)wᵀΣw, over weights w, expected returns μ and covariance Σ.',
    },
    mathProse: [
      'The solution is a closed form only without constraints; with position, sector and turnover limits it is a numerical problem, and the constraints — not the objective — determine the character of the book.',
    ],
    data: [
      'A return history long enough to estimate the covariance with the chosen estimator.',
      'Constraint data: position limits, sector mapping, liquidity and turnover budgets.',
      'Cost estimates at the rebalancing frequency.',
    ],
    risks: [
      'Estimation error amplification: the optimiser loads on the least reliable estimates by construction.',
      'Constraint drift: limits that were meaningful at design time can bind permanently later.',
      'Turnover blow-up: a noisy covariance can make the optimiser trade every period.',
    ],
    implementation: [
      'Constrain turnover explicitly and measure the cost of each rebalance.',
      'Check the condition number of the covariance before optimisation.',
      'Compare the optimised book against an equal-weight or risk-parity baseline; if the optimiser cannot beat it net of cost, that is the finding.',
    ],
  },
];

export function getStrategy(slug: string): Strategy | undefined {
  return strategies.find((strategy) => strategy.slug === slug);
}
