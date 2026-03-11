import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AIAssistant } from './components/AIAssistant';
import { Strategies } from './components/Strategies';
import { VaultPage } from './components/VaultPage';
import { Portfolio } from './components/Portfolio';
import { WalletModal } from './components/WalletModal';
import { defiOpportunities, tokens as initialTokens } from './data/mockData';
import {
  ActivityItem,
  Page,
  Token,
  VaultPosition,
  WalletProvider,
} from './types';
import { getPrimaryAssetSymbol, getUsdValue, toNotification } from './utils/portfolio';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<unknown>;
    };
  }
}

interface VaultActionResult {
  ok: boolean;
  message: string;
}

interface PersistedAppState {
  currentPage?: Page;
  sidebarCollapsed?: boolean;
  walletAddress?: string;
  walletProvider?: WalletProvider | null;
  selectedStrategyId?: string;
  tokens?: Token[];
  positions?: VaultPosition[];
  activity?: Array<Omit<ActivityItem, 'timestamp'> & { timestamp: string }>;
}

const STORAGE_KEY = 'dotpilot.session-state';
const DEMO_WALLET_ADDRESS = '0x7F4e92Bc1dA5f3E8b291C0aD6eF7B2c48a3C9d1E';
const RESTRICTED_PAGES: Page[] = ['assistant', 'strategies', 'vault', 'portfolio'];
const VALID_PAGES: Page[] = ['dashboard', 'assistant', 'strategies', 'vault', 'portfolio'];

function loadPersistedState(): PersistedAppState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PersistedAppState;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function loadPersistedPage() {
  const persisted = loadPersistedState();
  return persisted?.currentPage && VALID_PAGES.includes(persisted.currentPage)
    ? persisted.currentPage
    : 'dashboard';
}

function loadPersistedSidebarState() {
  const persisted = loadPersistedState();
  if (typeof persisted?.sidebarCollapsed === 'boolean') {
    return persisted.sidebarCollapsed;
  }

  return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
}

function loadPersistedWalletAddress() {
  const persisted = loadPersistedState();
  return typeof persisted?.walletAddress === 'string' ? persisted.walletAddress : '';
}

function loadPersistedWalletProvider() {
  const persisted = loadPersistedState();
  return persisted?.walletProvider === 'metamask' || persisted?.walletProvider === 'demo'
    ? persisted.walletProvider
    : null;
}

function loadPersistedStrategyId() {
  const persisted = loadPersistedState();
  if (
    typeof persisted?.selectedStrategyId === 'string' &&
    defiOpportunities.some((opportunity) => opportunity.id === persisted.selectedStrategyId)
  ) {
    return persisted.selectedStrategyId;
  }

  return defiOpportunities.find((opportunity) => opportunity.recommended)?.id ?? defiOpportunities[0].id;
}

function loadPersistedTokens() {
  const persisted = loadPersistedState();
  if (Array.isArray(persisted?.tokens) && persisted.tokens.length > 0) {
    return persisted.tokens;
  }

  return initialTokens;
}

function loadPersistedPositions() {
  const persisted = loadPersistedState();
  return Array.isArray(persisted?.positions) ? persisted.positions : [];
}

function loadPersistedActivity() {
  const persisted = loadPersistedState();
  if (!Array.isArray(persisted?.activity)) {
    return [];
  }

  return persisted.activity
    .map((item) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }))
    .filter((item) => !Number.isNaN(item.timestamp.getTime()));
}

