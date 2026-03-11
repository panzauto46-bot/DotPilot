import { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Sparkles, Lightbulb } from 'lucide-react';
import { ChatMessage, DefiOpportunity } from '../types';
import { requestAssistantHealth, requestAssistantReply } from '../services/assistant';
import { cn } from '../utils/cn';
import { buildAssistantReply } from '../utils/assistantFallback';

const ASSISTANT_STORAGE_KEY = 'dotpilot.assistant.messages';
const MAX_PERSISTED_MESSAGES = 80;

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

function createWelcomeMessage(): ChatMessage {
  return createMessage({
    role: 'assistant',
    content:
      'Welcome to **DotPilot**.\n\nAsk me about staking, yield opportunities, or passive income and I will guide you into the right strategy flow.',
  });
}

function isValidRole(value: unknown): value is ChatMessage['role'] {
  return value === 'assistant' || value === 'user';
}

function isValidSource(value: unknown): value is ChatMessage['source'] {
  return value === 'live' || value === 'fallback' || typeof value === 'undefined';
}

function loadPersistedMessages(): ChatMessage[] {
  if (typeof window === 'undefined') {
    return [createWelcomeMessage()];
  }

  try {
    const raw = window.localStorage.getItem(ASSISTANT_STORAGE_KEY);
    if (!raw) {
      return [createWelcomeMessage()];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [createWelcomeMessage()];
    }

    const hydrated = parsed
      .map((entry) => {
        if (!entry || typeof entry !== 'object') {
          return null;
        }

        const candidate = entry as Record<string, unknown>;
        if (
          typeof candidate.id !== 'string' ||
          !isValidRole(candidate.role) ||
          typeof candidate.content !== 'string' ||
          typeof candidate.timestamp !== 'string' ||
          !isValidSource(candidate.source)
        ) {
          return null;
        }

        const timestamp = new Date(candidate.timestamp);
        if (Number.isNaN(timestamp.getTime())) {
          return null;
        }

        return {
          id: candidate.id,
          role: candidate.role,
          content: candidate.content,
          timestamp,
          strategyId: typeof candidate.strategyId === 'string' ? candidate.strategyId : undefined,
          ctaLabel: typeof candidate.ctaLabel === 'string' ? candidate.ctaLabel : undefined,
          modelUsed: typeof candidate.modelUsed === 'string' ? candidate.modelUsed : undefined,
          source: candidate.source,
        } satisfies ChatMessage;
      })
      .filter((message): message is ChatMessage => message !== null);

    return hydrated.length > 0 ? hydrated.slice(-MAX_PERSISTED_MESSAGES) : [createWelcomeMessage()];
  } catch {
    return [createWelcomeMessage()];
  }
}

interface AIAssistantProps {
  walletConnected: boolean;
  opportunities: DefiOpportunity[];
  totalPortfolioValue: number;
  onOpenStrategy: (strategyId: string) => void;
  onConnectWallet: () => void;
}

