import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Compass,
  Layers3,
  Shield,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react';
import { DefiOpportunity, Page } from '../types';
import { cn } from '../utils/cn';

interface LandingPageProps {
  opportunities: DefiOpportunity[];
  onConnectWallet: () => void;
  onNavigate: (page: Page) => void;
  onSelectStrategy: (strategyId: string) => void;
}

const flowSteps = [
  {
    title: 'Connect once',
    description: 'Unlock assistant, strategies, portfolio, and the full vault execution flow.',
    icon: <Wallet size={16} />,
  },
  {
    title: 'Ask the AI',
    description: 'Get a strategy suggestion grounded in the same opportunities shown on screen.',
    icon: <Bot size={16} />,
  },
  {
    title: 'Execute the flow',
    description: 'Move from recommendation into the vault flow without switching products.',
    icon: <Zap size={16} />,
  },
];

const productSignals = [
  {
    title: 'AI-guided DeFi',
    description: 'Recommendations stay tied to live product choices instead of generic chat answers.',
    icon: <BrainCircuit size={18} />,
  },
  {
    title: 'Vault-first execution',
    description: 'The core product promise is one clean path from intent to on-chain action.',
    icon: <Layers3 size={18} />,
  },
  {
    title: 'Risk made visible',
    description: 'Yield, allocation, and risk labels stay readable for non-expert users.',
    icon: <Shield size={18} />,
  },
];

const proofRows = [
  'Curated strategy cards matched to the assistant output',
  'Single execution flow designed for hackathon demo reliability',
  'Portfolio state updates after deposit and withdraw actions',
];

