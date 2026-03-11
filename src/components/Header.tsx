import { Wallet, Bell, Copy, Check, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { NotificationItem, Token, WalletProvider } from '../types';
import { cn } from '../utils/cn';

interface HeaderProps {
  walletConnected: boolean;
  walletAddress: string;
  walletProvider: WalletProvider | null;
  tokens: Token[];
  notifications: NotificationItem[];
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
}

function getWalletLabel(walletAddress: string) {
  if (!walletAddress) return '';
  return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
}

export function Header({
  walletConnected,
  walletAddress,
  walletProvider,
  tokens,
  notifications,
  onConnectWallet,
  onDisconnectWallet,
}: HeaderProps) {
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [copied, setCopied] = useState(false);

  const walletLabel = getWalletLabel(walletAddress);
  const providerLabel = walletProvider === 'metamask' ? 'MetaMask' : 'Demo Wallet';

  const handleCopy = async () => {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-600 bg-surface-800/80 px-4 backdrop-blur-md sm:px-6">
      <div>
        <h2 className="text-base font-semibold text-white">DotPilot MVP</h2>
        <p className="text-xs text-surface-300">
          {walletConnected
            ? 'Your wallet is connected and ready for the vault flow.'
            : 'Connect a wallet to unlock assistant, strategies, portfolio, and vault actions.'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-surface-600 bg-surface-700 px-3 py-1.5 sm:flex">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-surface-200">Polkadot Hub EVM</span>
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowWalletMenu(false);
            }}
            className="relative rounded-lg p-2 text-surface-300 transition-colors hover:bg-surface-700 hover:text-white"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-dot-pink text-[10px] font-bold text-white">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-surface-600 bg-surface-700 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-surface-600 px-4 py-3">
                <span className="text-sm font-semibold text-white">Activity</span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-surface-300 transition-colors hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'border-b border-surface-600/50 px-4 py-3 last:border-0',
                      notification.unread && 'bg-dot-pink/5'
                    )}
                  >
                    <p className="text-xs text-surface-100">{notification.text}</p>
                    <p className="mt-1 text-[10px] text-surface-300">{notification.time}</p>
                  </div>
                ))
              ) : (
                <div className="px-4 py-5 text-xs text-surface-300">
                  No vault or wallet activity yet.
                </div>
              )}
            </div>
          )}
        </div>

        {walletConnected ? (
          <div className="relative">
            <button
              onClick={() => {
                setShowWalletMenu(!showWalletMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-surface-600 bg-surface-700 px-3 py-2 transition-colors hover:border-dot-pink/40"
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-dot-pink to-dot-purple" />
              <span className="hidden text-sm font-medium text-white sm:block">{walletLabel}</span>
              <ChevronDown size={14} className="text-surface-300" />
            </button>

            {showWalletMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-xl border border-surface-600 bg-surface-700 shadow-2xl animate-fade-in">
                <div className="border-b border-surface-600 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-surface-300">Connected Wallet</span>
                    <span className="text-[10px] text-green-400">{providerLabel}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-mono text-white">{walletLabel}</span>
                    <button
                      onClick={handleCopy}
                      className="text-surface-300 transition-colors hover:text-white"
                    >
                      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="border-b border-surface-600 px-4 py-2">
                  <p className="mb-2 text-xs text-surface-300">Wallet Assets</p>
                  {tokens.slice(0, 3).map((token) => (
                    <div key={token.symbol} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <span style={{ color: token.color }}>{token.icon}</span>
                        <span className="text-xs text-white">{token.symbol}</span>
                      </div>
                      <span className="text-xs text-surface-200">
                        {token.balance.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 p-2">
                  <button
                    onClick={() => {
                      onDisconnectWallet();
                      setShowWalletMenu(false);
                    }}
                    className="flex-1 rounded-lg px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onConnectWallet}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-dot-pink to-dot-purple px-4 py-2 text-sm font-medium text-white shadow-lg shadow-dot-pink/20 transition-opacity hover:opacity-90"
          >
            <Wallet size={16} />
            <span className="hidden sm:inline">Connect Wallet</span>
          </button>
        )}
      </div>
    </header>
  );
}
