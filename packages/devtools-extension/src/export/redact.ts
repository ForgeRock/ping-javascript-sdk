import type { AuthEvent, FlowState } from '@forgerock/devtools-types';

const SENSITIVE_HEADERS = new Set(['authorization', 'cookie', 'set-cookie']);
const SENSITIVE_BODY_FIELDS = new Set([
  'access_token',
  'refresh_token',
  'id_token',
  'code',
  'assertion',
]);
const SENSITIVE_CALLBACK_NAME = /password|secret|credential|[_-]token$|^token[_-]/i;

function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (SENSITIVE_HEADERS.has(key.toLowerCase())) {
      result[key] =
        key.toLowerCase() === 'authorization' ? '<redacted:bearer_token>' : '<redacted:cookie>';
    } else {
      result[key] = value;
    }
  }
  return result;
}

function redactBodyFields(body: unknown): unknown {
  if (body === null || body === undefined || typeof body !== 'object' || Array.isArray(body)) {
    return body;
  }
  const obj = body as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_BODY_FIELDS.has(key)) {
      result[key] = `<redacted:${key}>`;
    } else {
      result[key] = value;
    }
  }
  return result;
}

function redactCallbacks(callbacks: readonly unknown[]): unknown[] {
  return callbacks.map((cb) => {
    if (cb === null || typeof cb !== 'object') return cb;
    const obj = cb as Record<string, unknown>;
    return {
      ...obj,
      input: Array.isArray(obj.input) ? redactCallbackEntries(obj.input) : obj.input,
      output: Array.isArray(obj.output) ? redactCallbackEntries(obj.output) : obj.output,
    };
  });
}

function redactCallbackEntries(entries: unknown[]): unknown[] {
  return entries.map((entry) => {
    if (entry === null || typeof entry !== 'object') return entry;
    const obj = entry as Record<string, unknown>;
    if (typeof obj.name === 'string' && SENSITIVE_CALLBACK_NAME.test(obj.name)) {
      return { ...obj, value: '<redacted:callback_value>' };
    }
    return obj;
  });
}

function redactEvent(event: AuthEvent): AuthEvent {
  const { data } = event;

  switch (data._tag) {
    case 'network': {
      return {
        ...event,
        data: {
          ...data,
          requestHeaders: redactHeaders(data.requestHeaders),
          responseHeaders: redactHeaders(data.responseHeaders),
          ...(data.requestBody !== undefined
            ? { requestBody: redactBodyFields(data.requestBody) }
            : {}),
          ...(data.responseBody !== undefined
            ? { responseBody: redactBodyFields(data.responseBody) }
            : {}),
        },
      };
    }

    case 'sdk': {
      return {
        ...event,
        data: {
          ...data,
          ...(data.interactionToken !== undefined
            ? { interactionToken: '<redacted:interaction_token>' }
            : {}),
          ...(data.authorization?.code !== undefined
            ? { authorization: { ...data.authorization, code: '<redacted:auth_code>' } }
            : {}),
          ...(data.responseBody !== undefined
            ? { responseBody: redactBodyFields(data.responseBody) }
            : {}),
        },
      };
    }

    case 'journey': {
      return {
        ...event,
        data: {
          ...data,
          ...(data.tokenId !== undefined ? { tokenId: '<redacted:token_id>' } : {}),
          ...(data.callbacks !== undefined ? { callbacks: redactCallbacks(data.callbacks) } : {}),
        },
      };
    }

    default:
      return event;
  }
}

export function redactFlowState(flow: FlowState): FlowState {
  return {
    ...flow,
    events: flow.events.map(redactEvent),
  };
}
