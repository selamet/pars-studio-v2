/** Shape of a row in `public.reservations`. */
export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export type ServiceType =
  | 'recording'
  | 'mixing'
  | 'mastering'
  | 'beat'
  | 'vocal';

export type Reservation = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  artist_name: string | null;
  service_type: ServiceType;
  session_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  duration_hours: 1 | 2 | 4 | 8;
  project_description: string | null;
  reference_links: string | null;
  status: ReservationStatus;
  admin_notes: string | null;
  locale: 'tr' | 'en';
  updated_at: string;
};
