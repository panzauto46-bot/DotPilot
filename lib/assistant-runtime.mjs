export const DEFAULT_MODEL_FALLBACKS = [
  'qwen-plus',
  'qwen-plus-latest',
  'qwen-turbo',
  'qwen-turbo-latest',
  'qwen-flash',
  'qwen3.5-plus',
  'qwen3-32b',
  'qwen3-14b',
  'qwen3-8b',
  'qwen-max',
];

export function parseModelFallbacks() {
  const raw = process.env.DASHSCOPE_MODEL_FALLBACKS;
  if (!raw) {
    return DEFAULT_MODEL_FALLBACKS;
  }

  return raw
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);
}

export function normalizeOpportunity(item) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const protocol = typeof item.protocol === 'string' ? item.protocol : '';
  const id = typeof item.id === 'string' ? item.id : '';

  if (!protocol || !id) {
    return null;
  }

  return {
    id,
    protocol,
    type: typeof item.type === 'string' ? item.type : 'Unknown',
    asset: typeof item.asset === 'string' ? item.asset : 'Unknown',
    apy: typeof item.apy === 'number' ? item.apy : 0,
    risk: typeof item.risk === 'string' ? item.risk : 'Unknown',
    description: typeof item.description === 'string' ? item.description : '',
    recommended: Boolean(item.recommended),
  };
}

export function normalizeAssistantPayload(body) {
  const input = typeof body?.input === 'string' ? body.input.trim() : '';
  const walletConnected = Boolean(body?.walletConnected);
  const totalPortfolioValue = Number.isFinite(body?.totalPortfolioValue)
    ? Number(body.totalPortfolioValue)
    : 0;
  const opportunities = Array.isArray(body?.opportunities)
    ? body.opportunities.map(normalizeOpportunity).filter(Boolean)
    : [];

  return {
    input,
    walletConnected,
    totalPortfolioValue,
    opportunities,
  };
}

function buildRankedStrategyContext(opportunities) {
  const recommended = opportunities
    .filter((opportunity) => opportunity.recommended)
    .sort((left, right) => right.apy - left.apy);

  const lowestRisk = [...opportunities].sort((left, right) => {
    const riskScore = { Low: 1, Medium: 2, High: 3 };
    const leftScore = riskScore[left.risk] ?? 99;
    const rightScore = riskScore[right.risk] ?? 99;

    if (leftScore === rightScore) {
      return right.apy - left.apy;
    }

    return leftScore - rightScore;
  });

  return {
    recommendedTop: recommended[0]?.protocol ?? null,
    highestYield: [...opportunities].sort((left, right) => right.apy - left.apy)[0]?.protocol ?? null,
    lowestRisk: lowestRisk[0]?.protocol ?? null,
  };
}

function buildPrompt({ input, walletConnected, totalPortfolioValue, opportunities }) {
  const ranked = buildRankedStrategyContext(opportunities);
  const strategyBlock = opportunities
    .map(
      (opportunity) =>
        `- id=${opportunity.id}; protocol=${opportunity.protocol}; type=${opportunity.type}; asset=${opportunity.asset}; apy=${opportunity.apy}%; risk=${opportunity.risk}; recommended=${opportunity.recommended ? 'yes' : 'no'}; description=${opportunity.description}`
    )
    .join('\n');

  return [
    {
      role: 'system',
      content:
        'You are DotPilot AI, a DeFi navigator for Polkadot Hub. You must stay grounded to the provided opportunity dataset only. Never invent protocols, APY, risk levels, or balances. If the user asks for a recommendation, choose at most one strategy from the dataset. Keep the answer concise, useful, and action-oriented. Reply in the same language as the user. Return only valid JSON with this exact shape: {"content":"markdown string","strategyId":"string or null","ctaLabel":"string or null"}. If walletConnected is false and you recommend a strategy, set ctaLabel to "Connect wallet". If walletConnected is true and you recommend a strategy, set ctaLabel to one short action like "Open strategy" or "Review in vault". If no strategy fits, use null for strategyId and ctaLabel.',
    },
    {
      role: 'user',
      content: `walletConnected=${walletConnected ? 'yes' : 'no'}\nportfolioValueUsd=${totalPortfolioValue.toFixed(2)}\nstrategyHints: recommendedTop=${ranked.recommendedTop ?? 'none'}; highestYield=${ranked.highestYield ?? 'none'}; lowestRisk=${ranked.lowestRisk ?? 'none'}\navailableStrategies:\n${strategyBlock}\n\nuserQuestion:\n${input}`,
    },
  ];
}

