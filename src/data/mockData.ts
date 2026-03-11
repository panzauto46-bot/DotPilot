import { Token, DefiOpportunity, VaultPosition, PortfolioHistory, ChatMessage } from '../types';

export const tokens: Token[] = [
  { symbol: 'DOT', name: 'Polkadot', balance: 1250.5, value: 8750.35, change24h: 3.2, icon: '◉', color: '#E6007A' },
  { symbol: 'GLMR', name: 'Moonbeam', balance: 5420.0, value: 1625.42, change24h: -1.5, icon: '◈', color: '#53CBC8' },
  { symbol: 'ASTR', name: 'Astar', balance: 15000.0, value: 1050.0, change24h: 5.7, icon: '✦', color: '#0070EB' },
  { symbol: 'ACA', name: 'Acala', balance: 8200.0, value: 820.0, change24h: -0.8, icon: '◆', color: '#E40C5B' },
  { symbol: 'USDT', name: 'Tether', balance: 2500.0, value: 2500.0, change24h: 0.01, icon: '◎', color: '#26A17B' },
  { symbol: 'WETH', name: 'Wrapped ETH', balance: 0.85, value: 3145.0, change24h: 2.1, icon: '◇', color: '#627EEA' },
];

export const defiOpportunities: DefiOpportunity[] = [
  {
    id: '1',
    protocol: 'Polkadot Hub Staking',
    type: 'Staking',
    asset: 'DOT',
    apy: 14.5,
    tvl: '$2.1B',
    risk: 'Low',
    description: 'Stake DOT natively on Polkadot Hub for secure network validation rewards.',
    recommended: true,
  },
  {
    id: '2',
    protocol: 'Hydration DEX',
    type: 'Liquidity Pool',
    asset: 'DOT/USDT',
    apy: 22.3,
    tvl: '$45M',
    risk: 'Medium',
    description: 'Provide liquidity to the DOT/USDT pool on Hydration for trading fee rewards.',
    recommended: true,
  },
  {
    id: '3',
    protocol: 'Stellaswap',
    type: 'Yield Farming',
    asset: 'GLMR/DOT',
    apy: 35.8,
    tvl: '$12M',
    risk: 'High',
    description: 'Farm STELLA rewards by providing GLMR/DOT liquidity on Stellaswap.',
    recommended: false,
  },
  {
    id: '4',
    protocol: 'Acala Lending',
    type: 'Lending',
    asset: 'DOT',
    apy: 8.2,
    tvl: '$180M',
    risk: 'Low',
    description: 'Lend DOT on Acala to earn interest from borrowers in the ecosystem.',
    recommended: true,
  },
  {
    id: '5',
    protocol: 'Bifrost Liquid Staking',
    type: 'Staking',
    asset: 'DOT → vDOT',
    apy: 16.1,
    tvl: '$95M',
    risk: 'Low',
    description: 'Liquid stake DOT to receive vDOT while earning staking rewards.',
    recommended: true,
  },
  {
    id: '6',
    protocol: 'Moonwell',
    type: 'Lending',
    asset: 'GLMR',
    apy: 11.4,
    tvl: '$28M',
    risk: 'Medium',
    description: 'Supply GLMR to Moonwell lending protocol for interest earnings.',
    recommended: false,
  },
  {
    id: '7',
    protocol: 'Astar dApp Staking',
    type: 'Staking',
    asset: 'ASTR',
    apy: 12.8,
    tvl: '$320M',
    risk: 'Low',
    description: 'Stake ASTR to support your favorite dApps and earn rewards.',
    recommended: false,
  },
  {
    id: '8',
    protocol: 'Zenlink',
    type: 'Yield Farming',
    asset: 'ASTR/USDT',
    apy: 28.5,
    tvl: '$8M',
    risk: 'High',
    description: 'Provide liquidity and farm ZLK tokens on the Zenlink DEX.',
    recommended: false,
  },
];

export const vaultPositions: VaultPosition[] = [
  {
    id: '1',
    strategyId: '1',
    strategy: 'DOT Native Staking',
    asset: 'DOT',
    baseAsset: 'DOT',
    deposited: 500,
    currentValue: 535.2,
    apy: 14.5,
    rewards: 35.2,
    status: 'Active',
  },
  {
    id: '2',
    strategyId: '2',
    strategy: 'DOT/USDT LP',
    asset: 'DOT/USDT',
    baseAsset: 'DOT',
    deposited: 1200,
    currentValue: 1342.8,
    apy: 22.3,
    rewards: 142.8,
    status: 'Active',
  },
  {
    id: '3',
    strategyId: '4',
    strategy: 'Acala DOT Lending',
    asset: 'DOT',
    baseAsset: 'DOT',
    deposited: 300,
    currentValue: 312.3,
    apy: 8.2,
    rewards: 12.3,
    status: 'Active',
  },
];

