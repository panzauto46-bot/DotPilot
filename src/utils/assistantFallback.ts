import { DefiOpportunity } from '../types';

export interface AssistantReply {
  content: string;
  strategyId?: string;
  ctaLabel?: string;
}

function includesAny(input: string, keywords: string[]) {
  return keywords.some((keyword) => input.includes(keyword));
}

function pickBestLowRiskStaking(opportunities: DefiOpportunity[]) {
  return opportunities
    .filter((opportunity) => opportunity.type === 'Staking' && opportunity.risk === 'Low')
    .sort((left, right) => right.apy - left.apy)[0];
}

function pickBestYield(opportunities: DefiOpportunity[]) {
  return [...opportunities].sort((left, right) => right.apy - left.apy)[0];
}

function pickBalancedOpportunity(opportunities: DefiOpportunity[]) {
  return opportunities
    .filter((opportunity) => opportunity.recommended)
    .sort((left, right) => right.apy - left.apy)[0];
}

export function buildAssistantReply(
  input: string,
  walletConnected: boolean,
  opportunities: DefiOpportunity[],
  totalPortfolioValue: number
): AssistantReply {
  const lowerInput = input.toLowerCase();

  if (includesAny(lowerInput, ['stake', 'staking', 'taruh', 'amanin dot'])) {
    const strategy = pickBestLowRiskStaking(opportunities);
    if (!strategy) {
      return {
        content: 'I could not find a low-risk staking strategy in the current dataset.',
      };
    }

    return {
      content: walletConnected
        ? `For staking, my top pick is **${strategy.protocol}**.\n\nIt offers **${strategy.apy}% APY**, keeps risk at **${strategy.risk}**, and fits a portfolio sized around **$${totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}**.\n\nIf you want the safest path into the vault flow, start here.`
        : `For staking, my top pick is **${strategy.protocol}**.\n\nIt offers **${strategy.apy}% APY** with **${strategy.risk}** risk.\n\nConnect your wallet and I will take you straight into the vault flow for this strategy.`,
      strategyId: strategy.id,
      ctaLabel: walletConnected ? 'Open strategy' : 'Connect wallet',
    };
  }

  if (includesAny(lowerInput, ['yield', 'best', 'apy', 'cuan', 'hasil'])) {
    const strategy = pickBestYield(opportunities);
    if (!strategy) {
      return {
        content: 'I could not find a yield strategy in the current dataset.',
      };
    }

    return {
      content: walletConnected
        ? `The highest-yield option right now is **${strategy.protocol}** at **${strategy.apy}% APY**.\n\nThis comes with **${strategy.risk}** risk, so I would only use it if you are comfortable with a more aggressive position.\n\nI can route you into the vault flow if you want to test the opportunity.`
        : `The highest-yield option right now is **${strategy.protocol}** at **${strategy.apy}% APY**.\n\nIt carries **${strategy.risk}** risk. Connect your wallet if you want to continue into the vault flow.`,
      strategyId: strategy.id,
      ctaLabel: walletConnected ? 'Review in vault' : 'Connect wallet',
    };
  }

  if (includesAny(lowerInput, ['passive', 'income', 'safe', 'risk', 'pasif', 'aman'])) {
    const strategy = pickBalancedOpportunity(opportunities);
    if (!strategy) {
      return {
        content: 'I could not find a balanced strategy in the current dataset.',
      };
    }

    return {
      content: walletConnected
        ? `For passive income, I would start with **${strategy.protocol}**.\n\nIt balances yield and clarity with **${strategy.apy}% APY** and **${strategy.risk}** risk.\n\nThis is the most practical option for the DotPilot MVP flow.`
        : `For passive income, I would start with **${strategy.protocol}**.\n\nIt offers **${strategy.apy}% APY** with **${strategy.risk}** risk and is a good entry point for the demo flow.\n\nConnect your wallet to continue.`,
      strategyId: strategy.id,
      ctaLabel: walletConnected ? 'Start vault flow' : 'Connect wallet',
    };
  }

  const fallback = pickBalancedOpportunity(opportunities);

  return {
    content: walletConnected
      ? `I can help you compare staking, yield, and passive income strategies.\n\nA good place to start is **${fallback?.protocol ?? 'the recommended opportunity set'}**.\n\nAsk for staking, yield, or low-risk income and I will point you to the right strategy.`
      : `I can compare staking, yield, and passive income strategies for you.\n\nConnect your wallet when you want a smoother vault flow and more context around execution.`,
    strategyId: fallback?.id,
    ctaLabel:
      fallback && walletConnected ? 'Open recommended strategy' : walletConnected ? undefined : 'Connect wallet',
  };
}
