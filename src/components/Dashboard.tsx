import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Zap,
  Shield,
  DollarSign,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { portfolioHistory } from '../data/mockData';
import { DefiOpportunity, Page, Token, VaultPosition } from '../types';
import { cn } from '../utils/cn';
import { getUsdValue } from '../utils/portfolio';
import { LandingPage } from './LandingPage';

interface DashboardProps {
  walletConnected: boolean;
  tokens: Token[];
  positions: VaultPosition[];
  opportunities: DefiOpportunity[];
  onNavigate: (page: Page) => void;
  onSelectStrategy: (strategyId: string) => void;
  onConnectWallet: () => void;
}

interface TooltipPayloadItem {
  value: number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (active && payload && payload.length > 0) {
    return (
      <div className="rounded-lg border border-surface-600 bg-surface-700 px-3 py-2 shadow-xl">
        <p className="text-xs text-surface-300">{label}</p>
        <p className="text-sm font-semibold text-white">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
}

export function Dashboard({
  walletConnected,
  tokens,
  positions,
  opportunities,
  onNavigate,
  onSelectStrategy,
  onConnectWallet,
}: DashboardProps) {
  const walletValue = tokens.reduce((sum, token) => sum + token.value, 0);
  const managedValue = positions.reduce(
    (sum, position) => sum + getUsdValue(position.currentValue, position.baseAsset, tokens),
    0
  );
  const totalRewards = positions.reduce(
    (sum, position) => sum + getUsdValue(position.rewards, position.baseAsset, tokens),
    0
  );
  const recommendedOpportunities = opportunities.filter((opportunity) => opportunity.recommended);
  const avgApy =
    recommendedOpportunities.reduce((sum, opportunity) => sum + opportunity.apy, 0) /
    Math.max(recommendedOpportunities.length, 1);

  const stats = [
    {
      label: 'Wallet Value',
      value: `$${walletValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      change: '+5.3%',
      positive: true,
      icon: <DollarSign size={18} />,
      color: 'from-dot-pink to-dot-purple',
    },
    {
      label: 'Managed in Vault',
      value: `$${managedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      change: positions.length > 0 ? `${positions.length} active` : 'Ready to deploy',
      positive: true,
      icon: <Zap size={18} />,
      color: 'from-dot-cyan to-dot-blue',
    },
    {
      label: 'Claimable Rewards',
      value: `$${totalRewards.toFixed(2)}`,
      change: positions.length > 0 ? 'Yield in progress' : 'Start earning',
      positive: true,
      icon: <Activity size={18} />,
      color: 'from-green-400 to-emerald-600',
    },
    {
      label: 'Avg Opportunity APY',
      value: `${avgApy.toFixed(1)}%`,
      change: `${recommendedOpportunities.length} curated picks`,
      positive: true,
      icon: <Shield size={18} />,
      color: 'from-dot-purple to-indigo-600',
    },
  ];

  if (!walletConnected) {
    return (
      <LandingPage
        opportunities={opportunities}
        onConnectWallet={onConnectWallet}
        onNavigate={onNavigate}
        onSelectStrategy={onSelectStrategy}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="rounded-xl border border-surface-600 bg-surface-700/50 p-4 transition-colors hover:border-surface-500"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-surface-300">{stat.label}</span>
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white',
                  stat.color
                )}
              >
                {stat.icon}
              </div>
            </div>
            <p className="mb-1 text-xl font-bold text-white">{stat.value}</p>
            <div className="flex items-center gap-1">
              {stat.positive ? (
                <TrendingUp size={12} className="text-green-400" />
              ) : (
                <TrendingDown size={12} className="text-red-400" />
              )}
              <span
                className={cn('text-xs', stat.positive ? 'text-green-400' : 'text-red-400')}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-surface-600 bg-surface-700/50 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Portfolio Momentum</h3>
              <p className="mt-0.5 text-xs text-surface-300">
                Wallet plus managed vault positions
              </p>
            </div>
            <button
              onClick={() => onNavigate('portfolio')}
              className="flex items-center gap-1 text-xs text-dot-pink transition-colors hover:text-dot-pink-light"
            >
              Open portfolio <ArrowUpRight size={12} />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioHistory}>
                <defs>
                  <linearGradient id="dashboardGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E6007A" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#E6007A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#5A6078', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#5A6078', fontSize: 11 }}
                  tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#E6007A"
                  strokeWidth={2}
                  fill="url(#dashboardGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-surface-600 bg-surface-700/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-white">Wallet Assets</h3>
            <button
              onClick={() => onNavigate('portfolio')}
              className="flex items-center gap-1 text-xs text-dot-pink transition-colors hover:text-dot-pink-light"
            >
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {tokens.map((token) => (
              <div
                key={token.symbol}
                className="flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-surface-600/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
                    style={{ backgroundColor: `${token.color}20`, color: token.color }}
                  >
                    {token.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{token.symbol}</p>
                    <p className="text-xs text-surface-300">
                      {token.balance.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">${token.value.toLocaleString()}</p>
                  <p
                    className={cn(
                      'text-xs',
                      token.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                    )}
                  >
                    {token.change24h >= 0 ? '+' : ''}
                    {token.change24h}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-surface-600 bg-surface-700/50 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">Recommended Opportunities</h3>
            <p className="mt-0.5 text-xs text-surface-300">
              AI-ready strategies matched to the DotPilot demo flow
            </p>
          </div>
          <button
            onClick={() => onNavigate('strategies')}
            className="flex items-center gap-1 text-xs text-dot-pink transition-colors hover:text-dot-pink-light"
          >
            Explore all <ArrowUpRight size={12} />
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {recommendedOpportunities.map((opportunity) => (
            <div
              key={opportunity.id}
              className="group rounded-xl border border-surface-500/50 bg-surface-600/40 p-4 transition-all hover:border-dot-pink/30"
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-medium',
                    opportunity.risk === 'Low'
                      ? 'bg-green-500/15 text-green-400'
                      : opportunity.risk === 'Medium'
                        ? 'bg-yellow-500/15 text-yellow-400'
                        : 'bg-red-500/15 text-red-400'
                  )}
                >
                  {opportunity.risk} Risk
                </span>
                <span className="text-[10px] text-surface-300">{opportunity.type}</span>
              </div>
              <p className="mb-1 text-sm font-medium text-white">{opportunity.protocol}</p>
              <p className="mb-3 text-xs text-surface-300">{opportunity.asset}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-surface-400">APY</p>
                  <p className="text-lg font-bold text-dot-pink">{opportunity.apy}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-surface-400">TVL</p>
                  <p className="text-sm text-surface-200">{opportunity.tvl}</p>
                </div>
              </div>
              <button
                onClick={() => onSelectStrategy(opportunity.id)}
                className="mt-3 w-full rounded-lg bg-dot-pink/10 py-2 text-xs font-medium text-dot-pink opacity-100 transition-colors hover:bg-dot-pink/20 md:opacity-0 md:group-hover:opacity-100"
              >
                Review in Vault
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
