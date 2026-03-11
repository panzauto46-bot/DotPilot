import { useEffect, useMemo, useState } from 'react';
import {
  Vault,
  ArrowDownToLine,
  ArrowUpFromLine,
  Gift,
  Shield,
  TrendingUp,
  AlertTriangle,
  Check,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react';
import { DefiOpportunity, Token, VaultActionResult, VaultPosition, VaultRuntimeState } from '../types';
import { cn } from '../utils/cn';
import { getPrimaryAssetSymbol, getUsdValue } from '../utils/portfolio';

interface VaultPageProps {
  walletConnected: boolean;
  selectedStrategyId: string | null;
  positions: VaultPosition[];
  opportunities: DefiOpportunity[];
  tokens: Token[];
  vaultRuntime: VaultRuntimeState;
  syncingVault: boolean;
  vaultSyncError: string;
  onSelectStrategy: (strategyId: string) => void;
  onDeposit: (strategyId: string, amount: string) => Promise<VaultActionResult>;
  onWithdraw: (positionId: string) => Promise<VaultActionResult>;
  onRefreshVault: () => Promise<void>;
  onConnectWallet: () => void;
}

interface FeedbackState {
  tone: 'success' | 'error' | 'info';
  title: string;
  detail: string;
}

type VaultTab = 'positions' | 'deposit' | 'withdraw';

export function VaultPage({
  walletConnected,
  selectedStrategyId,
  positions,
  opportunities,
  tokens,
  vaultRuntime,
  syncingVault,
  vaultSyncError,
  onSelectStrategy,
  onDeposit,
  onWithdraw,
  onRefreshVault,
  onConnectWallet,
}: VaultPageProps) {
  const [activeTab, setActiveTab] = useState<VaultTab>('positions');
  const [depositAmount, setDepositAmount] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [depositPending, setDepositPending] = useState(false);
  const [withdrawPendingId, setWithdrawPendingId] = useState<string | null>(null);
  const [refreshPending, setRefreshPending] = useState(false);

  const selectedStrategy = useMemo(
    () =>
      opportunities.find((opportunity) => opportunity.id === selectedStrategyId) ??
      opportunities[0] ??
      null,
    [opportunities, selectedStrategyId]
  );

  const selectedBaseAsset = selectedStrategy
    ? getPrimaryAssetSymbol(selectedStrategy.asset)
    : 'DOT';
  const selectedToken = tokens.find((token) => token.symbol === selectedBaseAsset) ?? null;

  const totalDepositedUsd = positions.reduce(
    (sum, position) => sum + getUsdValue(position.deposited, position.baseAsset, tokens),
    0
  );
  const totalCurrentUsd = positions.reduce(
    (sum, position) => sum + getUsdValue(position.currentValue, position.baseAsset, tokens),
    0
  );
  const totalRewardsUsd = positions.reduce(
    (sum, position) => sum + getUsdValue(position.rewards, position.baseAsset, tokens),
    0
  );

  useEffect(() => {
    if (selectedStrategyId) {
      setActiveTab('deposit');
    }
  }, [selectedStrategyId]);

  const runtimeToneClasses =
    vaultRuntime.mode === 'onchain'
      ? 'border-green-500/20 bg-green-500/10 text-green-300'
      : vaultRuntime.mode === 'simulation'
        ? 'border-dot-cyan/20 bg-dot-cyan/10 text-surface-100'
        : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200';

  const depositDisabled =
    depositPending ||
    !depositAmount ||
    Number.parseFloat(depositAmount) <= 0 ||
    vaultRuntime.mode === 'configuration_required';

  const handleDeposit = async () => {
    if (!selectedStrategy) {
      setFeedback({
        tone: 'error',
        title: 'Strategy Required',
        detail: 'Select a strategy before submitting a deposit.',
      });
      return;
    }

    setDepositPending(true);
    setFeedback({
      tone: 'info',
      title: vaultRuntime.mode === 'onchain' ? 'Awaiting Wallet Confirmation' : 'Processing Deposit',
      detail:
        vaultRuntime.mode === 'onchain'
          ? 'Approve the transaction in MetaMask and wait for on-chain confirmation.'
          : vaultRuntime.detail,
    });

    const result = await onDeposit(selectedStrategy.id, depositAmount);

    setFeedback({
      tone: result.ok ? 'success' : 'error',
      title: result.ok
        ? result.mode === 'onchain'
          ? 'On-Chain Deposit Confirmed'
          : 'Demo Deposit Confirmed'
        : 'Deposit Failed',
      detail: result.message,
    });

    if (result.ok) {
      setDepositAmount('');
      setActiveTab('positions');
    }

    setDepositPending(false);
  };

  const handleWithdraw = async (positionId: string) => {
    setWithdrawPendingId(positionId);
    setFeedback({
      tone: 'info',
      title: vaultRuntime.mode === 'onchain' ? 'Awaiting Wallet Confirmation' : 'Processing Withdrawal',
      detail:
        vaultRuntime.mode === 'onchain'
          ? 'Approve the withdrawal in MetaMask and wait for contract confirmation.'
          : vaultRuntime.detail,
    });

    const result = await onWithdraw(positionId);

    setFeedback({
      tone: result.ok ? 'success' : 'error',
      title: result.ok
        ? result.mode === 'onchain'
          ? 'On-Chain Withdraw Confirmed'
          : 'Demo Withdraw Completed'
        : 'Withdraw Failed',
      detail: result.message,
    });

    if (result.ok) {
      setActiveTab('positions');
    }

    setWithdrawPendingId(null);
  };

  const handleRefresh = async () => {
    setRefreshPending(true);
    setFeedback({
      tone: 'info',
      title: 'Refreshing Positions',
      detail: 'Pulling the latest open positions from the vault contract.',
    });

    try {
      await onRefreshVault();
      setFeedback({
        tone: 'success',
        title: 'Positions Refreshed',
        detail: 'The latest on-chain positions are now loaded in DotPilot.',
      });
    } catch (caughtError) {
      setFeedback({
        tone: 'error',
        title: 'Refresh Failed',
        detail: caughtError instanceof Error ? caughtError.message : 'The vault positions could not be refreshed.',
      });
    }

    setRefreshPending(false);
  };

  if (!walletConnected) {
    return (
      <div className="animate-fade-in space-y-6">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <Vault size={22} className="text-dot-pink" />
            Smart Vault
          </h2>
          <p className="mt-1 text-sm text-surface-300">
            Connect a wallet to move from AI recommendation into the vault execution flow.
          </p>
        </div>

        <div className="rounded-2xl border border-surface-600 bg-surface-700/50 p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-dot-pink to-dot-purple text-white animate-float">
            <Vault size={28} />
          </div>
          <h3 className="text-lg font-semibold text-white">Vault access is locked until wallet connection</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-surface-300">
            The vault flow is where DotPilot proves execution. Connect MetaMask for live contract
            transactions or use Demo Wallet for local portfolio simulation.
          </p>
          <button
            onClick={onConnectWallet}
            className="mt-6 rounded-xl bg-gradient-to-r from-dot-pink to-dot-purple px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-dot-pink/20 transition-opacity hover:opacity-90"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <Vault size={22} className="text-dot-pink" />
            Smart Vault
          </h2>
          <p className="mt-1 text-sm text-surface-300">
            Execute the main DotPilot flow and manage active DeFi positions.
          </p>
        </div>

        {vaultRuntime.mode === 'onchain' && (
          <button
            onClick={() => void handleRefresh()}
            disabled={syncingVault || refreshPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-500 bg-surface-700/70 px-4 py-2 text-sm text-surface-100 transition-colors hover:border-dot-pink/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={14} className={cn((syncingVault || refreshPending) && 'animate-spin')} />
            {syncingVault || refreshPending ? 'Syncing' : 'Refresh Positions'}
          </button>
        )}
      </div>

      <div className={cn('rounded-xl border px-4 py-3', runtimeToneClasses)}>
        <p className="text-sm font-semibold">{vaultRuntime.label}</p>
        <p className="mt-1 text-xs leading-relaxed opacity-90">{vaultRuntime.detail}</p>
      </div>

      {vaultSyncError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {vaultSyncError}
        </div>
      )}

      {feedback && (
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl border px-4 py-3 animate-slide-in',
            feedback.tone === 'success'
              ? 'border-green-500/20 bg-green-500/10'
              : feedback.tone === 'info'
                ? 'border-dot-cyan/20 bg-dot-cyan/10'
                : 'border-red-500/20 bg-red-500/10'
          )}
        >
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full',
              feedback.tone === 'success'
                ? 'bg-green-500/20 text-green-400'
                : feedback.tone === 'info'
                  ? 'bg-dot-cyan/20 text-dot-cyan'
                  : 'bg-red-500/20 text-red-400'
            )}
          >
            {feedback.tone === 'success' ? (
              <Check size={16} />
            ) : feedback.tone === 'info' ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <AlertTriangle size={16} />
            )}
          </div>
          <div>
            <p
              className={cn(
                'text-sm font-medium',
                feedback.tone === 'success'
                  ? 'text-green-400'
                  : feedback.tone === 'info'
                    ? 'text-dot-cyan'
                    : 'text-red-400'
              )}
            >
              {feedback.title}
            </p>
            <p
              className={cn(
                'text-xs',
                feedback.tone === 'success'
                  ? 'text-green-300'
                  : feedback.tone === 'info'
                    ? 'text-surface-200'
                    : 'text-red-300'
              )}
            >
              {feedback.detail}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-surface-600 bg-surface-700/50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <ArrowDownToLine size={16} className="text-dot-cyan" />
            <span className="text-xs text-surface-300">Total Deposited</span>
          </div>
          <p className="text-xl font-bold text-white">
            ${totalDepositedUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-xl border border-surface-600 bg-surface-700/50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp size={16} className="text-dot-pink" />
            <span className="text-xs text-surface-300">Current Value</span>
          </div>
          <p className="text-xl font-bold text-white">
            ${totalCurrentUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-0.5 text-xs text-green-400">
            {positions.length > 0 ? `${positions.length} active positions` : 'Ready for first deposit'}
          </p>
        </div>

        <div className="rounded-xl border border-surface-600 bg-surface-700/50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Gift size={16} className="text-green-400" />
            <span className="text-xs text-surface-300">Claimable Rewards</span>
          </div>
          <p className="text-xl font-bold text-white">${totalRewardsUsd.toFixed(2)}</p>
          <p className="mt-1.5 text-xs text-surface-300">
            Rewards increase once positions remain active.
          </p>
        </div>
      </div>

      <div className="flex w-fit gap-1 rounded-xl border border-surface-600 bg-surface-700 p-1">
        {[
          { key: 'positions', label: 'Positions', icon: <Shield size={14} /> },
          { key: 'deposit', label: 'Deposit', icon: <ArrowDownToLine size={14} /> },
          { key: 'withdraw', label: 'Withdraw', icon: <ArrowUpFromLine size={14} /> },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as VaultTab)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-all',
              activeTab === key
                ? 'bg-dot-pink/15 font-medium text-dot-pink'
                : 'text-surface-300 hover:text-white'
            )}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'positions' && (
        <div className="space-y-3">
          {positions.length > 0 ? (
            positions.map((position, index) => (
              <div
                key={position.id}
                className="rounded-xl border border-surface-600 bg-surface-700/50 p-5 transition-colors hover:border-surface-500 animate-fade-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-semibold text-white">{position.strategy}</h3>
                      <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-400">
                        {position.status}
                      </span>
                    </div>
                    <p className="text-xs text-surface-300">{position.asset}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
                    <div>
                      <p className="mb-0.5 text-xs text-surface-400">Deposited</p>
                      <p className="text-sm font-medium text-white">
                        {position.deposited.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{' '}
                        {position.baseAsset}
                      </p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-xs text-surface-400">Current</p>
                      <p className="text-sm font-medium text-white">
                        {position.currentValue.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{' '}
                        {position.baseAsset}
                      </p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-xs text-surface-400">APY</p>
                      <p className="text-sm font-bold text-dot-pink">{position.apy}%</p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-xs text-surface-400">Rewards</p>
                      <p className="text-sm font-medium text-green-400">
                        +{position.rewards.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{' '}
                        {position.baseAsset}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('withdraw')}
                      className="rounded-lg bg-surface-600 px-3 py-2 text-xs text-surface-200 transition-colors hover:bg-surface-500 hover:text-white"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => void handleWithdraw(position.id)}
                      disabled={withdrawPendingId !== null || vaultRuntime.mode === 'configuration_required'}
                      className="inline-flex items-center gap-2 rounded-lg bg-surface-600 px-3 py-2 text-xs text-surface-200 transition-colors hover:bg-surface-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {withdrawPendingId === position.id && <LoaderCircle size={12} className="animate-spin" />}
                      {withdrawPendingId === position.id ? 'Processing' : 'Withdraw'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-surface-600 bg-surface-700/40 p-6 text-center">
              <p className="text-sm text-surface-200">No active vault positions yet.</p>
              <p className="mt-1 text-xs text-surface-400">
                Select a strategy and make your first deposit to activate the vault flow.
              </p>
              <button
                onClick={() => setActiveTab('deposit')}
                className="mt-4 rounded-lg bg-dot-pink/10 px-4 py-2 text-xs font-medium text-dot-pink transition-colors hover:bg-dot-pink/20"
              >
                Open deposit flow
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'deposit' && selectedStrategy && (
        <div className="max-w-xl animate-fade-in">
          <div className="rounded-xl border border-surface-600 bg-surface-700/50 p-6">
            <h3 className="mb-4 font-semibold text-white">Deposit Into Strategy</h3>

            <div className="mb-4">
              <label className="mb-2 block text-xs text-surface-300">Select Strategy</label>
              <div className="space-y-2">
                {opportunities.map((strategy) => {
                  const isSelected = strategy.id === selectedStrategy.id;

                  return (
                    <button
                      key={strategy.id}
                      onClick={() => onSelectStrategy(strategy.id)}
                      className={cn(
                        'w-full rounded-lg border p-3 text-left transition-all',
                        isSelected
                          ? 'border-dot-pink/30 bg-dot-pink/10'
                          : 'border-surface-600 bg-surface-600/30 hover:border-surface-500'
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-white">{strategy.protocol}</p>
                          <p className="mt-0.5 text-xs text-surface-300">
                            {strategy.asset} • {strategy.risk} risk
                          </p>
                        </div>
                        <span className="text-sm font-bold text-dot-pink">{strategy.apy}% APY</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-xs text-surface-300">
                Amount ({selectedBaseAsset})
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={depositAmount}
                  onChange={(event) => setDepositAmount(event.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-surface-500 bg-surface-600 px-4 py-3 pr-24 text-lg text-white placeholder-surface-400 transition-colors focus:border-dot-pink/50 focus:outline-none"
                />
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                  <button
                    onClick={() =>
                      setDepositAmount(
                        selectedToken
                          ? selectedToken.balance.toFixed(2).replace(/\.00$/, '')
                          : '0'
                      )
                    }
                    className="rounded bg-dot-pink/10 px-1.5 py-0.5 text-[10px] text-dot-pink transition-colors hover:bg-dot-pink/20"
                  >
                    MAX
                  </button>
                  <span className="text-sm text-surface-300">{selectedBaseAsset}</span>
                </div>
              </div>
              <p className="mt-1.5 text-xs text-surface-400">
                Available:{' '}
                {selectedToken
                  ? `${selectedToken.balance.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })} ${selectedBaseAsset}`
                  : `0 ${selectedBaseAsset}`}
              </p>
            </div>

            {depositAmount && selectedStrategy && (
              <div className="mb-4 rounded-lg border border-surface-500/50 bg-surface-600/50 p-3">
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-surface-300">Selected Strategy</span>
                  <span className="font-medium text-white">{selectedStrategy.protocol}</span>
                </div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-surface-300">Estimated Annual Return</span>
                  <span className="font-medium text-green-400">
                    +
                    {(
                      Number.parseFloat(depositAmount || '0') *
                      (selectedStrategy.apy / 100)
                    ).toFixed(2)}{' '}
                    {selectedBaseAsset}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-surface-300">Strategy APY</span>
                  <span className="font-medium text-dot-pink">{selectedStrategy.apy}%</span>
                </div>
              </div>
            )}

            <div className="mb-4 flex items-start gap-2 rounded-lg border border-yellow-500/10 bg-yellow-500/5 p-3">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-yellow-400" />
              <p className="text-[11px] leading-relaxed text-yellow-400/80">
                {vaultRuntime.mode === 'onchain'
                  ? 'This wallet path signs real transactions. Review the strategy, network, amount, and transaction preview before confirming in MetaMask.'
                  : vaultRuntime.mode === 'simulation'
                    ? 'Demo Wallet keeps the seeded portfolio local so you can validate the product flow without signing a transaction.'
                    : 'The contract address is not configured yet, so live vault transactions are blocked until VITE_DOTPILOT_VAULT_ADDRESS is set.'}
              </p>
            </div>

            <button
              onClick={() => void handleDeposit()}
              disabled={depositDisabled}
              className={cn(
                'inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all',
                !depositDisabled
                  ? 'bg-gradient-to-r from-dot-pink to-dot-purple text-white shadow-lg shadow-dot-pink/20 hover:opacity-90'
                  : 'cursor-not-allowed bg-surface-600 text-surface-400'
              )}
            >
              {depositPending && <LoaderCircle size={14} className="animate-spin" />}
              {vaultRuntime.mode === 'configuration_required'
                ? 'Contract address required'
                : depositPending
                  ? vaultRuntime.mode === 'onchain'
                    ? 'Waiting for wallet confirmation'
                    : 'Updating demo vault'
                  : depositAmount && Number.parseFloat(depositAmount) > 0
                    ? `Deposit ${depositAmount} ${selectedBaseAsset}`
                    : 'Enter amount'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'withdraw' && (
        <div className="max-w-xl animate-fade-in">
          <div className="rounded-xl border border-surface-600 bg-surface-700/50 p-6">
            <h3 className="mb-4 font-semibold text-white">Withdraw From Position</h3>

            {positions.length > 0 ? (
              <div className="space-y-3">
                {positions.map((position) => (
                  <div
                    key={position.id}
                    className="flex items-center justify-between rounded-lg border border-surface-600 bg-surface-600/30 p-3"
                  >
                    <div>
                      <p className="text-sm text-white">{position.strategy}</p>
                      <p className="text-xs text-surface-300">
                        {position.currentValue.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{' '}
                        {position.baseAsset} available
                      </p>
                    </div>
                    <button
                      onClick={() => void handleWithdraw(position.id)}
                      disabled={withdrawPendingId !== null || vaultRuntime.mode === 'configuration_required'}
                      className="inline-flex items-center gap-2 rounded-lg bg-surface-500 px-4 py-2 text-xs text-white transition-colors hover:bg-surface-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {withdrawPendingId === position.id && <LoaderCircle size={12} className="animate-spin" />}
                      {withdrawPendingId === position.id ? 'Processing' : 'Withdraw'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-surface-600 bg-surface-600/30 p-4 text-sm text-surface-300">
                There are no active positions to withdraw from yet.
              </div>
            )}

            <div className="mt-4 rounded-lg border border-surface-500/30 bg-surface-600/30 p-3">
              <p className="text-xs leading-relaxed text-surface-300">
                {vaultRuntime.mode === 'onchain'
                  ? 'Withdrawals call the deployed vault contract and then refresh the position list from chain state.'
                  : vaultRuntime.mode === 'simulation'
                    ? 'Simulation mode treats withdrawals as direct exits from the selected local position.'
                    : 'Configure the deployed contract address before attempting live withdrawals from MetaMask.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