export function LandingPage({
  opportunities,
  onConnectWallet,
  onNavigate,
  onSelectStrategy,
}: LandingPageProps) {
  const featured = opportunities.filter((opportunity) => opportunity.recommended).slice(0, 3);
  const leadStrategy = featured[0] ?? opportunities[0];

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="landing-hero relative overflow-hidden rounded-[2rem] border border-surface-600 bg-surface-800/70 px-6 py-8 shadow-2xl shadow-black/20 lg:px-8 lg:py-10">
        <div className="landing-hero-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="landing-hero-glow landing-hero-glow-pink pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full" />
        <div className="landing-hero-glow landing-hero-glow-cyan pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full" />

        <div className="landing-flow-layer pointer-events-none absolute inset-0 overflow-hidden">
          <div className="landing-flow landing-flow-one" />
          <div className="landing-flow landing-flow-two" />
          <div className="landing-flow landing-flow-three" />
        </div>

        <div className="relative grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-dot-pink/20 bg-dot-pink/10 px-3 py-1 text-xs font-medium text-dot-pink">
              <Sparkles size={14} />
              AI-powered DeFi navigator for Polkadot Hub
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl xl:text-6xl">
                Navigate yield with a living interface, not a static dashboard.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-surface-200 sm:text-lg">
                DotPilot combines strategy discovery, AI guidance, and a vault execution flow into
                one polished product experience built for the Polkadot Solidity Hackathon.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={onConnectWallet}
                className="rounded-xl bg-gradient-to-r from-dot-pink via-[#cb0d88] to-dot-purple px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-dot-pink/25 transition-all hover:-translate-y-0.5 hover:opacity-95"
              >
                Connect Wallet
              </button>
              <button
                onClick={() => onNavigate('strategies')}
                className="rounded-xl border border-surface-500 bg-surface-700/70 px-5 py-3 text-sm text-surface-100 transition-all hover:-translate-y-0.5 hover:border-surface-400 hover:text-white"
              >
                Explore Strategies
              </button>
              {leadStrategy && (
                <button
                  onClick={() => onSelectStrategy(leadStrategy.id)}
                  className="inline-flex items-center gap-2 rounded-xl border border-dot-cyan/25 bg-dot-cyan/10 px-5 py-3 text-sm text-dot-cyan transition-all hover:-translate-y-0.5 hover:bg-dot-cyan/15"
                >
                  Open Featured Flow
                  <ArrowRight size={14} />
                </button>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {flowSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="landing-info-card rounded-2xl border border-surface-600 bg-surface-700/45 p-4"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-dot-pink">
                    {step.icon}
                  </div>
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="mt-1 text-xs leading-6 text-surface-300">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="landing-stage relative min-h-[420px]">
            <div className="landing-orbit landing-orbit-primary" />
            <div className="landing-orbit landing-orbit-secondary" />

            <div className="landing-chip landing-chip-top">DOT</div>
            <div className="landing-chip landing-chip-left">AI</div>
            <div className="landing-chip landing-chip-right">Vault</div>

            <div className="landing-stack">
              <div className="landing-stack-shadow" />
              <div className="landing-card landing-card-back" />
              <div className="landing-card landing-card-mid" />
              <div className="landing-card landing-card-front">
                <div className="landing-card-header">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-dot-cyan">Flow Engine</p>
                    <h3 className="mt-2 text-2xl font-bold text-white">DotPilot Command Layer</h3>
                  </div>
                  <div className="landing-badge">Live Demo Flow</div>
                </div>

                <div className="landing-card-metrics">
                  <div className="landing-metric">
                    <span className="text-[11px] uppercase tracking-[0.24em] text-surface-400">Path</span>
                    <strong className="mt-2 block text-lg text-white">AI to Vault</strong>
                  </div>
                  <div className="landing-metric">
                    <span className="text-[11px] uppercase tracking-[0.24em] text-surface-400">Target</span>
                    <strong className="mt-2 block text-lg text-white">Polkadot Hub</strong>
                  </div>
                </div>

                <div className="landing-stream">
                  <div className="landing-stream-label">
                    <Compass size={14} />
                    Strategy signal
                  </div>
                  <div className="landing-stream-track">
                    <span className="landing-stream-node landing-stream-node-one" />
                    <span className="landing-stream-node landing-stream-node-two" />
                    <span className="landing-stream-node landing-stream-node-three" />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-2xl border border-white/6 bg-surface-700/55 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.22em] text-surface-400">
                        Featured recommendation
                      </span>
                      <span className="rounded-full bg-dot-pink/12 px-2 py-1 text-[10px] text-dot-pink">
                        AI ready
                      </span>
                    </div>

                    {featured.map((opportunity, index) => (
                      <button
                        key={opportunity.id}
                        onClick={() => onSelectStrategy(opportunity.id)}
                        className={cn(
                          'group mb-2 flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition-all last:mb-0',
                          index === 0
                            ? 'border-dot-pink/25 bg-dot-pink/10 hover:border-dot-pink/40'
                            : 'border-white/6 bg-white/[0.02] hover:border-white/12'
                        )}
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{opportunity.protocol}</p>
                          <p className="mt-1 text-xs text-surface-300">
                            {opportunity.asset} • {opportunity.risk} risk
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-dot-pink">{opportunity.apy}%</p>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-surface-400">
                            APY
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-white/6 bg-surface-700/45 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-surface-400">Judging signal</p>
                    <div className="mt-4 space-y-3">
                      {proofRows.map((row) => (
                        <div
                          key={row}
                          className="flex items-start gap-2 rounded-xl border border-white/6 bg-white/[0.02] px-3 py-3 text-xs leading-6 text-surface-200"
                        >
                          <div className="mt-1 h-2 w-2 rounded-full bg-dot-cyan shadow-[0_0_14px_rgba(83,203,200,0.45)]" />
                          {row}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="landing-panel rounded-[1.75rem] border border-surface-600 bg-surface-700/40 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-surface-400">Why it feels premium</p>
              <h2 className="mt-2 text-2xl font-bold text-white">A single story, carried by motion</h2>
            </div>
            <div className="landing-panel-pulse" />
          </div>

          <div className="space-y-3">
            {productSignals.map((signal) => (
              <div
                key={signal.title}
                className="rounded-2xl border border-surface-600 bg-surface-800/65 p-4 transition-colors hover:border-surface-500"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-dot-pink/10 text-dot-pink">
                  {signal.icon}
                </div>
                <p className="text-base font-semibold text-white">{signal.title}</p>
                <p className="mt-2 text-sm leading-7 text-surface-300">{signal.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-marquee-wrap rounded-[1.75rem] border border-surface-600 bg-surface-700/40 p-6">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.24em] text-surface-400">Motion layer</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Background flow that keeps the page alive</h2>
          </div>

          <div className="landing-marquee-grid">
            <div className="landing-marquee-row">
              <div className="landing-marquee-track">
                {['AI routing', 'Vault execution', 'DOT staking', 'Risk signals', 'Flow state', 'Polkadot Hub'].map((label) => (
                  <span key={`top-${label}`} className="landing-pill">
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="landing-marquee-row landing-marquee-row-reverse">
              <div className="landing-marquee-track">
                {['Strategy engine', 'Assistant handoff', 'Yield explorer', 'Execution proof', 'Portfolio sync', 'Hackathon MVP'].map((label) => (
                  <span key={`bottom-${label}`} className="landing-pill landing-pill-secondary">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {featured.map((opportunity) => (
              <button
                key={`tile-${opportunity.id}`}
                onClick={() => onSelectStrategy(opportunity.id)}
                className="landing-proof-card rounded-2xl border border-surface-600 bg-surface-800/60 p-4 text-left transition-all hover:-translate-y-1 hover:border-dot-pink/30"
              >
                <div className="mb-3 inline-flex rounded-full bg-surface-700 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-surface-400">
                  {opportunity.type}
                </div>
                <p className="text-sm font-semibold text-white">{opportunity.protocol}</p>
                <p className="mt-2 text-xs leading-6 text-surface-300">{opportunity.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
