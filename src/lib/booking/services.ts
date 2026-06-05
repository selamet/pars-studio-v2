export type ServiceId =
  | 'recording'
  | 'mixing'
  | 'mastering'
  | 'beat'
  | 'vocal';

export type Duration = 1 | 2 | 4 | 8;

export type ServiceDef = {
  id: ServiceId;
  no: string;
  name: { tr: string; en: string };
  description: { tr: string; en: string };
  durations: Duration[];
  minDuration: Duration;
};

export const SERVICES: ServiceDef[] = [
  {
    id: 'recording',
    no: '01',
    name: { tr: 'Kayıt', en: 'Recording' },
    description: {
      tr: 'Profesyonel stüdyo kaydı — vokal, enstrüman ve canlı oda. Doğru sinyal zinciri, gürültüsüz tracking.',
      en: 'Professional studio recording — vocals, instruments and live room. Clean signal chain, noise-free tracking.',
    },
    durations: [2, 4, 8],
    minDuration: 2,
  },
  {
    id: 'mixing',
    no: '02',
    name: { tr: 'Miks', en: 'Mixing' },
    description: {
      tr: 'Parçaya derinlik, alan ve denge. Stem teslimat ve revizyon dahil oturum.',
      en: 'Depth, space and balance for the track. Session includes stems and revisions.',
    },
    durations: [4, 8],
    minDuration: 4,
  },
  {
    id: 'mastering',
    no: '03',
    name: { tr: 'Mastering', en: 'Mastering' },
    description: {
      tr: 'Yayına hazır, tutarlı ve şeffaf mastering. Dijital ve fiziksel formatlar için.',
      en: 'Release-ready, consistent and transparent mastering. Digital and physical.',
    },
    durations: [1, 2],
    minDuration: 1,
  },
  {
    id: 'beat',
    no: '04',
    name: { tr: 'Beat Prodüksiyon', en: 'Beat Production' },
    description: {
      tr: 'Sanatçının dünyasına özel, sıfırdan kurgulanan prodüksiyon.',
      en: 'Production built from scratch around the artist.',
    },
    durations: [4, 8],
    minDuration: 4,
  },
  {
    id: 'vocal',
    no: '05',
    name: { tr: 'Vokal Prodüksiyon', en: 'Vocal Production' },
    description: {
      tr: 'Performans yönetimi, comp, tuning ve estetik karar. Vokali parçanın merkezine oturtmak.',
      en: 'Performance direction, comping, tuning and aesthetic calls. Voice at the centre.',
    },
    durations: [2, 4],
    minDuration: 2,
  },
];

export function getService(id: string): ServiceDef | undefined {
  return SERVICES.find((s) => s.id === id);
}

/** Bookable session start times (24h). */
export const TIME_SLOTS = [
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
];

/** Studio opening hours (24h). A session may not run past `close`. */
export const STUDIO_HOURS = { open: 10, close: 22 } as const;

/**
 * Weekdays the studio is closed (date-fns getDay: 0 = Sunday … 6 = Saturday).
 * Change this array to open/close days.
 */
export const DISABLED_WEEKDAYS: number[] = [0]; // Sundays closed