export function AIAssistant({
  walletConnected,
  opportunities,
  totalPortfolioValue,
  onOpenStrategy,
  onConnectWallet,
}: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(loadPersistedMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [assistantStatus, setAssistantStatus] = useState<{
    mode: 'live' | 'fallback';
    label: string;
  }>({
    mode: 'fallback',
    label: 'Fallback ready',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousWalletStateRef = useRef(walletConnected);
  const requestControllerRef = useRef<AbortController | null>(null);
  const healthControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const persisted = messages.slice(-MAX_PERSISTED_MESSAGES).map((message) => ({
        ...message,
        timestamp: message.timestamp.toISOString(),
      }));

      window.localStorage.setItem(ASSISTANT_STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      return;
    }
  }, [messages]);

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
    healthControllerRef.current?.abort();
    const controller = new AbortController();
    healthControllerRef.current = controller;

    void requestAssistantHealth(controller.signal)
      .then((health) => {
        if (!health.ok || !health.apiConfigured) {
          setAssistantStatus({
            mode: 'fallback',
            label: 'Fallback ready',
          });
          return;
        }

        setAssistantStatus({
          mode: 'live',
          label: health.models[0] ? `Live AI · ${health.models[0]} ready` : 'Live AI ready',
        });
      })
      .catch(() => {
        setAssistantStatus({
          mode: 'fallback',
          label: 'Fallback ready',
        });
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    return () => {
      requestControllerRef.current?.abort();
      healthControllerRef.current?.abort();
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userInput = input.trim();
    const userMessage = createMessage({
      role: 'user',
      content: userInput,
    });

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsTyping(true);

    requestControllerRef.current?.abort();
    const requestController = new AbortController();
    requestControllerRef.current = requestController;

    try {
      const reply = await requestAssistantReply(
        {
          input: userInput,
          walletConnected,
          totalPortfolioValue,
          opportunities,
        },
        requestController.signal
      );

      setAssistantStatus({
        mode: 'live',
        label: reply.model
          ? `Live AI · ${reply.model}${reply.fallbackUsed ? ' (auto-switch)' : ''}`
          : 'Live AI',
      });

      setMessages((current) => [
        ...current,
        createMessage({
          role: 'assistant',
          content: reply.content,
          strategyId: reply.strategyId ?? undefined,
          ctaLabel: reply.ctaLabel ?? undefined,
          modelUsed: reply.model ?? undefined,
          source: 'live',
        }),
      ]);
    } catch (error) {
      if (requestController.signal.aborted) {
        return;
      }

      const fallbackReply = buildAssistantReply(
        userInput,
        walletConnected,
        opportunities,
        totalPortfolioValue
      );

      const message =
        error instanceof Error ? error.message : 'Live AI unavailable. Switched to local fallback.';

      setAssistantStatus({
        mode: 'fallback',
        label: `Fallback active · ${message}`,
      });

      setMessages((current) => [
        ...current,
        createMessage({
          role: 'assistant',
          content: fallbackReply.content,
          strategyId: fallbackReply.strategyId,
          ctaLabel: fallbackReply.ctaLabel,
          source: 'fallback',
        }),
      ]);
    } finally {
      if (requestControllerRef.current === requestController) {
        requestControllerRef.current = null;
      }

      setIsTyping(false);
    }
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
            Real Qwen responses grounded to the current DotPilot strategy set
          </p>
        </div>
        <div
          className={cn(
            'ml-auto flex items-center gap-1.5 rounded-full px-2.5 py-1',
            assistantStatus.mode === 'live'
              ? 'border border-green-500/20 bg-green-500/10'
              : 'border border-yellow-500/20 bg-yellow-500/10'
          )}
        >
          <div
            className={cn(
              'h-1.5 w-1.5 rounded-full animate-pulse',
              assistantStatus.mode === 'live' ? 'bg-green-400' : 'bg-yellow-400'
            )}
          />
          <span
            className={cn(
              'text-[10px] font-medium',
              assistantStatus.mode === 'live' ? 'text-green-400' : 'text-yellow-300'
            )}
          >
            {assistantStatus.label}
          </span>
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
                {message.role === 'assistant' && (
                  <>
                    {' · '}
                    {message.source === 'live' && message.modelUsed
                      ? message.modelUsed
                      : message.source === 'fallback'
                        ? 'Local fallback'
                        : 'DotPilot'}
                  </>
                )}
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
              onClick={() => {
                setInput(action.label);
              }}
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
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              void handleSend();
            }
          }}
          placeholder="Ask about staking, yields, or passive income..."
          className="flex-1 rounded-xl border border-surface-600 bg-surface-700 px-4 py-3 text-sm text-white placeholder-surface-400 transition-colors focus:border-dot-pink/50 focus:outline-none"
        />
        <button
          onClick={() => void handleSend()}
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
