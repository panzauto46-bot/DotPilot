import { useState } from 'react';
import { Search, Filter, ArrowUpDown, Star, Zap } from 'lucide-react';
import { DefiOpportunity } from '../types';
import { cn } from '../utils/cn';

interface StrategiesProps {
  opportunities: DefiOpportunity[];
  walletConnected: boolean;
  selectedStrategyId: string | null;
  onOpenStrategy: (strategyId: string) => void;
}

type SortBy = 'apy' | 'risk';
type FilterRisk = 'All' | 'Low' | 'Medium' | 'High';
type FilterType = 'All' | 'Staking' | 'Yield Farming' | 'Liquidity Pool' | 'Lending';

export function Strategies({
  opportunities,
  walletConnected,
  selectedStrategyId,
  onOpenStrategy,
}: StrategiesProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('apy');
  const [filterRisk, setFilterRisk] = useState<FilterRisk>('All');
  const [filterType, setFilterType] = useState<FilterType>('All');

  const riskOptions: FilterRisk[] = ['All', 'Low', 'Medium', 'High'];
  const typeOptions: FilterType[] = [
    'All',
    'Staking',
    'Yield Farming',
    'Liquidity Pool',
    'Lending',
  ];

  const filteredOpportunities = opportunities
    .filter((opportunity) => {
      if (filterRisk !== 'All' && opportunity.risk !== filterRisk) return false;
      if (filterType !== 'All' && opportunity.type !== filterType) return false;
      if (
        search &&
        !opportunity.protocol.toLowerCase().includes(search.toLowerCase()) &&
        !opportunity.asset.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((left, right) => {
      if (sortBy === 'apy') return right.apy - left.apy;

      const riskOrder = { Low: 0, Medium: 1, High: 2 };
      return riskOrder[left.risk] - riskOrder[right.risk];
    });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <Zap size={22} className="text-dot-pink" />
          Strategy Explorer
        </h2>
        <p className="mt-1 text-sm text-surface-300">
          Compare curated DeFi strategies before moving into the vault flow.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search protocols or assets..."
            className="w-full rounded-lg border border-surface-600 bg-surface-700 py-2.5 pl-9 pr-4 text-sm text-white placeholder-surface-400 transition-colors focus:border-dot-pink/50 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-surface-600 bg-surface-700 px-3 py-2">
            <Filter size={14} className="text-surface-400" />
            <select
              value={filterRisk}
              onChange={(event) => setFilterRisk(event.target.value as FilterRisk)}
              className="cursor-pointer bg-transparent text-sm text-surface-200 focus:outline-none"
            >
              {riskOptions.map((risk) => (
                <option key={risk} value={risk} className="bg-surface-700">
                  {risk === 'All' ? 'All Risk' : `${risk} Risk`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-surface-600 bg-surface-700 px-3 py-2">
            <Filter size={14} className="text-surface-400" />
            <select
              value={filterType}
              onChange={(event) => setFilterType(event.target.value as FilterType)}
              className="cursor-pointer bg-transparent text-sm text-surface-200 focus:outline-none"
            >
              {typeOptions.map((type) => (
                <option key={type} value={type} className="bg-surface-700">
                  {type === 'All' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-surface-600 bg-surface-700 px-3 py-2">
            <ArrowUpDown size={14} className="text-surface-400" />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortBy)}
              className="cursor-pointer bg-transparent text-sm text-surface-200 focus:outline-none"
            >
              <option value="apy" className="bg-surface-700">
                Highest APY
              </option>
              <option value="risk" className="bg-surface-700">
                Lowest Risk
              </option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-surface-400">
          {filteredOpportunities.length} opportunities found
        </p>
        <p className="text-xs text-surface-400">
          {walletConnected
            ? 'Open any strategy to continue into the vault flow.'
            : 'You can browse strategies now and connect a wallet before execution.'}
        </p>
      </div>

      <div className="space-y-3">
        {filteredOpportunities.map((opportunity, index) => (
          <div
            key={opportunity.id}
            className={cn(
              'rounded-xl border bg-surface-700/50 p-5 transition-all group animate-fade-in',
              selectedStrategyId === opportunity.id
                ? 'border-dot-pink/40'
                : 'border-surface-600 hover:border-surface-500'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-white">{opportunity.protocol}</h3>
                  {opportunity.recommended && (
                    <span className="flex items-center gap-1 rounded-full bg-dot-pink/10 px-2 py-0.5 text-[10px] font-medium text-dot-pink">
                      <Star size={10} fill="currentColor" /> AI Recommended
                    </span>
                  )}
                  {selectedStrategyId === opportunity.id && (
                    <span className="rounded-full bg-surface-600 px-2 py-0.5 text-[10px] text-surface-200">
                      Selected for vault
                    </span>
                  )}
                </div>

                <p className="mb-2 text-sm text-surface-300">{opportunity.description}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded bg-surface-600/50 px-2 py-1 text-xs text-surface-400">
                    {opportunity.type}
                  </span>
                  <span className="rounded bg-surface-600/50 px-2 py-1 text-xs text-surface-400">
                    {opportunity.asset}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 lg:gap-8">
                <div className="text-center">
                  <p className="mb-0.5 text-xs text-surface-400">APY</p>
                  <p className="text-xl font-bold text-dot-pink">{opportunity.apy}%</p>
                </div>
                <div className="text-center">
                  <p className="mb-0.5 text-xs text-surface-400">TVL</p>
                  <p className="text-sm font-medium text-white">{opportunity.tvl}</p>
                </div>
                <div className="text-center">
                  <p className="mb-0.5 text-xs text-surface-400">Risk</p>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-medium',
                      opportunity.risk === 'Low'
                        ? 'bg-green-500/15 text-green-400'
                        : opportunity.risk === 'Medium'
                          ? 'bg-yellow-500/15 text-yellow-400'
                          : 'bg-red-500/15 text-red-400'
                    )}
                  >
                    {opportunity.risk}
                  </span>
                </div>
                <button
                  onClick={() => onOpenStrategy(opportunity.id)}
                  className="rounded-lg bg-gradient-to-r from-dot-pink to-dot-purple px-4 py-2 text-sm font-medium text-white shadow-lg shadow-dot-pink/20 transition-opacity hover:opacity-90"
                >
                  {walletConnected ? 'Open Vault Flow' : 'Select Strategy'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-surface-300">No opportunities match your filters.</p>
          <button
            onClick={() => {
              setFilterRisk('All');
              setFilterType('All');
              setSearch('');
            }}
            className="mt-2 text-sm text-dot-pink hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
