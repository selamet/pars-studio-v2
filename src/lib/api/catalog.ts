/**
 * Read-only catalog fetchers. Safe in server components (no cookies needed);
 * results are cached by Next for a minute.
 */

import { API_URL } from './client';
import type { components } from './schema';

export type BeatList = components['schemas']['BeatList'];
export type BeatDetail = components['schemas']['BeatDetail'];
export type BeatLicense = components['schemas']['BeatLicense'];
export type ServiceProduct = components['schemas']['ServiceProduct'];
export type StudioRate = components['schemas']['StudioRate'];
export type PaginatedBeats = components['schemas']['PaginatedBeatListList'];

export type BeatQuery = Partial<
  Record<'genre' | 'key' | 'bpm_min' | 'bpm_max' | 'tag' | 'search' | 'ordering' | 'page', string>
>;

export const BEAT_ORDERINGS = ['-published_at', 'published_at', 'bpm', '-bpm', 'title'] as const;

async function get<T>(path: string, revalidate = 60): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status} for ${path}`);
  return (await res.json()) as T;
}

export function beatQueryString(query: BeatQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

export async function fetchBeats(query: BeatQuery = {}): Promise<PaginatedBeats> {
  const data = await get<PaginatedBeats>(`/api/v1/catalog/beats/${beatQueryString(query)}`);
  return data ?? { count: 0, next: null, previous: null, results: [] };
}

export function fetchBeat(slug: string): Promise<BeatDetail | null> {
  return get<BeatDetail>(`/api/v1/catalog/beats/${encodeURIComponent(slug)}/`);
}

export async function fetchServices(): Promise<ServiceProduct[]> {
  return (await get<ServiceProduct[]>('/api/v1/catalog/services/')) ?? [];
}

export async function fetchStudioRates(): Promise<StudioRate[]> {
  return (await get<StudioRate[]>('/api/v1/catalog/studio-rates/')) ?? [];
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** "29.00" → "$29", "49.50" → "$49.50" */
export function formatUsd(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  return usd.format(Number(value));
}
