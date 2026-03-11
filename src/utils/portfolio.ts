import { ActivityItem, NotificationItem, Token } from '../types';

export function getPrimaryAssetSymbol(asset: string) {
  if (asset.includes('GLMR')) return 'GLMR';
  if (asset.includes('ASTR')) return 'ASTR';
  if (asset.includes('ACA')) return 'ACA';
  if (asset.includes('USDT')) return 'USDT';
  if (asset.includes('WETH')) return 'WETH';
  return 'DOT';
}

export function getTokenPrice(symbol: string, tokens: Token[]) {
  const token = tokens.find((item) => item.symbol === symbol);
  if (!token || token.balance === 0) return 0;
  return token.value / token.balance;
}

export function getUsdValue(amount: number, symbol: string, tokens: Token[]) {
  return amount * getTokenPrice(symbol, tokens);
}

export function formatRelativeTime(timestamp: Date) {
  const deltaMs = Date.now() - timestamp.getTime();
  const minutes = Math.max(1, Math.floor(deltaMs / 60000));

  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function toNotification(activity: ActivityItem): NotificationItem {
  return {
    id: activity.id,
    text: activity.description,
    time: formatRelativeTime(activity.timestamp),
    unread: true,
  };
}
