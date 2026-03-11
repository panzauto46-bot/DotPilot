import {
  PieChart as PieChartIcon,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from 'recharts';
import { portfolioHistory } from '../data/mockData';
import { ActivityItem, Token, VaultPosition } from '../types';
import { cn } from '../utils/cn';
import { formatRelativeTime, getUsdValue } from '../utils/portfolio';

interface PortfolioProps {
  walletConnected: boolean;
  tokens: Token[];
  positions: VaultPosition[];
  activity: ActivityItem[];
}

interface PieTooltipPayloadItem {
  name: string;
  value: number;
}

interface PieTooltipProps {
  active?: boolean;
  payload?: PieTooltipPayloadItem[];
}

function CustomPieTooltip({ active, payload }: PieTooltipProps) {
  if (active && payload && payload.length > 0) {
    return (
      <div className="rounded-lg border border-surface-600 bg-surface-700 px-3 py-2 shadow-xl">
        <p className="text-xs font-medium text-white">{payload[0].name}</p>
        <p className="text-xs text-surface-300">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }

  return null;
}

export function Portfolio({ walletConnected, tokens, positions, activity }: PortfolioProps) {
  const totalValue = tokens.reduce((sum, token) => sum + token.value, 0);
  const managedValue = positions.reduce(
    (sum, position) => sum + getUsdValue(position.currentValue, position.baseAsset, tokens),
    0
  );
  const totalRewards = positions.reduce(
    (sum, position) => sum + getUsdValue(position.rewards, position.baseAsset, tokens),
    0
  );

  const pieData = tokens.map((token) => ({
    name: token.symbol,
    value: token.value,
    color: token.color,
  }));

  if (!walletConnected) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <PieChartIcon size={22} className="text-dot-pink" />
            Portfolio
          </h2>
          <p className="mt-1 text-sm text-surface-300">
            Portfolio insights unlock after wallet connection.
          </p>
        </div>

        <div className="rounded-2xl border border-surface-600 bg-surface-700/50 p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-dot-pink to-dot-purple text-white">
            <Wallet size={24} />
          </div>
          <h3 className="text-lg font-semibold text-white">Connect a wallet to view portfolio details</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-surface-300">
            The portfolio page is designed to show wallet allocation, managed vault value, and recent
            activity after the wallet is connected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <PieChartIcon size={22} className="text-dot-pink" />
          Portfolio
        </h2>
        <p className="mt-1 text-sm text-surface-300">
          Wallet holdings, managed vault capital, and recent execution history.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-surface-600 bg-surface-700/50 p-5">
          <h3 className="mb-1 font-semibold text-white">Wallet Allocation</h3>
          <p className="mb-4 text-xs text-surface-300">
            Total wallet value: ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>

          <div className="mb-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {tokens.map((token) => (
              <div key={token.symbol} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: token.color }}
                  />
                  <span className="text-surface-200">{token.symbol}</span>
                </div>
                <span className="text-surface-300">
                  {((token.value / Math.max(totalValue, 1)) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-surface-600 bg-surface-700/50 p-5 lg:col-span-2">
          <h3 className="mb-1 font-semibold text-white">Performance Snapshot</h3>
          <p className="mb-4 text-xs text-surface-300">
            Demo portfolio trend with live wallet and vault state
          </p>

          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-surface-500/30 bg-surface-600/30 p-3">
              <p className="mb-1 text-xs text-surface-400">Wallet Value</p>
              <p className="text-lg font-bold text-white">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-surface-300">{tokens.length} tracked assets</p>
            </div>
            <div className="rounded-lg border border-surface-500/30 bg-surface-600/30 p-3">
              <p className="mb-1 text-xs text-surface-400">Managed in Vault</p>
              <p className="text-lg font-bold text-dot-pink">${managedValue.toFixed(2)}</p>
              <p className="text-[10px] text-surface-300">{positions.length} active positions</p>
            </div>
            <div className="rounded-lg border border-surface-500/30 bg-surface-600/30 p-3">
              <p className="mb-1 text-xs text-surface-400">Rewards</p>
              <p className="text-lg font-bold text-green-400">${totalRewards.toFixed(2)}</p>
              <p className="text-[10px] text-surface-300">Yield accrued in demo flow</p>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioHistory}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E6007A" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#E6007A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#5A6078', fontSize: 10 }}
                />
                <YAxis hide />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#E6007A"
                  strokeWidth={2}
                  fill="url(#portfolioGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-surface-600 bg-surface-700/50 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-white">Wallet Holdings</h3>
          <span className="text-xs text-surface-400">Live from the connected demo state</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-600 text-xs text-surface-400">
                <th className="pb-3 text-left font-medium">Asset</th>
                <th className="pb-3 text-right font-medium">Balance</th>
                <th className="pb-3 text-right font-medium">Value</th>
                <th className="pb-3 text-right font-medium">24h Change</th>
                <th className="pb-3 text-right font-medium">Allocation</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr
                  key={token.symbol}
                  className="border-b border-surface-600/50 transition-colors last:border-0 hover:bg-surface-600/20"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-sm"
                        style={{ backgroundColor: `${token.color}20`, color: token.color }}
                      >
                        {token.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{token.symbol}</p>
                        <p className="text-xs text-surface-400">{token.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right text-sm text-surface-200">
                    {token.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-right text-sm font-medium text-white">
                    ${token.value.toLocaleString()}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={cn(
                        'flex items-center justify-end gap-0.5 text-sm',
                        token.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                      )}
                    >
                      {token.change24h >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(token.change24h)}%
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-600">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(token.value / Math.max(totalValue, 1)) * 100}%`,
                            backgroundColor: token.color,
                          }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs text-surface-300">
                        {((token.value / Math.max(totalValue, 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-surface-600 bg-surface-700/50 p-5">
          <h3 className="mb-4 font-semibold text-white">Managed Positions</h3>
          {positions.length > 0 ? (
            <div className="space-y-3">
              {positions.map((position) => (
                <div
                  key={position.id}
                  className="rounded-lg border border-surface-600 bg-surface-600/30 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-white">{position.strategy}</p>
                      <p className="mt-1 text-xs text-surface-300">{position.asset}</p>
                    </div>
                    <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] text-green-400">
                      {position.status}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-surface-400">Deposited</p>
                      <p className="mt-1 text-white">
                        {position.deposited.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{' '}
                        {position.baseAsset}
                      </p>
                    </div>
                    <div>
                      <p className="text-surface-400">Current</p>
                      <p className="mt-1 text-white">
                        {position.currentValue.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{' '}
                        {position.baseAsset}
                      </p>
                    </div>
                    <div>
                      <p className="text-surface-400">APY</p>
                      <p className="mt-1 text-dot-pink">{position.apy}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-surface-600 bg-surface-600/30 p-4 text-sm text-surface-300">
              No managed positions yet. Complete a vault deposit to populate this section.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-surface-600 bg-surface-700/50 p-5">
          <h3 className="mb-4 font-semibold text-white">Recent Activity</h3>
          {activity.length > 0 ? (
            <div className="space-y-3">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-surface-600/30 py-2 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold',
                        item.type === 'deposit'
                          ? 'bg-green-500/10 text-green-400'
                          : item.type === 'withdraw'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-dot-pink/10 text-dot-pink'
                      )}
                    >
                      {item.type === 'withdraw' ? (
                        <ArrowDownRight size={14} />
                      ) : (
                        <TrendingUp size={14} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-white">{item.title}</p>
                      <p className="text-xs text-surface-400">{item.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {typeof item.amount === 'number' && item.asset ? (
                      <p className="text-sm font-medium text-white">
                        {item.amount.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{' '}
                        {item.asset}
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-surface-300">{item.status}</p>
                    )}
                    <p className="text-[10px] text-surface-400">{formatRelativeTime(item.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-surface-600 bg-surface-600/30 p-4 text-sm text-surface-300">
              Vault and wallet activity will appear here after the first action.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
