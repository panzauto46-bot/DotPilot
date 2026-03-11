import { BrowserProvider, Contract, formatUnits, isAddress, parseUnits } from 'ethers';
import { DefiOpportunity, VaultPosition, WalletProvider } from '../types';
import { getPrimaryAssetSymbol } from '../utils/portfolio';

const VAULT_ABI = [
  'function getStrategy(uint256 strategyId) view returns (tuple(uint256 id, bytes32 strategyKey, address asset, bool isNative, bool active, uint16 riskScore))',
  'function getPosition(address user) view returns (tuple(uint256 id, address user, uint256 strategyId, address asset, uint256 deposited, uint256 rewards, uint64 openedAt, uint64 closedAt, bool isNative, bool active)[])',
  'function deposit(uint256 strategyId) payable returns (uint256 positionId)',
  'function depositToken(uint256 strategyId, uint256 amount) returns (uint256 positionId)',
  'function withdraw(uint256 positionId) returns (uint256 payout)',
] as const;

const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
] as const;

const DEFAULT_CHAIN_LABEL = import.meta.env.VITE_DOTPILOT_CHAIN_LABEL?.trim() || 'Polkadot Hub EVM';
const DEFAULT_NATIVE_DECIMALS = 18;

type ContractStrategy = {
  id: bigint;
  strategyKey: string;
  asset: string;
  isNative: boolean;
  active: boolean;
  riskScore: number;
};

type ContractPosition = {
  id: bigint;
  user: string;
  strategyId: bigint;
  asset: string;
  deposited: bigint;
  rewards: bigint;
  openedAt: bigint;
  closedAt: bigint;
  isNative: boolean;
  active: boolean;
};

export function getVaultAddress() {
  const configuredAddress = import.meta.env.VITE_DOTPILOT_VAULT_ADDRESS?.trim();
  return configuredAddress && isAddress(configuredAddress) ? configuredAddress : '';
}

export function getVaultRuntime(walletProvider: WalletProvider | null) {
  const contractAddress = getVaultAddress();

  if (walletProvider === 'demo') {
    return {
      mode: 'simulation' as const,
      label: 'Demo Vault',
      detail: 'Demo Wallet keeps seeded portfolio actions local and does not sign contract transactions.',
      contractAddress,
    };
  }

  if (!contractAddress) {
    return {
      mode: 'configuration_required' as const,
      label: 'Contract Address Required',
      detail: 'Set VITE_DOTPILOT_VAULT_ADDRESS to enable live deposit and withdraw transactions.',
      contractAddress,
    };
  }

  return {
    mode: 'onchain' as const,
    label: `Live Contract · ${DEFAULT_CHAIN_LABEL}`,
    detail: 'Vault actions are signed with MetaMask and synchronized from the deployed contract.',
    contractAddress,
  };
}

function getExpectedChainId() {
  const rawChainId = import.meta.env.VITE_DOTPILOT_CHAIN_ID?.trim();
  if (!rawChainId) {
    return null;
  }

  try {
    return BigInt(rawChainId);
  } catch {
    return null;
  }
}

async function getConnectedVault() {
  if (!window.ethereum) {
    throw new Error('MetaMask was not detected in this browser.');
  }

  const contractAddress = getVaultAddress();
  if (!contractAddress) {
    throw new Error('VITE_DOTPILOT_VAULT_ADDRESS is not configured.');
  }

  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  const expectedChainId = getExpectedChainId();

  if (expectedChainId !== null && network.chainId !== expectedChainId) {
    throw new Error(
      `Switch MetaMask to ${DEFAULT_CHAIN_LABEL} (chain ID ${expectedChainId.toString()}).`
    );
  }

  const signer = await provider.getSigner();
  const contract = new Contract(contractAddress, VAULT_ABI, signer);

  return { contract, contractAddress, signer };
}

async function getTokenDecimals(tokenAddress: string, signer: Awaited<ReturnType<typeof getConnectedVault>>['signer']) {
  if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
    return DEFAULT_NATIVE_DECIMALS;
  }

  try {
    const token = new Contract(tokenAddress, ERC20_ABI, signer);
    return Number(await token.decimals());
  } catch {
    return DEFAULT_NATIVE_DECIMALS;
  }
}

