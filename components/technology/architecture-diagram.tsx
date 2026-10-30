import { Eyebrow } from '@/components/shared/primitives';

type Layer = {
  readonly label: string;
  readonly nodes: readonly { readonly name: string; readonly detail: string }[];
};

const layers: readonly Layer[] = [
  {
    label: 'Data Ingestion',
    nodes: [
      { name: 'Market Data Feed', detail: 'Sequenced, timestamped' },
      { name: 'Reference Data', detail: 'Venues, contracts, calendars' },
      { name: 'Historical Store', detail: 'Columnar, immutable' },
    ],
  },
  {
    label: 'Normalisation',
    nodes: [
      { name: 'Schema Mapping', detail: 'One internal vocabulary' },
      { name: 'Gap Detection', detail: 'Sequence + clock checks' },
      { name: 'Quality Gates', detail: 'Reject, quarantine, log' },
    ],
  },
  {
    label: 'Strategy & Backtest',
    nodes: [
      { name: 'Feature Store', detail: 'Deterministic windows' },
      { name: 'Signal Research', detail: 'Out-of-sample first' },
      { name: 'Replay Engine', detail: 'Fill + cost models' },
    ],
  },
  {
    label: 'Execution & Monitoring',
    nodes: [
      { name: 'Order Construction', detail: 'Idempotent state machine' },
      { name: 'Risk Checks', detail: 'Limits before send' },
      { name: 'Telemetry', detail: 'Latency, rejects, drift' },
    ],
  },
];

/**
 * Design-system §14.2. A static diagram, not an interactive one: four layers,
 * nodes as cards, orthogonal flow, no motion (an animated edge would imply live
 * traffic the site cannot claim). The text alternative is part of the design —
 * a visually-hidden `<ol>` enumerates every layer and node in reading order.
 */
export function ArchitectureDiagram() {
  return (
    <figure aria-labelledby="architecture-diagram-caption" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {layers.map((layer, layerIndex) => (
          <div key={layer.label} className="flex flex-col gap-2">
            <div className="grid gap-2 rounded-md border border-border bg-surface-card p-4 md:grid-cols-[8rem_1fr]">
              <p className="min-w-0 font-mono text-eyebrow tracking-[0.14em] text-text-tertiary uppercase [overflow-wrap:anywhere]">{layer.label}</p>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {layer.nodes.map((node) => (
                  <li key={node.name} className="flex min-w-0 flex-col gap-0.5 rounded-sm border border-border bg-surface-1 px-3 py-2">
                    <span className="truncate font-mono text-caption text-text-primary">{node.name}</span>
                    <span className="min-w-0 font-mono text-caption text-text-tertiary [overflow-wrap:anywhere]">{node.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            {layerIndex < layers.length - 1 ? (
              <p aria-hidden="true" className="pl-4 font-mono text-caption text-border-strong">
                ↓
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <figcaption id="architecture-diagram-caption" className="max-w-[60ch] font-mono text-caption text-text-tertiary">
        Reference architecture, top to bottom. Data flows from ingestion through normalisation into strategy and
        backtest, and only then into execution and monitoring. This is a described design, not a claim about a
        running deployment.
      </figcaption>

      <div className="sr-only">
        <p>Diagram text alternative: four layers in flow order.</p>
        <ol>
          {layers.map((layer) => (
            <li key={layer.label}>
              <p>{layer.label}</p>
              <ul>
                {layer.nodes.map((node) => (
                  <li key={node.name}>
                    {node.name} — {node.detail}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <p>Flow direction: ingestion feeds normalisation, which feeds strategy and backtest, which feeds execution and monitoring. There is no return path drawn.</p>
      </div>
    </figure>
  );
}

export function ArchitectureLegend() {
  return (
    <div className="flex flex-col gap-2">
      <Eyebrow>Reading the diagram</Eyebrow>
      <p className="max-w-[60ch] text-body-sm text-text-secondary">
        Each box is a service boundary with an explicit contract. Edges carry meaning, so they use the strong border
        token rather than a decorative hairline; nothing in the diagram animates.
      </p>
    </div>
  );
}
