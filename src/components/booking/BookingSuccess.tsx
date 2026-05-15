'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowUpRight, Check } from 'lucide-react';
import type { ReservationInput } from '@/lib/validation/reservation';
import { SERVICES } from '@/lib/booking/services';
import { Button } from '@/components/ui/button';

type Locale = 'tr' | 'en';

export default function BookingSuccess({
  locale,
  id,
  code,
  data,
}: {
  locale: Locale;
  id: string;
  code: string;
  data: ReservationInput;
}) {
  const t = useTranslations('booking.success');
  const tReview = useTranslations('booking.review');
  const tSchedule = useTranslations('booking.schedule');

  const service = SERVICES.find((s) => s.id === data.serviceType);

  const rows: Array<[string, string]> = [
    [tReview('service'), service?.name[locale] ?? data.serviceType],
    [tReview('date'), formatDateDisplay(data.sessionDate, locale)],
    [tReview('time'), data.startTime],
    [
      tReview('duration'),
      `${data.durationHours} ${
        data.durationHours === 1 ? tSchedule('hour') : tSchedule('hours')
      }`,
    ],
    [tReview('name'), data.customerName],
    [tReview('email'), data.customerEmail],
  ];

  return (
    <div className="flex flex-col gap-[clamp(48px,7vh,96px)]">
      <div className="flex flex-col gap-7">
        <div className="flex items-center gap-5">
          <span
            className="flex h-9 w-9 items-center justify-center border border-accent text-accent"
            aria-hidden
          >
            <Check className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <span className="meta !text-accent">{t('label')}</span>
        </div>
        <h2 className="max-w-[18ch] font-serif font-light leading-[1.04] tracking-[-0.012em] text-[clamp(34px,4.6vw,68px)]">
          {t('heading')}
        </h2>
        <p className="max-w-xl text-[15px] leading-[1.7] text-fg/[0.7]">
          {t('body')}
        </p>
      </div>

      {/* Confirmation code */}
      <div className="flex flex-col gap-3 border-t border-b hairline py-8 md:flex-row md:items-center md:justify-between">
        <span className="meta">{t('codeLabel')}</span>
        <span className="font-mono text-[clamp(24px,3vw,36px)] tracking-[0.3em] text-accent">
          {code}
        </span>
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-6">
        <span className="meta">{t('summary')}</span>
        <dl className="grid gap-x-10 gap-y-4 md:grid-cols-2">
          {rows.map(([k, v]) => (
            <div
              key={k}
              className="flex items-baseline justify-between gap-6 border-b hairline pb-3"
            >
              <dt className="meta">{k}</dt>
              <dd className="font-serif text-[15px] text-fg text-right">
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-start gap-4 pt-6 md:flex-row md:items-center md:justify-between">
        <a
          href={`/api/reservations/${id}/ics`}
          className="group inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-meta text-fg transition-colors hover:text-accent"
        >
          {t('downloadIcs')}
          <ArrowUpRight
            className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            strokeWidth={1.5}
          />
        </a>

        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="lg">
            <Link href={`/${locale}`}>{t('home')}</Link>
          </Button>
          <Button asChild size="lg">
            <Link href={`/${locale}/booking`}>{t('another')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatDateDisplay(iso: string, locale: Locale): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (locale === 'tr') {
    return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`;
  }
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}
