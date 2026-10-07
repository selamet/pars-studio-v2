/**
 * django-allauth headless (browser client) + the project's /api/v1/me endpoint.
 * Reference: https://docs.allauth.org/en/latest/headless/openapi-specification/
 */

import { API_URL, apiFetch, getCookie } from './client';
import type { components } from './schema';

const HEADLESS = '/_allauth/browser/v1';

export type User = components['schemas']['User'];
export type UserPatch = components['schemas']['PatchedUserRequest'];

export type HeadlessUser = {
  id: number;
  display: string;
  email: string;
  has_usable_password: boolean;
};

export type Flow = {
  id: string;
  providers?: string[];
  is_pending?: boolean;
};

export type AuthResponse = {
  status: number;
  data: { user?: HeadlessUser; flows?: Flow[] };
  meta: { is_authenticated: boolean; session_token?: string };
};

export type ProviderInfo = { id: string; name: string; flows: string[] };

/**
 * Loads the headless config. Any Django response sets the CSRF cookie, so
 * call this before the first mutating request in a fresh browser.
 */
export async function ensureCsrf(): Promise<ProviderInfo[]> {
  const { data } = await apiFetch<{
    data: { socialaccount?: { providers: ProviderInfo[] } };
  }>(`${HEADLESS}/config`);
  return data.data.socialaccount?.providers ?? [];
}

export function getSession() {
  return apiFetch<AuthResponse>(`${HEADLESS}/auth/session`, { allowStatuses: [401, 410] });
}

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>(`${HEADLESS}/auth/login`, {
    method: 'POST',
    body: { email, password },
    allowStatuses: [401],
  });
}

export function signup(email: string, password: string) {
  return apiFetch<AuthResponse>(`${HEADLESS}/auth/signup`, {
    method: 'POST',
    body: { email, password },
    allowStatuses: [401],
  });
}

export function logout() {
  return apiFetch<AuthResponse>(`${HEADLESS}/auth/session`, {
    method: 'DELETE',
    allowStatuses: [401],
  });
}

export function verifyEmail(key: string) {
  return apiFetch<AuthResponse>(`${HEADLESS}/auth/email/verify`, {
    method: 'POST',
    body: { key },
    allowStatuses: [401],
  });
}

/**
 * Re-sends the verification mail for an address the signed-in user already
 * has. allauth answers 200 when a mail went out and 403 when it was withheld
 * (the per-address `confirm_email` cooldown); 429 means `manage_email` is
 * rate limited. Both non-200 cases reject with `ApiError`.
 */
export function resendEmailVerification(email: string) {
  return apiFetch(`${HEADLESS}/account/email`, {
    method: 'PUT',
    body: { email },
  });
}

export function requestPasswordReset(email: string) {
  return apiFetch(`${HEADLESS}/auth/password/request`, {
    method: 'POST',
    body: { email },
  });
}

export function resetPassword(key: string, password: string) {
  return apiFetch<AuthResponse>(`${HEADLESS}/auth/password/reset`, {
    method: 'POST',
    body: { key, password },
    allowStatuses: [401],
  });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return apiFetch(`${HEADLESS}/account/password/change`, {
    method: 'POST',
    body: { current_password: currentPassword, new_password: newPassword },
  });
}

/**
 * Starts the OAuth dance. allauth expects a regular form POST (the browser
 * must follow the redirect to the provider), so this builds and submits one.
 */
export function redirectToProvider(provider: string, callbackUrl: string) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = `${API_URL}${HEADLESS}/auth/provider/redirect`;
  const fields: Record<string, string> = {
    provider,
    callback_url: callbackUrl,
    process: 'login',
    csrfmiddlewaretoken: getCookie('csrftoken') ?? '',
  };
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

export async function fetchMe(): Promise<User | null> {
  const { status, data } = await apiFetch<User>('/api/v1/me', { allowStatuses: [401, 403] });
  return status === 200 ? data : null;
}

export async function updateMe(patch: UserPatch): Promise<User> {
  const { data } = await apiFetch<User>('/api/v1/me', { method: 'PATCH', body: patch });
  return data;
}
