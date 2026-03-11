import { useState } from 'react';
import { X, Wallet, Shield, ChevronRight } from 'lucide-react';
import { WalletProvider } from '../types';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (provider: WalletProvider) => Promise<void>;
}

const wallets: {
  id: WalletProvider;
  name: string;
  description: string;
  color: string;
  icon: string;
}[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Connect an injected EVM wallet',
    color: '#F6851B',
    icon: 'M',
  },
  {
    id: 'demo',
    name: 'Demo Wallet',
    description: 'Use the seeded portfolio for the MVP flow',
    color: '#E6007A',
    icon: 'D',
  },
];

export function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const [loadingProvider, setLoadingProvider] = useState<WalletProvider | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConnect = async (provider: WalletProvider) => {
    setError('');
    setLoadingProvider(provider);

    try {
      await onConnect(provider);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Wallet connection failed.');
      setLoadingProvider(null);
      return;
    }

    setLoadingProvider(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-surface-600 bg-surface-800 shadow-2xl animate-fade-in">
        <div className="h-1 bg-gradient-to-r from-dot-pink via-dot-purple to-dot-cyan" />

        <div className="flex items-center justify-between border-b border-surface-600 px-6 py-4">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-dot-pink" />
            <h3 className="font-semibold text-white">Connect Wallet</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-surface-300 transition-colors hover:bg-surface-700 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 p-4">
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => void handleConnect(wallet.id)}
              disabled={loadingProvider !== null}
              className="group flex w-full items-center gap-3 rounded-xl border border-surface-600 bg-surface-700/50 p-3.5 transition-all hover:border-dot-pink/30 hover:bg-surface-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: wallet.color }}
              >
                {wallet.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white">{wallet.name}</p>
                <p className="text-xs text-surface-400">{wallet.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {loadingProvider === wallet.id && (
                  <span className="text-[10px] text-dot-pink">Connecting...</span>
                )}
                <ChevronRight
                  size={16}
                  className="text-surface-400 transition-colors group-hover:text-dot-pink"
                />
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div className="px-4 pb-2">
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </div>
          </div>
        )}

        <div className="border-t border-surface-600 bg-surface-700/30 px-6 py-4">
          <div className="flex items-start gap-2">
            <Shield size={14} className="mt-0.5 shrink-0 text-surface-400" />
            <p className="text-[11px] leading-relaxed text-surface-400">
              For the hackathon MVP, MetaMask enables a real EVM wallet path while Demo Wallet keeps
              the product flow testable without a browser extension.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
