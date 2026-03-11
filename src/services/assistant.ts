import { DefiOpportunity } from '../types';

export interface AssistantApiResponse {
  content: string;
  strategyId?: string | null;
  ctaLabel?: string | null;
  model?: string | null;
  attemptedModels?: string[];
  fallbackUsed?: boolean;
}

export interface AssistantHealthResponse {
  ok: boolean;
  apiConfigured: boolean;
  models: string[];
  runtime?: string;
}

interface AssistantApiRequest {
  input: string;
  walletConnected: boolean;
  totalPortfolioValue: number;
  opportunities: DefiOpportunity[];
}

export async function requestAssistantReply(
  payload: AssistantApiRequest,
  signal?: AbortSignal
): Promise<AssistantApiResponse> {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal,
  });

  const data = (await response.json().catch(() => null)) as AssistantApiResponse | {
    error?: string;
  } | null;

  if (!response.ok) {
    throw new Error(data && 'error' in data && data.error ? data.error : 'AI request failed.');
  }

  if (!data || typeof data !== 'object' || !('content' in data) || typeof data.content !== 'string') {
    throw new Error('AI response was empty.');
  }

  return data;
}

export async function requestAssistantHealth(
  signal?: AbortSignal
): Promise<AssistantHealthResponse> {
  const response = await fetch('/api/health', {
    method: 'GET',
    signal,
  });

  const data = (await response.json().catch(() => null)) as AssistantHealthResponse | null;

  if (!response.ok || !data) {
    throw new Error('Assistant health check failed.');
  }

  return data;
}