async function readStrategy(
  contract: Awaited<ReturnType<typeof getConnectedVault>>['contract'],
  strategyId: string
) {
  try {
    return (await contract.getStrategy(BigInt(strategyId))) as ContractStrategy;
  } catch {
    throw new Error(`Strategy ${strategyId} is not registered on the vault contract yet.`);
  }
}

function formatAmount(amount: bigint, decimals: number) {
  const parsed = Number(formatUnits(amount, decimals));
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function syncVaultPositions(opportunities: DefiOpportunity[]) {
  const { contract, signer } = await getConnectedVault();
  const walletAddress = await signer.getAddress();
  const rawPositions = (await contract.getPosition(walletAddress)) as ContractPosition[];

  const positions = await Promise.all(
    rawPositions
      .filter((position) => position.active)
      .map(async (position) => {
        const strategy = (await contract.getStrategy(position.strategyId)) as ContractStrategy;
        const opportunity =
          opportunities.find((item) => item.id === position.strategyId.toString()) ?? null;
        const decimals = position.isNative
          ? DEFAULT_NATIVE_DECIMALS
          : await getTokenDecimals(position.asset, signer);
        const deposited = formatAmount(position.deposited, decimals);
        const rewards = formatAmount(position.rewards, decimals);
        const baseAsset = opportunity
          ? getPrimaryAssetSymbol(opportunity.asset)
          : position.isNative
            ? 'DOT'
            : 'TOKEN';

        return {
          id: position.id.toString(),
          strategyId: position.strategyId.toString(),
          strategy: opportunity?.protocol ?? `Strategy #${strategy.id.toString()}`,
          asset: opportunity?.asset ?? (position.isNative ? 'DOT' : baseAsset),
          baseAsset,
          deposited,
          currentValue: deposited + rewards,
          apy: opportunity?.apy ?? 0,
          rewards,
          status: position.active ? 'Active' : 'Completed',
        } satisfies VaultPosition;
      })
  );

  return positions.sort((left, right) => Number(right.id) - Number(left.id));
}

export async function depositToVault(
  opportunities: DefiOpportunity[],
  strategyId: string,
  amount: string
) {
  const parsedAmount = Number.parseFloat(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error('Enter a valid deposit amount.');
  }

  const { contract, contractAddress, signer } = await getConnectedVault();
  const strategy = await readStrategy(contract, strategyId);
  const opportunity = opportunities.find((item) => item.id === strategyId) ?? null;
  const baseAsset = opportunity
    ? getPrimaryAssetSymbol(opportunity.asset)
    : strategy.isNative
      ? 'DOT'
      : 'TOKEN';

  if (!strategy.active) {
    throw new Error('This strategy is currently inactive on the vault contract.');
  }

  if (strategy.isNative) {
    const tx = await contract.deposit(BigInt(strategyId), {
      value: parseUnits(amount, DEFAULT_NATIVE_DECIMALS),
    });

    await tx.wait();

    return {
      txHash: tx.hash as string,
      amount: parsedAmount,
      baseAsset,
      message: `${parsedAmount.toLocaleString()} ${baseAsset} deposited on-chain.`,
    };
  }

  const token = new Contract(strategy.asset, ERC20_ABI, signer);
  const decimals = await getTokenDecimals(strategy.asset, signer);
  const parsedUnits = parseUnits(amount, decimals);
  const owner = await signer.getAddress();
  const allowance = (await token.allowance(owner, contractAddress)) as bigint;

  if (allowance < parsedUnits) {
    const approveTx = await token.approve(contractAddress, parsedUnits);
    await approveTx.wait();
  }

  const tx = await contract.depositToken(BigInt(strategyId), parsedUnits);
  await tx.wait();

  return {
    txHash: tx.hash as string,
    amount: parsedAmount,
    baseAsset,
    message: `${parsedAmount.toLocaleString()} ${baseAsset} deposited on-chain.`,
  };
}

export async function withdrawFromVault(position: VaultPosition) {
  const { contract } = await getConnectedVault();
  const tx = await contract.withdraw(BigInt(position.id));
  await tx.wait();

  return {
    txHash: tx.hash as string,
    amount: position.currentValue,
    baseAsset: position.baseAsset,
    message: `${position.currentValue.toLocaleString()} ${position.baseAsset} withdrawn on-chain.`,
  };
}
