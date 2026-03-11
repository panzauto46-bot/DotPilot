import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  createErrorResponse,
  generateAssistantReply,
  normalizeAssistantPayload,
  parseModelFallbacks,
  readJsonBody,
} from '../lib/assistant-runtime.mjs';

const PORT = Number(process.env.AI_PROXY_PORT || 8787);
const DIST_INDEX_PATH = path.resolve(process.cwd(), 'dist/index.html');

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, body, contentType = 'text/plain; charset=utf-8') {
  response.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
  });
  response.end(body);
}

async function serveApp(response) {
  if (!existsSync(DIST_INDEX_PATH)) {
    sendText(
      response,
      404,
      'Frontend build not found. Run "npm run build" first or use "npm run dev" for development.'
    );
    return;
  }

  const html = await readFile(DIST_INDEX_PATH, 'utf-8');
  sendText(response, 200, html, 'text/html; charset=utf-8');
}

const server = createServer(async (request, response) => {
  const host = request.headers.host || 'localhost';
  const url = new URL(request.url || '/', `http://${host}`);

  if (
    request.method === 'GET' &&
    (url.pathname === '/health' || url.pathname === '/api/health')
  ) {
    sendJson(response, 200, {
      ok: true,
      apiConfigured: Boolean(process.env.DASHSCOPE_API_KEY),
      models: parseModelFallbacks(),
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/assistant') {
    try {
      const body = await readJsonBody(request);
      const payload = normalizeAssistantPayload(body);

      if (!payload.input) {
        sendJson(response, 400, {
          error: 'Question is required.',
        });
        return;
      }

      if (payload.opportunities.length === 0) {
        sendJson(response, 400, {
          error: 'Opportunity dataset is required.',
        });
        return;
      }

      const reply = await generateAssistantReply(payload);

      sendJson(response, 200, reply);
      return;
    } catch (error) {
      const normalizedError = createErrorResponse(error);
      sendJson(response, normalizedError.status, normalizedError.body);
      return;
    }
  }

  if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    try {
      await serveApp(response);
    } catch {
      sendText(response, 500, 'Failed to load the frontend build.');
    }
    return;
  }

  sendJson(response, 404, {
    error: 'Not found.',
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const configured = Boolean(process.env.DASHSCOPE_API_KEY);
  console.log(`[dotpilot-ai] server running on http://localhost:${PORT}`);
  console.log(`[dotpilot-ai] live AI ${configured ? 'configured' : 'not configured'} · fallback chain: ${parseModelFallbacks().join(' -> ')}`);
});
