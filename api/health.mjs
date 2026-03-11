import { parseModelFallbacks } from '../lib/assistant-runtime.mjs';

export default function handler(_request, response) {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(
    JSON.stringify({
      ok: true,
      apiConfigured: Boolean(process.env.DASHSCOPE_API_KEY),
      models: parseModelFallbacks(),
      runtime: 'vercel',
    })
  );
}

export const config = {
  runtime: 'nodejs',
};