function extractJsonCandidate(content) {
  const trimmed = content.trim();

  if (!trimmed) {
    return null;
  }

  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function inferStrategyIdFromContent(content, opportunities) {
  const normalized = content.toLowerCase();
  const matched = opportunities.find((opportunity) =>
    normalized.includes(opportunity.protocol.toLowerCase())
  );

  return matched?.id ?? null;
}

function normalizeAssistantReply(rawContent, opportunities, walletConnected) {
  const candidate = extractJsonCandidate(rawContent);

  if (!candidate) {
    return {
      content: 'I could not generate a grounded response just now. Please try again.',
      strategyId: null,
      ctaLabel: null,
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    parsed = null;
  }

  const validIds = new Set(opportunities.map((opportunity) => opportunity.id));
  const strategyIdFromPayload =
    parsed && typeof parsed.strategyId === 'string' && validIds.has(parsed.strategyId)
      ? parsed.strategyId
      : null;

  const content =
    parsed && typeof parsed.content === 'string' && parsed.content.trim()
      ? parsed.content.trim()
      : rawContent.trim();

  const strategyId = strategyIdFromPayload ?? inferStrategyIdFromContent(content, opportunities);

  const ctaLabel =
    parsed && typeof parsed.ctaLabel === 'string' && strategyId
      ? parsed.ctaLabel.trim()
      : strategyId
        ? walletConnected
          ? 'Open strategy'
          : 'Connect wallet'
        : null;

  return {
    content,
    strategyId,
    ctaLabel,
  };
}

function extractErrorMessage(data, fallbackText) {
  if (data?.error?.message && typeof data.error.message === 'string') {
    return data.error.message;
  }

  if (data?.message && typeof data.message === 'string') {
    return data.message;
  }

  return fallbackText;
}

function extractErrorCode(data) {
  if (data?.error?.code && typeof data.error.code === 'string') {
    return data.error.code;
  }

  if (data?.code && typeof data.code === 'string') {
    return data.code;
  }

  return '';
}

function shouldTryNextModel(error) {
  const code = `${error.code || ''}`.toLowerCase();
  const message = `${error.message || ''}`.toLowerCase();

  if (error.status >= 500) {
    return true;
  }

  return (
    code.includes('allocationquota.freetieronly') ||
    code.includes('model.accessdenied') ||
    code.includes('modelnotfound') ||
    code.includes('model_not_found') ||
    code.includes('model_not_supported') ||
    code.includes('throttling') ||
    code.includes('limit_requests') ||
    code.includes('insufficient_quota') ||
    message.includes('free tier') ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('try again later')
  );
}

async function callDashScopeModel(model, messages, apiKey, baseUrl) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      messages,
    }),
  });

  const rawText = await response.text();
  let data = null;

  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw {
      status: response.status,
      code: extractErrorCode(data),
      message: extractErrorMessage(data, rawText || `Request failed with status ${response.status}.`),
    };
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw {
      status: 502,
      code: 'empty_response',
      message: 'The AI model returned an empty response.',
    };
  }

  return content;
}

export async function generateAssistantReply(payload) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  const baseUrl =
    process.env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
  const models = parseModelFallbacks();

  if (!apiKey) {
    throw {
      status: 503,
      code: 'missing_api_key',
      message: 'DASHSCOPE_API_KEY is not configured on the AI runtime.',
    };
  }

  const messages = buildPrompt(payload);
  const attemptedModels = [];
  let lastError = null;

  for (const model of models) {
    attemptedModels.push(model);

    try {
      const rawContent = await callDashScopeModel(model, messages, apiKey, baseUrl);
      const reply = normalizeAssistantReply(rawContent, payload.opportunities, payload.walletConnected);

      return {
        ...reply,
        model,
        attemptedModels,
        fallbackUsed: attemptedModels.length > 1,
      };
    } catch (error) {
      lastError = error;

      if (!shouldTryNextModel(error)) {
        throw error;
      }
    }
  }

  throw lastError || {
    status: 503,
    code: 'all_models_failed',
    message: 'All configured fallback models failed.',
  };
}

export function createErrorResponse(error) {
  return {
    status: error?.status || 500,
    body: {
      error:
        error?.message ||
        'The AI runtime could not complete the request. The frontend can fall back locally.',
      code: error?.code || 'internal_error',
    },
  };
}

export async function readJsonBody(request) {
  if (request.body && typeof request.body === 'object' && !Buffer.isBuffer(request.body)) {
    return request.body;
  }

  if (typeof request.body === 'string') {
    return JSON.parse(request.body);
  }

  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 256 * 1024) {
      throw new Error('Payload too large.');
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf-8'));
}
