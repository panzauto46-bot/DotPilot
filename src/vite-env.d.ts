/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DOTPILOT_VAULT_ADDRESS?: string;
  readonly VITE_DOTPILOT_CHAIN_ID?: string;
  readonly VITE_DOTPILOT_CHAIN_IDS?: string;
  readonly VITE_DOTPILOT_CHAIN_LABEL?: string;
  readonly VITE_DOTPILOT_CHAIN_RPC_URL?: string;
  readonly VITE_DOTPILOT_BLOCK_EXPLORER_URL?: string;
  readonly VITE_DOTPILOT_CHAIN_SYMBOL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
