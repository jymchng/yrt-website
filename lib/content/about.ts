export const aboutContent = {
  philosophy: {
    heading: 'Our Philosophy',
    paragraphs: [
      'Markets reward discipline, not narratives. We believe in rigorous research, systematic thinking, and continuous experimentation. A view that cannot be stated as a testable hypothesis is, for our purposes, an opinion — and opinions are cheap in a market that prices them continuously.',
      'The work is mostly subtractive. Most candidate signals do not survive their own transaction costs; most apparent relationships do not survive a change of sample; most backtest results do not survive an honest fill model. Finding that out early is the job, and it is cheaper than finding it out with capital.',
      'We treat uncertainty as something to be reported rather than smoothed. An estimate without an interval is an unfinished result, and a model that cannot describe its own failure modes is not ready to be trusted with a decision.',
      'Everything on this website is illustrative. We publish method, not performance: simulated series are clearly labelled as such, and no figure here describes a live or historical trading result.',
    ],
  },
  name: {
    heading: 'Our Name',
    quote: 'Yishun has no river. But every market has a current.',
    paragraphs: [
      'Yishun is a town in the north of Singapore. It does not have a river. The name is therefore a small, factual joke: a firm named after water that is not there, working in a domain where everything is described in flows, depth, liquidity and drift.',
      'The joke earns its place because it makes the same point the research does. A current is not a thing you can see; it is a pattern in how everything else moves, and it is only visible if you measure carefully and long enough to distinguish it from noise.',
      'So the name is not a claim about geography and not a story about an origin. It is a reminder that the interesting structure in a market is rarely on the surface — and that a little precision about what does not exist is a healthy place to start.',
    ],
  },
  principles: [
    {
      title: 'Measure before you model',
      detail: 'A model is a compression of measurements. Building one before measuring is a way to be confidently wrong faster.',
    },
    {
      title: 'Report the uncertainty',
      detail: 'Intervals, decay profiles and failure conditions belong next to the estimate, not in an appendix nobody opens.',
    },
    {
      title: 'Costs are part of the hypothesis',
      detail: 'A signal that does not clear its own spread, fees and latency is not a weak signal. It is not a signal.',
    },
    {
      title: 'Label everything',
      detail: 'Simulated data says so in the interface, adjacent to the figure, every time. Credibility is not a reason to blur that line.',
    },
  ],
  closing: {
    headline: 'The market never stops moving. Neither does research.',
    body: 'If your work is systematic, sceptical and willing to be measured, we would like to hear about it.',
  },
} as const;