export const portfolioHistory: PortfolioHistory[] = [
  { date: 'Jan', value: 12500 },
  { date: 'Feb', value: 13200 },
  { date: 'Mar', value: 11800 },
  { date: 'Apr', value: 14500 },
  { date: 'May', value: 15200 },
  { date: 'Jun', value: 14800 },
  { date: 'Jul', value: 16100 },
  { date: 'Aug', value: 15900 },
  { date: 'Sep', value: 17200 },
  { date: 'Oct', value: 16800 },
  { date: 'Nov', value: 17500 },
  { date: 'Dec', value: 17890 },
];

export const aiResponses: Record<string, string> = {
  stake: `Based on my analysis of current market conditions, here are the **top DOT staking opportunities**:\n\n🥇 **Bifrost Liquid Staking** – 16.1% APY\n• Receive vDOT while earning rewards\n• Maintain liquidity for other DeFi activities\n• Risk Level: Low\n\n🥈 **Polkadot Hub Native Staking** – 14.5% APY\n• Most secure option with direct network validation\n• 28-day unbonding period\n• Risk Level: Low\n\n🥉 **Astar dApp Staking** – 12.8% APY\n• Support ecosystem dApps while earning\n• Flexible unstaking\n• Risk Level: Low\n\n**My Recommendation:** For your portfolio of 1,250 DOT, I suggest splitting:\n• 60% → Bifrost Liquid Staking (maximize yield + liquidity)\n• 40% → Native Staking (maximum security)\n\nEstimated annual earnings: **~$1,330**\n\nWould you like me to execute this strategy?`,

  yield: `Here are today's **best yield opportunities** in the Polkadot ecosystem:\n\n📊 **Top Yields by Risk Level:**\n\n**Low Risk:**\n• Bifrost vDOT Staking → 16.1% APY\n• Polkadot Hub Staking → 14.5% APY\n• Acala DOT Lending → 8.2% APY\n\n**Medium Risk:**\n• Hydration DOT/USDT LP → 22.3% APY\n• Moonwell GLMR Lending → 11.4% APY\n\n**High Risk:**\n• Stellaswap GLMR/DOT Farm → 35.8% APY\n• Zenlink ASTR/USDT Farm → 28.5% APY\n\n⚡ **AI Insight:** Given your current portfolio allocation, I recommend the Hydration DOT/USDT pool. It offers strong yields with moderate risk and high liquidity.\n\nShall I prepare a deposit transaction?`,

  passive: `Great question! Here's how you can earn **passive income** in the Polkadot ecosystem:\n\n💰 **Strategy 1: Conservative (Est. 12-15% APY)**\nStake DOT natively and lend stablecoins on Acala.\n• Expected monthly income: ~$145\n• Risk: Very Low\n\n💰 **Strategy 2: Balanced (Est. 18-22% APY)**\nCombine liquid staking with LP positions.\n• Expected monthly income: ~$280\n• Risk: Low-Medium\n\n💰 **Strategy 3: Growth (Est. 25-35% APY)**\nAggressive yield farming across multiple protocols.\n• Expected monthly income: ~$420\n• Risk: Medium-High\n\n🎯 **Personalized Recommendation:**\nBased on your $17,890 portfolio, I recommend **Strategy 2** for optimal risk-adjusted returns.\n\nWant me to set up an automated strategy?`,

  default: `I'm DotPilot, your AI DeFi navigator for the Polkadot ecosystem! 🚀\n\nI can help you with:\n\n• **Staking** – Find the best staking opportunities for DOT and other assets\n• **Yield Farming** – Discover high-yield farming strategies\n• **Portfolio Analysis** – Optimize your asset allocation\n• **Risk Assessment** – Understand the risks of different DeFi strategies\n• **Strategy Execution** – Execute DeFi strategies directly\n\nTry asking me:\n• "Where should I stake my DOT?"\n• "What are the best yield opportunities today?"\n• "How can I earn passive income?"\n\nHow can I help you today?`,
};

export const initialMessages: ChatMessage[] = [
  {
    id: '0',
    role: 'assistant',
    content: `Welcome to **DotPilot**.\n\nI can help you compare Polkadot ecosystem strategies, explain risk levels, and guide you into the vault flow when you're ready to act.\n\nAsk about staking, yield opportunities, or passive income to get started.`,
    timestamp: new Date(),
  },
];
