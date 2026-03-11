export interface Eip1193RequestArgs {
  method: string;
  params?: unknown[] | Record<string, unknown>;
}

export interface Eip1193Provider {
  request: (args: Eip1193RequestArgs) => Promise<unknown>;
  isMetaMask?: boolean;
  isBraveWallet?: boolean;
  providers?: Eip1193Provider[];
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export function getInjectedProvider() {
  const injected = window.ethereum;
  if (!injected) {
    return null;
  }

  const providers = Array.isArray(injected.providers) ? injected.providers : [];
  if (providers.length === 0) {
    return injected;
  }

  return (
    providers.find((provider) => provider.isMetaMask) ??
    providers.find((provider) => provider.isBraveWallet) ??
    providers[0]
  );
}
