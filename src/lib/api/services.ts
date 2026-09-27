import { API_URL, apiFetch, getCookie } from './client';
import type { components } from './schema';

export type ServiceOrder = components['schemas']['ServiceOrder'];
export type ServiceFile = components['schemas']['ServiceFile'];
export type ServiceEvent = components['schemas']['ServiceEvent'];
export type PresignResponse = components['schemas']['PresignResponse'];
export type DownloadLink = components['schemas']['DownloadLink'];

const BASE = '/api/v1/service-orders';

export async function fetchServiceOrders(): Promise<ServiceOrder[]> {
  const { data } = await apiFetch<components['schemas']['PaginatedServiceOrderList']>(`${BASE}/`);
  return data.results;
}

export async function fetchServiceOrder(id: number | string): Promise<ServiceOrder | null> {
  const { status, data } = await apiFetch<ServiceOrder>(`${BASE}/${id}/`, { allowStatuses: [404] });
  return status === 200 ? data : null;
}

export async function updateBrief(
  id: number,
  patch: { notes?: string; reference_links?: string }
): Promise<ServiceOrder> {
  const { data } = await apiFetch<ServiceOrder>(`${BASE}/${id}/`, { method: 'PATCH', body: patch });
  return data;
}

export async function requestRevision(id: number, message: string): Promise<ServiceOrder> {
  const { data } = await apiFetch<ServiceOrder>(`${BASE}/${id}/request-revision/`, {
    method: 'POST',
    body: { message },
  });
  return data;
}

export async function acceptDelivery(id: number): Promise<ServiceOrder> {
  const { data } = await apiFetch<ServiceOrder>(`${BASE}/${id}/accept/`, { method: 'POST' });
  return data;
}

export async function deliverableLink(id: number, fileId: number): Promise<DownloadLink> {
  const { data } = await apiFetch<DownloadLink>(`${BASE}/${id}/files/${fileId}/link/`, {
    method: 'POST',
  });
  return data;
}

/**
 * Upload one file: ask the API where to put it, then either PUT straight to
 * R2 and confirm, or POST the body to the API's local fallback endpoint.
 * `onProgress` receives 0..1.
 */
export async function uploadServiceFile(
  id: number,
  file: File,
  onProgress?: (fraction: number) => void
): Promise<ServiceFile> {
  const { data: presign } = await apiFetch<PresignResponse>(`${BASE}/${id}/files/presign/`, {
    method: 'POST',
    body: { file_name: file.name, size: file.size, content_type: file.type || '' },
  });

  if (presign.direct) {
    await xhrSend(presign.upload_url, presign.method, file, presign.headers, onProgress);
    const { data } = await apiFetch<ServiceFile>(`${BASE}/${id}/files/`, {
      method: 'POST',
      body: { key: presign.key, file_name: file.name, size: file.size, content_type: file.type || '' },
    });
    return data;
  }

  const form = new FormData();
  form.append('key', presign.key);
  form.append('file', file, file.name);
  const csrf = getCookie('csrftoken');
  const response = await xhrSend(
    presign.upload_url.startsWith('http') ? presign.upload_url : `${API_URL}${presign.upload_url}`,
    'POST',
    form,
    csrf ? { 'X-CSRFToken': csrf } : {},
    onProgress,
    true
  );
  return JSON.parse(response) as ServiceFile;
}

function xhrSend(
  url: string,
  method: string,
  body: File | FormData,
  headers: Record<string, string>,
  onProgress?: (fraction: number) => void,
  withCredentials = false
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.withCredentials = withCredentials;
    for (const [name, value] of Object.entries(headers)) xhr.setRequestHeader(name, value);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText);
      else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(body);
  });
}