function getReferenceTokenPrice(symbol: string, tokens: Token[]) {
  const currentToken = tokens.find((token) => token.symbol === symbol);
  if (currentToken && currentToken.balance > 0) {
    return currentToken.value / currentToken.balance;
  }

  const seededToken = initialTokens.find((token) => token.symbol === symbol);
  if (seededToken && seededToken.balance > 0) {
    return seededToken.value / seededToken.balance;
  }

  return 0;
}

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>(loadPersistedPage);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(loadPersistedSidebarState);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState(loadPersistedWalletAddress);
  const [walletProvider, setWalletProvider] = useState<WalletProvider | null>(loadPersistedWalletProvider);
  const [pendingPageAfterConnect, setPendingPageAfterConnect] = useState<Page | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState(loadPersistedStrategyId);
  const [tokens, setTokens] = useState<Token[]>(loadPersistedTokens);
  const [positions, setPositions] = useState<VaultPosition[]>(loadPersistedPositions);
  const [activity, setActivity] = useState<ActivityItem[]>(loadPersistedActivity);

  const walletConnected = walletAddress.length > 0;

  const selectedStrategy = useMemo(
    () => defiOpportunities.find((opportunity) => opportunity.id === selectedStrategyId) ?? null,
    [selectedStrategyId]
  );

  const managedValue = useMemo(
    () =>
      positions.reduce(
        (sum, position) => sum + getUsdValue(position.currentValue, position.baseAsset, tokens),
        0
      ),
    [positions, tokens]
  );

  const walletValue = useMemo(
    () => tokens.reduce((sum, token) => sum + token.value, 0),
    [tokens]
  );

  const portfolioValue = walletValue + managedValue;

  const notifications = useMemo(
    () => activity.slice(0, 3).map(toNotification),
    [activity]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentPage,
        sidebarCollapsed,
        walletAddress,
        walletProvider,
        selectedStrategyId,
        tokens,
        positions,
        activity: activity.map((item) => ({
          ...item,
          timestamp: item.timestamp.toISOString(),
        })),
      } satisfies PersistedAppState)
    );
  }, [
    activity,
    currentPage,
    positions,
    selectedStrategyId,
    sidebarCollapsed,
    tokens,
    walletAddress,
    walletProvider,
  ]);

  useEffect(() => {
    if (!walletConnected && RESTRICTED_PAGES.includes(currentPage)) {
      setCurrentPage('dashboard');
    }
  }, [currentPage, walletConnected]);

  const createActivity = (item: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    setActivity((current) => [
      {
        ...item,
        id:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}`,
        timestamp: new Date(),
      },
      ...current,
    ].slice(0, 12));
  };

  const openVaultForStrategy = (strategyId: string) => {
    setSelectedStrategyId(strategyId);

    if (!walletConnected) {
      setPendingPageAfterConnect('vault');
      setShowWalletModal(true);
      return;
    }

    setCurrentPage('vault');
  };

  const openWalletModal = (nextPage: Page | null = null) => {
    setPendingPageAfterConnect(nextPage);
    setShowWalletModal(true);
  };

  const handleNavigate = (page: Page) => {
    if (!walletConnected && RESTRICTED_PAGES.includes(page)) {
      openWalletModal(page);
      return;
    }

    setCurrentPage(page);
  };

  const handleConnectWallet = async (provider: WalletProvider) => {
    let address = DEMO_WALLET_ADDRESS;

    if (provider === 'metamask') {
      if (!window.ethereum) {
        throw new Error('MetaMask was not detected in this browser.');
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const connectedAddress = Array.isArray(accounts) ? accounts[0] : null;

      if (typeof connectedAddress !== 'string' || connectedAddress.length === 0) {
        throw new Error('No wallet account was returned by MetaMask.');
      }

      address = connectedAddress;
    }

    setWalletAddress(address);
    setWalletProvider(provider);
    setShowWalletModal(false);

    createActivity({
      type: 'connect',
      title: 'Wallet Connected',
      description:
        provider === 'metamask'
          ? 'MetaMask connected and ready for vault actions.'
          : 'Demo wallet connected for the hackathon flow.',
      status: 'Confirmed',
    });

    if (pendingPageAfterConnect) {
      setCurrentPage(pendingPageAfterConnect);
      setPendingPageAfterConnect(null);
      return;
    }

    setCurrentPage('dashboard');
  };

  const handleDisconnectWallet = () => {
    setWalletAddress('');
    setWalletProvider(null);
    setPendingPageAfterConnect(null);

    if (RESTRICTED_PAGES.includes(currentPage)) {
      setCurrentPage('dashboard');
    }
  };

  const handleDeposit = (strategyId: string, amount: number): VaultActionResult => {
    const strategy = defiOpportunities.find((opportunity) => opportunity.id === strategyId);
    if (!strategy) {
      return { ok: false, message: 'The selected strategy could not be found.' };
    }

    const baseAsset = getPrimaryAssetSymbol(strategy.asset);
    const sourceToken = tokens.find((token) => token.symbol === baseAsset);

    if (!sourceToken) {
      return { ok: false, message: `The source asset ${baseAsset} is not available in this wallet.` };
    }

    if (amount <= 0) {
      return { ok: false, message: 'Enter a valid deposit amount.' };
    }

    if (amount > sourceToken.balance) {
      return {
        ok: false,
        message: `Your ${baseAsset} balance is too low for this deposit.`,
      };
    }

    const nextBalance = sourceToken.balance - amount;
    const pricePerUnit = getReferenceTokenPrice(baseAsset, tokens);

    setTokens((current) =>
      current.map((token) =>
        token.symbol === baseAsset
          ? {
              ...token,
              balance: nextBalance,
              value: nextBalance * pricePerUnit,
            }
          : token
      )
    );

    setPositions((current) => {
      const existing = current.find((position) => position.strategyId === strategy.id);
      if (!existing) {
        return [
          {
            id:
              typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `${Date.now()}`,
            strategyId: strategy.id,
            strategy: strategy.protocol,
            asset: strategy.asset,
            baseAsset,
            deposited: amount,
            currentValue: amount,
            apy: strategy.apy,
            rewards: 0,
            status: 'Active',
          },
          ...current,
        ];
      }

      return current.map((position) =>
        position.id === existing.id
          ? {
              ...position,
              deposited: position.deposited + amount,
              currentValue: position.currentValue + amount,
              status: 'Active',
            }
          : position
      );
    });

    createActivity({
      type: 'deposit',
      title: 'Deposit Confirmed',
      description: `Deposited ${amount.toLocaleString()} ${baseAsset} into ${strategy.protocol}.`,
      asset: baseAsset,
      amount,
      status: 'Confirmed',
    });

    return {
      ok: true,
      message: `${amount.toLocaleString()} ${baseAsset} was allocated to ${strategy.protocol}.`,
    };
  };

  const handleWithdraw = (positionId: string): VaultActionResult => {
    const position = positions.find((item) => item.id === positionId);
    if (!position) {
      return { ok: false, message: 'The selected vault position could not be found.' };
    }

    const baseToken = tokens.find((token) => token.symbol === position.baseAsset);
    if (!baseToken) {
      return {
        ok: false,
        message: `The asset ${position.baseAsset} is not available for withdrawal.`,
      };
    }

    const pricePerUnit = getReferenceTokenPrice(position.baseAsset, tokens);
    const nextBalance = baseToken.balance + position.currentValue;

    setTokens((current) =>
      current.map((token) =>
        token.symbol === position.baseAsset
          ? {
              ...token,
              balance: nextBalance,
              value: nextBalance * pricePerUnit,
            }
          : token
      )
    );

    setPositions((current) => current.filter((item) => item.id !== positionId));

    createActivity({
      type: 'withdraw',
      title: 'Withdraw Completed',
      description: `Withdrew ${position.currentValue.toLocaleString()} ${position.baseAsset} from ${position.strategy}.`,
      asset: position.baseAsset,
      amount: position.currentValue,
      status: 'Confirmed',
    });

    return {
      ok: true,
      message: `${position.currentValue.toLocaleString()} ${position.baseAsset} was withdrawn from ${position.strategy}.`,
    };
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            walletConnected={walletConnected}
            tokens={tokens}
            positions={positions}
            opportunities={defiOpportunities}
            onNavigate={setCurrentPage}
            onSelectStrategy={openVaultForStrategy}
            onConnectWallet={() => openWalletModal()}
          />
        );
      case 'assistant':
        return (
          <AIAssistant
            walletConnected={walletConnected}
            opportunities={defiOpportunities}
            totalPortfolioValue={portfolioValue}
            onOpenStrategy={openVaultForStrategy}
            onConnectWallet={() => openWalletModal('vault')}
          />
        );
      case 'strategies':
        return (
          <Strategies
            opportunities={defiOpportunities}
            walletConnected={walletConnected}
            selectedStrategyId={selectedStrategy?.id ?? null}
            onOpenStrategy={openVaultForStrategy}
          />
        );
      case 'vault':
        return (
          <VaultPage
            walletConnected={walletConnected}
            selectedStrategyId={selectedStrategy?.id ?? null}
            positions={positions}
            opportunities={defiOpportunities}
            tokens={tokens}
            onSelectStrategy={setSelectedStrategyId}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
            onConnectWallet={() => openWalletModal('vault')}
          />
        );
      case 'portfolio':
        return (
          <Portfolio
            walletConnected={walletConnected}
            tokens={tokens}
            positions={positions}
            activity={activity}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface-900">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        walletConnected={walletConnected}
      />

      <div
        className={`ml-0 transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-56'
        }`}
      >
        <Header
          walletConnected={walletConnected}
          walletAddress={walletAddress}
          walletProvider={walletProvider}
          tokens={tokens}
          notifications={notifications}
          onConnectWallet={() => openWalletModal()}
          onDisconnectWallet={handleDisconnectWallet}
        />

        <main className="p-4 sm:p-6">
          {renderPage()}
        </main>
      </div>

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => {
          setShowWalletModal(false);
          setPendingPageAfterConnect(null);
        }}
        onConnect={handleConnectWallet}
      />
    </div>
  );
}
