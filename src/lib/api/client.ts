/**
 * Thin fetch wrapper for the Django API.
 *
 * - Sends the session cookie (`credentials: 'include'`).
 * - Mirrors Django's `csrftoken` cookie into the `X-CSRFToken` header.
 * - Normalises the two error shapes we receive (DRF envelope and allauth
 *   headless `errors[]`) into a single `ApiError`.
 */

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
).replace(/\/$/, '');

export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  status: number;
  code: string;
  fieldErrors: FieldErrors;
  /** The raw error payload, for endpoints that add fields (e.g. checkout's `line`). */
  data: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    fieldErrors: FieldErrors = {},
    data: unknown = undefined
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.data = data;
  }
}

export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

type Options = Omit<RequestInit, 'body'> & { body?: unknown };

/**
 * Perform a request against the API. Resolves with the parsed JSON body for
 * 2xx responses; rejects with `ApiError` otherwise. `allowStatuses` lets a
 * caller treat selected non-2xx statuses as data (allauth uses 401 to carry
 * pending-flow information).
 */
export async function apiFetch<T = unknown>(
  path: string,
  { body, headers, allowStatuses = [], ...init }: Options & { allowStatuses?: number[] } = {}
): Promise<{ status: number; data: T }> {
  const method = (init.method ?? 'GET').toUpperCase();
  const requestHeaders = new Headers(headers);
  requestHeaders.set('Accept', 'application/json');
  if (body !== undefined) requestHeaders.set('Content-Type', 'application/json');
  if (method !== 'GET' && method !== 'HEAD') {
    const csrf = getCookie('csrftoken');
    if (csrf) requestHeaders.set('X-CSRFToken', csrf);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      method,
      headers: requestHeaders,
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'network', 'Network error');
  }

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T) : (undefined as T);

  if (response.ok || allowStatuses.includes(response.status)) {
    return { status: response.status, data };
  }
  throw toApiError(response.status, data);
}

function toApiError(status: number, data: unknown): ApiError {
  const payload = (data ?? {}) as Record<string, unknown>;

  // allauth headless: { status, errors: [{ message, code, param? }] }
  if (Array.isArray(payload.errors)) {
    const fieldErrors: FieldErrors = {};
    let code = 'invalid';
    let message = 'Request failed';
    for (const err of payload.errors as Array<{ message: string; code: string; param?: string }>) {
      if (err.param) {
        (fieldErrors[err.param] ??= []).push(err.message);
      } else {
        code = err.code;
        message = err.message;
      }
    }
    return new ApiError(status, code, message, fieldErrors, payload);
  }

  // DRF envelope: { detail, code, errors?: { field: [msg] } }
  const fieldErrors =
    payload.errors && typeof payload.errors === 'object'
      ? (payload.errors as FieldErrors)
      : {};
  return new ApiError(
    status,
    String(payload.code ?? 'error'),
    String(payload.detail ?? 'Request failed'),
    fieldErrors,
    payload
  );
}
