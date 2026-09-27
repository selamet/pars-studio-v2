import { apiFetch } from './client';
import type { components } from './schema';

export type Order = components['schemas']['Order'];
export type OrderItem = components['schemas']['OrderItem'];
export type DownloadGrant = components['schemas']['DownloadGrant'];
export type PaginatedOrders = components['schemas']['PaginatedOrderList'];
export type CheckoutRequest = components['schemas']['CheckoutRequest'];
export type CheckoutResponse = components['schemas']['CheckoutResponse'];
export type DownloadLink = components['schemas']['DownloadLink'];

export type CheckoutConflict = {
  detail: string;
  code: string;
  line: { type: string; id: number } | null;
};

export async function startCheckout(body: CheckoutRequest): Promise<CheckoutResponse> {
  const { data } = await apiFetch<CheckoutResponse>('/api/v1/checkout', { method: 'POST', body });
  return data;
}

export async function fetchOrders(page = 1): Promise<PaginatedOrders> {
  const { data } = await apiFetch<PaginatedOrders>(`/api/v1/orders/?page=${page}`);
  return data;
}

export async function fetchOrder(number: string): Promise<Order | null> {
  const { status, data } = await apiFetch<Order>(`/api/v1/orders/${encodeURIComponent(number)}/`, {
    allowStatuses: [404],
  });
  return status === 200 ? data : null;
}

export async function mintDownloadLink(grantId: number): Promise<DownloadLink> {
  const { data } = await apiFetch<DownloadLink>(`/api/v1/downloads/${grantId}/link`, {
    method: 'POST',
  });
  return data;
}
