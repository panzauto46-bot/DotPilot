import { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Sparkles, Lightbulb } from 'lucide-react';
import { ChatMessage, DefiOpportunity } from '../types';
import { cn } from '../utils/cn';

interface AIAssistantProps {
  walletConnected: boolean;
  opportunities: DefiOpportunity[];
  totalPortfolioValue: number;
  onOpenStrategy: (strategyId: string) => void;
  onConnectWallet: () => void;
}

interface AssistantReply {
  content: string;
  strategyId?: string;
  ctaLabel?: string;
}

function createMessage(partial: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
  return {
    ...partial,
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`,
    timestamp: new Date(),
  };
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

function buildAssistantReply(
  input: string,
  walletConnected: boolean,
  opportunities: DefiOpportunity[],
  totalPortfolioValue: number
): AssistantReply {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('stake')) {
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

  if (lowerInput.includes('yield') || lowerInput.includes('best') || lowerInput.includes('apy')) {
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

  if (
    lowerInput.includes('passive') ||
    lowerInput.includes('income') ||
    lowerInput.includes('safe') ||
    lowerInput.includes('risk')
  ) {
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

export function AIAssistant({
  walletConnected,
  opportunities,
  totalPortfolioValue,
  onOpenStrategy,
  onConnectWallet,
}: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage({
      role: 'assistant',
      content:
        'Welcome to **DotPilot**.\n\nAsk me about staking, yield opportunities, or passive income and I will guide you into the right strategy flow.',
    }),
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const previousWalletStateRef = useRef(walletConnected);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!previousWalletStateRef.current && walletConnected) {
      setMessages((current) => [
        ...current,
        createMessage({
          role: 'assistant',
          content:
            'Wallet connected. I can now route you from recommendation to the vault flow without leaving the assistant.',
        }),
      ]);
    }

    previousWalletStateRef.current = walletConnected;
  }, [walletConnected]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userInput = input.trim();
    const userMessage = createMessage({
      role: 'user',
      content: userInput,
    });

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsTyping(true);

    timeoutRef.current = window.setTimeout(() => {
      const reply = buildAssistantReply(
        userInput,
        walletConnected,
        opportunities,
        totalPortfolioValue
      );

      setMessages((current) => [
        ...current,
        createMessage({
          role: 'assistant',
          content: reply.content,
          strategyId: reply.strategyId,
          ctaLabel: reply.ctaLabel,
        }),
      ]);
      setIsTyping(false);
    }, 900);
  };

  const quickActions = [
    { label: 'Where should I stake my DOT?', icon: <Sparkles size={14} /> },
    { label: 'Best yield opportunities today?', icon: <Lightbulb size={14} /> },
    { label: 'How can I earn passive income?', icon: <Sparkles size={14} /> },
  ];

  const formatContent = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col animate-fade-in">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-dot-pink to-dot-purple text-white">
          <Bot size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">DotPilot AI Assistant</h2>
          <p className="text-xs text-surface-300">
            Grounded recommendations for the current DeFi strategy set
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-medium text-green-400">Ready</span>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pb-4 pr-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn('flex gap-3 animate-fade-in', message.role === 'user' && 'flex-row-reverse')}
          >
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                message.role === 'assistant'
                  ? 'bg-gradient-to-br from-dot-pink to-dot-purple text-white'
                  : 'bg-surface-600 text-surface-200'
              )}
            >
              {message.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3',
                message.role === 'assistant'
                  ? 'rounded-tl-sm border border-surface-600 bg-surface-700'
                  : 'rounded-tr-sm border border-dot-pink/20 bg-dot-pink/15'
              )}
            >
              <div className="whitespace-pre-line text-sm leading-relaxed">
                {formatContent(message.content)}
              </div>

              {message.role === 'assistant' && message.strategyId && message.ctaLabel && (
                <button
                  onClick={() =>
                    walletConnected ? onOpenStrategy(message.strategyId!) : onConnectWallet()
                  }
                  className="mt-3 rounded-lg bg-dot-pink/10 px-3 py-2 text-xs font-medium text-dot-pink transition-colors hover:bg-dot-pink/20"
                >
                  {message.ctaLabel}
                </button>
              )}

              <p className="mt-2 text-[10px] text-surface-400">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-dot-pink to-dot-purple text-white">
              <Bot size={16} />
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-surface-600 bg-surface-700 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="typing-dot h-2 w-2 rounded-full bg-dot-pink" />
                <div className="typing-dot h-2 w-2 rounded-full bg-dot-pink" />
                <div className="typing-dot h-2 w-2 rounded-full bg-dot-pink" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 2 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => setInput(action.label)}
              className="flex items-center gap-1.5 rounded-lg border border-surface-600 bg-surface-700 px-3 py-2 text-xs text-surface-200 transition-colors hover:border-dot-pink/30 hover:text-white"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 border-t border-surface-600 pt-2">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleSend()}
          placeholder="Ask about staking, yields, or passive income..."
          className="flex-1 rounded-xl border border-surface-600 bg-surface-700 px-4 py-3 text-sm text-white placeholder-surface-400 transition-colors focus:border-dot-pink/50 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className={cn(
            'flex items-center justify-center rounded-xl px-4 transition-all',
            input.trim() && !isTyping
              ? 'bg-gradient-to-r from-dot-pink to-dot-purple text-white shadow-lg shadow-dot-pink/20 hover:opacity-90'
              : 'cursor-not-allowed bg-surface-700 text-surface-400'
          )}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
