export interface Token {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  change24h: number;
  icon: string;
  color: string;
}

export interface DefiOpportunity {
  id: string;
  protocol: string;
  type: 'Staking' | 'Yield Farming' | 'Liquidity Pool' | 'Lending';
  asset: string;
  apy: number;
  tvl: string;
  risk: 'Low' | 'Medium' | 'High';
  description: string;
  recommended: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  strategyId?: string;
  ctaLabel?: string;
  modelUsed?: string;
  source?: 'live' | 'fallback';
}

export interface VaultPosition {
  id: string;
  strategyId: string;
  strategy: string;
  asset: string;
  baseAsset: string;
  deposited: number;
  currentValue: number;
  apy: number;
  rewards: number;
  status: 'Active' | 'Pending' | 'Completed';
}

export type VaultRuntimeMode = 'onchain' | 'simulation' | 'configuration_required';

export interface VaultActionResult {
  ok: boolean;
  message: string;
  txHash?: string;
  mode: VaultRuntimeMode;
}

export interface VaultRuntimeState {
  mode: VaultRuntimeMode;
  label: string;
  detail: string;
  contractAddress?: string;
}

export interface PortfolioHistory {
  date: string;
  value: number;
}

export interface ActivityItem {
  id: string;
  type: 'connect' | 'deposit' | 'withdraw' | 'assistant';
  title: string;
  description: string;
  asset?: string;
  amount?: number;
  timestamp: Date;
  status: 'Confirmed' | 'Pending';
}

export interface NotificationItem {
  id: string;
  text: string;
  time: string;
  unread: boolean;
}

export type WalletProvider = 'metamask' | 'demo';

export type Page = 'dashboard' | 'assistant' | 'strategies' | 'vault' | 'portfolio';
