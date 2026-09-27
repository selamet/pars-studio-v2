'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCart } from '@/components/cart/CartProvider';
import { FormNotice } from '@/components/auth/Field';
import {
  bookingKey,
  fetchAvailability,
  fetchBookingConfig,
  type AvailabilitySlot,
  type BookingConfig,
} from '@/lib/api/bookings';
import { fetchStudioRates, formatUsd, type StudioRate } from '@/lib/api/catalog';
import { cn } from '@/lib/utils';
import DateCalendar from './DateCalendar';

type Locale = 'tr' | 'en';

/**
 * Four-step booking flow driven by the API: rules and rates come from
 * `/bookings/config` and `/catalog/studio-rates`, free start hours from
 * `/bookings/availability`. The result is a cart line; payment confirms it.
 */
export default function BookingForm({ locale }: { locale: Locale }) {
  const t = useTranslations('booking');
  const format = useFormatter();
  const router = useRouter();
  const { user } = useAuth();
  const { add, has } = useCart();

  const [config, setConfig] = useState<BookingConfig | null>(null);
  const [rates, setRates] = useState<StudioRate[]>([]);
  const [service, setService] = useState<string>('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState<number | null>(null);
  const [start, setStart] = useState('');
  const [slots, setSlots] = useState<AvailabilitySlot[] | null>(null);
  const [closed, setClosed] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [artist, setArtist] = useState('');
  const [project, setProject] = useState('');
  const [refs, setRefs] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([fetchBookingConfig(), fetchStudioRates()])
      .then(([cfg, r]) => {
        setConfig(cfg);
        setRates(r);
      })
      .catch(() => setConfig(null));
  }, []);

  useEffect(() => {
    if (user && !name) setName([user.first_name, user.last_name].filter(Boolean).join(' '));
  }, [user, name]);

  const serviceTypes = useMemo(
    () => (config?.service_types ?? []).filter((s) => rates.some((r) => r.service_type === s.id)),
    [config, rates]
  );
  const durations = service && config ? (config.durations[service] ?? []) : [];
  const rate = rates.find((r) => r.service_type === service);

  // Pick a default duration when the service changes.
  useEffect(() => {
    if (durations.length && (duration === null || !durations.includes(duration))) {
      setDuration(durations[0]);
    }
  }, [service, durations, duration]);

  // Fetch availability for the chosen day + service.
  useEffect(() => {
    if (!date || !service) {
      setSlots(null);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    fetchAvailability(date, service)
      .then((a) => {
        if (cancelled) return;
        setSlots(a.slots);
        setClosed(a.closed);
      })
      .catch(() => !cancelled && setSlots([]))
      .finally(() => !cancelled && setLoadingSlots(false));
    return () => {
      cancelled = true;
    };
  }, [date, service]);

  // Drop the start time when it stops fitting the chosen duration.
  const startOptions = useMemo(() => {
    if (!config) return [];
    const hours: string[] = [];
    for (let h = config.open_hour; h < config.close_hour; h++) hours.push(`${String(h).padStart(2, '0')}:00`);
    return hours;
  }, [config]);
  const fits = (time: string) =>
    !!slots?.some((s) => s.start === time && duration !== null && s.durations.includes(duration));
  useEffect(() => {
    if (start && slots && !fits(start)) setStart('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, duration]);

  const price = rate && duration ? Number(rate.hourly_price_usd) * duration : null;
  const line = service && date && duration && start
    ? {
        service_type: service as never,
        session_date: date,
        start_time: `${start}:00`,
        duration_hours: duration as never,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        artist_name: artist.trim(),
        project_description: project.trim(),
        reference_links: refs.trim(),
      }
    : null;
  const inCart = line ? has('booking', 0, bookingKey(line)) : false;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!service) next.service = t('errors.service');
    if (!date) next.date = t('errors.date');
    if (!duration) next.duration = t('errors.duration');
    if (!start) next.time = t('errors.time');
    if (name.trim().length < 2) next.name = t('errors.name');
    if (phone.trim().length < 7) next.phone = t('errors.phone');
    setErrors(next);
    if (Object.keys(next).length || !line || price === null) return;
    const serviceLabel = serviceTypes.find((s) => s.id === service)?.label ?? service;
    add({
      type: 'booking',
      id: 0,
      title: `${t('cartTitle')} — ${serviceLabel}`,
      subtitle: `${format.dateTime(new Date(`${date}T00:00:00`), { dateStyle: 'medium' })} · ${start} · ${duration} ${duration === 1 ? t('schedule.hour') : t('schedule.hours')}`,
      price: price.toFixed(2),
      href: `/${locale}/booking`,
      booking: line,
    });
    router.push(`/${locale}/cart`);
  }

  if (config === null) return <p className="meta animate-pulse">{t('loadingConfig')}</p>;

  return (
    <form onSubmit={submit} className="flex flex-col gap-[clamp(64px,10vh,128px)]" noValidate>
      {/* 01 SERVICE */}
      <fieldset className="flex flex-col gap-8">
        <Legend no="01" label={t('steps.service')} />
        <ul className="border-t hairline">
          {serviceTypes.map((s, i) => {
            const active = service === s.id;
            const r = rates.find((x) => x.service_type === s.id);
            return (
              <li key={s.id} className="border-b hairline">
                <button
                  type="button"
                  onClick={() => setService(s.id)}
                  aria-pressed={active}
                  className={cn(
                    'group block w-full text-left transition-all duration-300 hover:bg-[rgba(255,255,255,0.015)] hover:pl-4',
                    active && 'bg-[rgba(201,169,110,0.04)] pl-4'
                  )}
                >
                  <div className="grid grid-cols-[48px_1fr_auto] items-center gap-6 py-6 md:grid-cols-[64px_1fr_1fr_auto] md:gap-10 md:py-8">
                    <span className={cn('meta transition-colors', active && '!text-accent')}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className={cn('font-serif text-2xl font-light leading-tight transition-colors md:text-3xl', active ? 'text-accent' : 'text-fg')}>
                      {t.has(`serviceInfo.${s.id}` as never) ? t(`serviceInfo.${s.id}.name` as never) : s.label}
                    </h3>
                    <p className="hidden max-w-md text-[13px] leading-[1.6] text-fg/[0.55] md:block">
                      {t.has(`serviceInfo.${s.id}` as never) ? t(`serviceInfo.${s.id}.desc` as never) : ''}
                    </p>
                    <span className="font-mono text-[13px] text-fg-dim">
                      {r ? `${formatUsd(r.hourly_price_usd)}/${t('schedule.hour')}` : ''}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        {serviceTypes.length === 0 && <FormNotice>{t('noRates')}</FormNotice>}
        {errors.service && <ErrorLine>{errors.service}</ErrorLine>}
      </fieldset>

      {/* 02 SCHEDULE */}
      <fieldset className={cn('flex flex-col gap-10 transition-opacity duration-500', !service && 'pointer-events-none opacity-40')}>
        <Legend no="02" label={t('steps.schedule')} />
        <div className="grid gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Label>{t('schedule.dateLabel')}</Label>
            <DateCalendar
              value={date}
              onChange={setDate}
              disabledWeekdays={config.closed_weekdays}
              maxDaysAhead={config.max_advance_days}
            />
            {errors.date && <ErrorLine>{errors.date}</ErrorLine>}
          </div>
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <Label>{t('schedule.durationLabel')}</Label>
              <div className="flex flex-wrap gap-2">
                {durations.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    aria-pressed={duration === d}
                    className={cn(
                      'h-11 border px-5 font-mono text-[12px] tracking-[0.18em] transition-all duration-300',
                      duration === d ? 'border-accent text-accent' : 'border-rule text-fg-dim hover:border-fg-dim hover:text-fg'
                    )}
                  >
                    {d}
                    <span className="ml-1 normal-case tracking-[0.12em]">{d === 1 ? t('schedule.hour') : t('schedule.hours')}</span>
                  </button>
                ))}
              </div>
              {errors.duration && <ErrorLine>{errors.duration}</ErrorLine>}
            </div>
            <div className="flex flex-col gap-4">
              <Label>{t('schedule.timeLabel')}</Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {startOptions.map((time) => {
                  const available = fits(time);
                  const active = start === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={!available || !date}
                      onClick={() => setStart(time)}
                      aria-pressed={active}
                      className={cn(
                        'relative h-11 border font-mono text-[12px] tracking-[0.18em] transition-all duration-300',
                        active ? 'border-accent text-accent' : 'border-rule text-fg-dim hover:border-fg-dim hover:text-fg',
                        !available && 'cursor-not-allowed border-rule/40 text-fg-dim/30 line-through hover:border-rule/40 hover:text-fg-dim/30'
                      )}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
              <p className="meta normal-case tracking-[0.12em] text-fg-dim/70">
                {loadingSlots
                  ? t('schedule.loading')
                  : closed
                    ? t('schedule.closedDay')
                    : slots && slots.length === 0 && date
                      ? t('schedule.noSlots')
                      : t('schedule.timeHint')}
              </p>
              {errors.time && <ErrorLine>{errors.time}</ErrorLine>}
            </div>
          </div>
        </div>
      </fieldset>

      {/* 03 DETAILS */}
      <fieldset className={cn('flex flex-col gap-10 transition-opacity duration-500', !start && 'pointer-events-none opacity-40')}>
        <Legend no="03" label={t('steps.details')} />
        <div className="grid gap-10 md:grid-cols-2">
          <Field id="name" label={t('details.name')} placeholder={t('details.namePh')} value={name} onChange={setName} error={errors.name} autoComplete="name" />
          <Field id="phone" label={t('details.phone')} placeholder={t('details.phonePh')} value={phone} onChange={setPhone} error={errors.phone} autoComplete="tel" type="tel" />
          <Field id="artist" label={`${t('details.artist')} ${t('details.artistOptional')}`} placeholder={t('details.artistPh')} value={artist} onChange={setArtist} />
          <div className="md:col-span-2 flex flex-col gap-3">
            <Label htmlFor="project">{t('details.project')} <span className="text-fg-dim">{t('details.projectOptional')}</span></Label>
            <Textarea id="project" rows={3} placeholder={t('details.projectPh')} value={project} onChange={(e) => setProject(e.target.value)} />
          </div>
          <div className="md:col-span-2 flex flex-col gap-3">
            <Label htmlFor="refs">{t('details.references')} <span className="text-fg-dim">{t('details.referencesOptional')}</span></Label>
            <Textarea id="refs" rows={2} placeholder={t('details.referencesPh')} value={refs} onChange={(e) => setRefs(e.target.value)} />
          </div>
        </div>
      </fieldset>

      {/* 04 REVIEW */}
      <fieldset className={cn('flex flex-col gap-8 transition-opacity duration-500', !start && 'pointer-events-none opacity-40')}>
        <Legend no="04" label={t('steps.review')} />
        <dl className="grid gap-x-10 gap-y-4 border-y border-rule py-6 sm:grid-cols-2">
          <Row k={t('review.service')} v={serviceTypes.find((s) => s.id === service)?.label ?? '—'} />
          <Row k={t('review.date')} v={date ? format.dateTime(new Date(`${date}T00:00:00`), { dateStyle: 'long' }) : '—'} />
          <Row k={t('review.time')} v={start || '—'} />
          <Row k={t('review.duration')} v={duration ? `${duration} ${duration === 1 ? t('schedule.hour') : t('schedule.hours')}` : '—'} />
          <Row k={t('review.price')} v={price !== null ? formatUsd(price) : '—'} />
        </dl>
        <p className="text-[12px] leading-[1.6] text-fg-dim">{t('holdNote', { minutes: config.hold_minutes })}</p>
        {inCart ? (
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href={`/${locale}/cart`}>{t('inCart')}</Link>
          </Button>
        ) : (
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!line}>
            {t('addToCart')}
          </Button>
        )}
      </fieldset>
    </form>
  );
}

function Legend({ no, label }: { no: string; label: string }) {
  return (
    <legend className="flex w-full items-center gap-5">
      <span className="meta !text-accent">{no}</span>
      <span className="h-px w-12 bg-rule" aria-hidden />
      <span className="meta">{label}</span>
    </legend>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="meta">{k}</dt>
      <dd className="font-mono text-[14px] text-fg">{v}</dd>
    </div>
  );
}

function ErrorLine({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] uppercase tracking-meta text-accent">{children}</p>;
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>) {
  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      {error && <ErrorLine>{error}</ErrorLine>}
    </div>
  );
}
