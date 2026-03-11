/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DOTPILOT_VAULT_ADDRESS?: string;
  readonly VITE_DOTPILOT_CHAIN_ID?: string;
  readonly VITE_DOTPILOT_CHAIN_LABEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
