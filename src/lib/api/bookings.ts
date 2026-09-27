import { API_URL, apiFetch } from './client';
import type { components } from './schema';

export type BookingConfig = components['schemas']['BookingConfig'];
export type Availability = components['schemas']['Availability'];
export type AvailabilitySlot = components['schemas']['AvailabilitySlot'];
export type BookingLine = components['schemas']['BookingLineRequest'];
export type Reservation = components['schemas']['Reservation'];

const BASE = '/api/v1/bookings';

export async function fetchBookingConfig(): Promise<BookingConfig> {
  const { data } = await apiFetch<BookingConfig>(`${BASE}/config`);
  return data;
}

export async function fetchAvailability(date: string, serviceType: string): Promise<Availability> {
  const params = new URLSearchParams({ date, service_type: serviceType });
  const { data } = await apiFetch<Availability>(`${BASE}/availability?${params}`);
  return data;
}

export async function fetchReservations(): Promise<Reservation[]> {
  const { data } = await apiFetch<components['schemas']['PaginatedReservationList']>(`${BASE}/`);
  return data.results;
}

/** Direct link (cookie-authenticated) to the .ics file of a reservation. */
export function reservationIcsUrl(id: number): string {
  return `${API_URL}${BASE}/${id}/ics/`;
}

/** Stable cart key for a booking line: one slot per date/time. */
export function bookingKey(line: Pick<BookingLine, 'session_date' | 'start_time'>): string {
  return `booking:${line.session_date}:${line.start_time.slice(0, 5)}`;
}
