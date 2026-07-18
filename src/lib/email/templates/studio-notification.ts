import type { Reservation } from '@/lib/types';
import {
  COLORS as C,
  button,
  confirmationCode,
  formatDate,
  formatTime,
  layout,
  serviceName,
  summaryTable,
} from './shared';

const L = {
  tr: {
    subject: (a: string, s: string, d: string, ti: string) =>
      `Yeni rezervasyon: ${a} · ${s} · ${d} ${ti}`,
    h: 'Yeni rezervasyon',
    manage: 'Yönet',
    rows: {
      code: 'Kod',
      customer: 'Müşteri',
      artist: 'Sanatçı',
      email: 'Email',
      phone: 'Telefon',
      service: 'Hizmet',
      date: 'Tarih',
      time: 'Saat',
      duration: 'Süre',
      project: 'Proje',
      refs: 'Referanslar',
    },
    hours: (h: number) => `${h} saat`,
    none: '—',
  },
  en: {
    subject: (a: string, s: string, d: string, ti: string) =>
      `New reservation: ${a} · ${s} · ${d} ${ti}`,
    h: 'New reservation',
    manage: 'Manage',
    rows: {
      code: 'Code',
      customer: 'Customer',
      artist: 'Artist',
      email: 'Email',
      phone: 'Phone',
      service: 'Service',
      date: 'Date',
      time: 'Time',
      duration: 'Duration',
      project: 'Project',
      refs: 'References',
    },
    hours: (h: number) => `${h} h`,
    none: '—',
  },
};

function linkify(text: string | null): string {
  if (!text) return '—';
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      /^https?:\/\//i.test(line)
        ? `<a href="${line}" style="color:${C.accent};">${line}</a>`
        : line
    )
    .join('<br/>');
}

export function studioNotificationEmail(
  r: Reservation,
  siteUrl: string
): { subject: string; html: string } {
  const t = L[r.locale];
  const code = confirmationCode(r.id);
  const svc = serviceName(r);
  const date = formatDate(r.session_date, r.locale);
  const time = formatTime(r.start_time);
  const manageUrl = `${siteUrl}/${r.locale}/admin/${r.id}`;

  return {
    subject: t.subject(r.artist_name || r.customer_name, svc, date, time),
    html: layout({
      preheader: `${r.customer_name} — ${svc} — ${date} ${time}`,
      body: `
<h1 style="margin:0;font-family:Georgia,serif;font-weight:400;font-size:30px;color:${C.fg};">${t.h}</h1>
<div style="height:22px;"></div>
${summaryTable([
  [t.rows.code, `#${code}`],
  [t.rows.customer, r.customer_name],
  [t.rows.artist, r.artist_name || t.none],
  [t.rows.email, `<a href="mailto:${r.customer_email}" style="color:${C.accent};">${r.customer_email}</a>`],
  [t.rows.phone, `<a href="tel:${r.customer_phone}" style="color:${C.accent};">${r.customer_phone}</a>`],
  [t.rows.service, svc],
  [t.rows.date, date],
  [t.rows.time, time],
  [t.rows.duration, t.hours(r.duration_hours)],
  [t.rows.project, r.project_description ? r.project_description.replace(/\n/g, '<br/>') : t.none],
  [t.rows.refs, linkify(r.reference_links)],
])}
<div style="height:28px;"></div>
${button(t.manage, manageUrl)}`,
    }),
  };
}
