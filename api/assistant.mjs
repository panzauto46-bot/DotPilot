import {
  createErrorResponse,
  generateAssistantReply,
  normalizeAssistantPayload,
  readJsonBody,
} from '../lib/assistant-runtime.mjs';

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(payload));
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    sendJson(response, 405, {
      error: 'Method not allowed.',
    });
    return;
  }

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
  } catch (error) {
    const normalizedError = createErrorResponse(error);
    sendJson(response, normalizedError.status, normalizedError.body);
  }
}

export const config = {
  runtime: 'nodejs',
};
