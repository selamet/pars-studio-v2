import type { Reservation } from '@/lib/types';
import { getService } from '@/lib/booking/services';

const MONTHS_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function confirmationCode(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

/** TR → DD.MM.YYYY · EN → MMM D, YYYY */
export function formatDate(iso: string, locale: 'tr' | 'en'): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (locale === 'tr') {
    return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`;
  }
  return `${MONTHS_EN[m - 1]} ${d}, ${y}`;
}

export function formatTime(t: string): string {
  return t.slice(0, 5); // HH:MM
}

export function serviceName(r: Reservation): string {
  return getService(r.service_type)?.name[r.locale] ?? r.service_type;
}

const C = {
  bg: '#0a0908',
  card: '#14110f',
  fg: '#ece8df',
  dim: '#8a847a',
  accent: '#c9a96e',
  rule: '#2a2723',
};

/** Wraps body HTML in a bullet-proof, dark, editorial email shell. */
export function layout(opts: {
  preheader: string;
  body: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="dark"/></head>
<body style="margin:0;padding:0;background:${C.bg};">
<span style="display:none;opacity:0;color:${C.bg};font-size:1px;line-height:1px;max-height:0;max-width:0;overflow:hidden;">${opts.preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.card};border:1px solid ${C.rule};">
<tr><td style="padding:36px 40px;font-family:Georgia,'Times New Roman',serif;">
<div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:4px;color:${C.dim};text-transform:uppercase;">PARS&nbsp;&nbsp;STUDIO</div>
<div style="height:28px;"></div>
${opts.body}
<div style="height:36px;"></div>
<div style="border-top:1px solid ${C.rule};padding-top:20px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;color:${C.dim};text-transform:uppercase;">
Pars Studio · İstanbul
</div>
</td></tr></table>
</td></tr></table>
</body></html>`;
}

export function summaryTable(rows: Array<[string, string]>): string {
  const trs = rows
    .map(
      ([k, v]) => `<tr>
<td style="padding:10px 0;border-bottom:1px solid ${C.rule};font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;color:${C.dim};text-transform:uppercase;width:42%;">${k}</td>
<td style="padding:10px 0;border-bottom:1px solid ${C.rule};font-family:Georgia,serif;font-size:15px;color:${C.fg};">${v}</td>
</tr>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${trs}</table>`;
}

export function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:${C.accent};">
<a href="${href}" style="display:inline-block;padding:14px 28px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${C.bg};text-decoration:none;">${label}</a>
</td></tr></table>`;
}

export const COLORS = C;
