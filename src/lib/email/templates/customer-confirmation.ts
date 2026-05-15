import type { Reservation } from '@/lib/supabase/types';
import {
  COLORS as C,
  confirmationCode,
  formatDate,
  formatTime,
  layout,
  serviceName,
  summaryTable,
} from './shared';

type Built = { subject: string; html: string };

const T = {
  tr: {
    subject: (c: string) => `Pars Studio — Rezervasyon alındı (#${c})`,
    h: 'Rezervasyon alındı.',
    lead: 'Talebini aldık. Email kutunu kontrol et — 24 saat içinde dönüş yapacağız.',
    code: 'Onay kodu',
    rows: { service: 'Hizmet', date: 'Tarih', time: 'Saat', duration: 'Süre' },
    hours: (h: number) => `${h} saat`,
    note: 'Durum: Onay bekleniyor. Ödeme nakit veya havale ile, seans sonunda alınır — online ödeme yoktur.',
  },
  en: {
    subject: (c: string) => `Pars Studio — Reservation received (#${c})`,
    h: 'Reservation received.',
    lead: "We've got your request. Check your inbox — we'll respond within 24 hours.",
    code: 'Confirmation code',
    rows: { service: 'Service', date: 'Date', time: 'Time', duration: 'Duration' },
    hours: (h: number) => `${h} h`,
    note: 'Status: Awaiting confirmation. Payment is cash or bank transfer after the session — there is no online payment.',
  },
  status: {
    confirmed: {
      tr: {
        subject: (c: string) => `Pars Studio — Rezervasyon onaylandı (#${c})`,
        h: 'Rezervasyon onaylandı.',
        lead: 'Seansın onaylandı. Aşağıdaki detaylarla seni bekliyoruz.',
      },
      en: {
        subject: (c: string) => `Pars Studio — Reservation confirmed (#${c})`,
        h: 'Reservation confirmed.',
        lead: 'Your session is confirmed. We look forward to seeing you.',
      },
    },
    cancelled: {
      tr: {
        subject: (c: string) => `Pars Studio — Rezervasyon iptal edildi (#${c})`,
        h: 'Rezervasyon iptal edildi.',
        lead: 'Bu rezervasyon iptal edildi. Sorun varsa bize yanıtla.',
      },
      en: {
        subject: (c: string) => `Pars Studio — Reservation cancelled (#${c})`,
        h: 'Reservation cancelled.',
        lead: 'This reservation has been cancelled. Reply to us if anything is wrong.',
      },
    },
  },
};

function detailRows(r: Reservation) {
  const t = T[r.locale];
  return summaryTable([
    [t.rows.service, serviceName(r)],
    [t.rows.date, formatDate(r.session_date, r.locale)],
    [t.rows.time, formatTime(r.start_time)],
    [t.rows.duration, t.hours(r.duration_hours)],
  ]);
}

function shell(r: Reservation, head: { h: string; lead: string }): string {
  const t = T[r.locale];
  const code = confirmationCode(r.id);
  return layout({
    preheader: head.lead,
    body: `
<h1 style="margin:0;font-family:Georgia,serif;font-weight:400;font-size:34px;line-height:1.15;color:${C.fg};">${head.h}</h1>
<div style="height:14px;"></div>
<p style="margin:0;font-family:Georgia,serif;font-size:15px;line-height:1.7;color:${C.fg};opacity:.8;">${head.lead}</p>
<div style="height:28px;"></div>
<div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:3px;color:${C.dim};text-transform:uppercase;">${t.code}</div>
<div style="height:6px;"></div>
<div style="font-family:Georgia,serif;font-size:30px;letter-spacing:4px;color:${C.accent};">#${code}</div>
<div style="height:26px;"></div>
${detailRows(r)}
<div style="height:24px;"></div>
<p style="margin:0;font-family:'Courier New',monospace;font-size:11px;line-height:1.8;letter-spacing:1px;color:${C.dim};text-transform:uppercase;">${t.note}</p>`,
  });
}

export function customerConfirmationEmail(r: Reservation): Built {
  const t = T[r.locale];
  return {
    subject: t.subject(confirmationCode(r.id)),
    html: shell(r, { h: t.h, lead: t.lead }),
  };
}

export function customerStatusEmail(
  r: Reservation,
  status: 'confirmed' | 'cancelled'
): Built {
  const s = T.status[status][r.locale];
  return {
    subject: s.subject(confirmationCode(r.id)),
    html: shell(r, { h: s.h, lead: s.lead }),
  };
}
