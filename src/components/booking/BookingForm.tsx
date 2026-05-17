'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  reservationSchema,
  type ReservationInput,
} from '@/lib/validation/reservation';
import {
  SERVICES,
  TIME_SLOTS,
  type ServiceDef,
  type Duration,
} from '@/lib/booking/services';
import {
  unavailableStartTimes,
  type BookedSlot,
} from '@/lib/booking/availability';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import DateCalendar from './DateCalendar';
import BookingSuccess from './BookingSuccess';

type Locale = 'tr' | 'en';
type ServerError = { code: 'slot_taken' } | { code: 'server' } | null;

export default function BookingForm({ locale }: { locale: Locale }) {
  const t = useTranslations('booking');
  const tErr = useTranslations('booking.errors');

  const [success, setSuccess] = useState<{
    id: string;
    code: string;
    data: ReservationInput;
  } | null>(null);
  const [booked, setBooked] = useState<BookedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [serverError, setServerError] = useState<ServerError>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    mode: 'onChange',
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      artistName: '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      serviceType: undefined as any,
      sessionDate: '',
      startTime: '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      durationHours: undefined as any,
      projectDescription: '',
      referenceLinks: '',
      locale,
    },
  });

  const serviceType = watch('serviceType');
  const sessionDate = watch('sessionDate');
  const durationHours = watch('durationHours');
  const startTime = watch('startTime');

  const selectedService: ServiceDef | undefined = useMemo(
    () => SERVICES.find((s) => s.id === serviceType),
    [serviceType]
  );

  // Reset dependent fields when the service changes.
  useEffect(() => {
    if (!selectedService) return;
    if (durationHours && !selectedService.durations.includes(durationHours)) {
      setValue('durationHours', selectedService.minDuration, {
        shouldValidate: true,
      });
    } else if (!durationHours) {
      setValue('durationHours', selectedService.minDuration, {
        shouldValidate: true,
      });
    }
  }, [selectedService, durationHours, setValue]);

  // Fetch booked slots whenever the date changes.
  useEffect(() => {
    if (!sessionDate) {
      setBooked([]);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    fetch(`/api/reservations?date=${sessionDate}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: BookedSlot[]) => {
        if (!cancelled) setBooked(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setBooked([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionDate]);

  const unavailable = useMemo(
    () =>
      durationHours
        ? unavailableStartTimes(booked, durationHours)
        : new Set<string>(),
    [booked, durationHours]
  );

  // Clear startTime if it's no longer valid.
  useEffect(() => {
    if (startTime && unavailable.has(startTime)) {
      setValue('startTime', '', { shouldValidate: true });
    }
  }, [unavailable, startTime, setValue]);

  async function onSubmit(values: ReservationInput) {
    setServerError(null);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.status === 409) {
        setServerError({ code: 'slot_taken' });
        return;
      }
      if (!res.ok) {
        setServerError({ code: 'server' });
        return;
      }
      const json = (await res.json()) as { id: string; confirmationCode: string };
      setSuccess({ id: json.id, code: json.confirmationCode, data: values });
    } catch {
      setServerError({ code: 'server' });
    }
  }

  if (success) {
    return (
      <BookingSuccess
        locale={locale}
        id={success.id}
        code={success.code}
        data={success.data}
      />
    );
  }

  const allDurations: Duration[] = [1, 2, 4, 8];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-[clamp(64px,10vh,128px)]"
      noValidate
    >
      {/* ─── 01. SERVICE ─────────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-8">
        <legend className="flex w-full items-center gap-5">
          <span className="meta !text-accent">01</span>
          <span className="h-px w-12 bg-rule" aria-hidden />
          <span className="meta">{t('steps.service')}</span>
        </legend>

        <Controller
          control={control}
          name="serviceType"
          render={({ field }) => (
            <ul className="border-t hairline">
              {SERVICES.map((s) => {
                const active = field.value === s.id;
                return (
                  <li key={s.id} className="border-b hairline">
                    <button
                      type="button"
                      onClick={() => field.onChange(s.id)}
                      className={cn(
                        'group block w-full text-left transition-all duration-300 hover:bg-[rgba(255,255,255,0.015)] hover:pl-4',
                        active && 'pl-4 bg-[rgba(201,169,110,0.04)]'
                      )}
                      aria-pressed={active}
                    >
                      <div className="grid grid-cols-[48px_1fr] items-center gap-6 py-6 md:grid-cols-[64px_1fr_1fr] md:gap-10 md:py-8">
                        <span
                          className={cn(
                            'meta transition-colors',
                            active && '!text-accent'
                          )}
                        >
                          {s.no}
                        </span>
                        <h3
                          className={cn(
                            'font-serif text-2xl font-light leading-tight transition-colors md:text-3xl',
                            active ? 'text-accent' : 'text-fg'
                          )}
                        >
                          {s.name[locale]}
                        </h3>
                        <p className="hidden max-w-md text-[13px] leading-[1.6] text-fg/[0.55] md:block">
                          {s.description[locale]}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        />
        {errors.serviceType && (
          <ErrorLine>{tErr(errors.serviceType.message?.split('.').pop() || 'service')}</ErrorLine>
        )}
      </fieldset>

      {/* ─── 02. SCHEDULE ────────────────────────────────────────── */}
      <fieldset
        className={cn(
          'flex flex-col gap-10 transition-opacity duration-500',
          !selectedService && 'pointer-events-none opacity-40'
        )}
      >
        <legend className="flex w-full items-center gap-5">
          <span className="meta !text-accent">02</span>
          <span className="h-px w-12 bg-rule" aria-hidden />
          <span className="meta">{t('steps.schedule')}</span>
        </legend>

        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Date */}
          <div className="flex flex-col gap-4">
            <Label htmlFor="sessionDate">{t('schedule.dateLabel')}</Label>
            <Controller
              control={control}
              name="sessionDate"
              render={({ field }) => (
                <DateCalendar
                  value={field.value}
                  onChange={field.onChange}
                  locale={locale}
                />
              )}
            />
            {errors.sessionDate && (
              <ErrorLine>{tErr('date')}</ErrorLine>
            )}
          </div>

          {/* Duration + Time */}
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <Label>{t('schedule.durationLabel')}</Label>
              <Controller
                control={control}
                name="durationHours"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-3">
                    {allDurations.map((d) => {
                      const enabled =
                        !selectedService || selectedService.durations.includes(d);
                      const active = field.value === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          disabled={!enabled}
                          onClick={() => field.onChange(d)}
                          className={cn(
                            'h-11 min-w-[64px] border font-mono text-[11px] uppercase tracking-meta transition-all duration-300',
                            active
                              ? 'border-accent text-accent'
                              : 'border-rule text-fg-dim hover:border-fg-dim hover:text-fg',
                            !enabled && 'opacity-25'
                          )}
                          aria-pressed={active}
                        >
                          {d}
                          <span className="ml-1 normal-case tracking-[0.12em]">
                            {d === 1 ? t('schedule.hour') : t('schedule.hours')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            <div className="flex flex-col gap-4">
              <Label>{t('schedule.timeLabel')}</Label>
              <Controller
                control={control}
                name="startTime"
                render={({ field }) => (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {TIME_SLOTS.map((slot) => {
                      const taken = unavailable.has(slot);
                      const active = field.value === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={taken || !sessionDate || !durationHours}
                          onClick={() => field.onChange(slot)}
                          className={cn(
                            'relative h-11 border font-mono text-[12px] tracking-[0.18em] transition-all duration-300',
                            active
                              ? 'border-accent text-accent'
                              : 'border-rule text-fg-dim hover:border-fg-dim hover:text-fg',
                            taken &&
                              'cursor-not-allowed border-rule/40 text-fg-dim/30 line-through hover:border-rule/40 hover:text-fg-dim/30'
                          )}
                          aria-pressed={active}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              <p className="meta normal-case tracking-[0.12em] text-fg-dim/70">
                {loadingSlots
                  ? t('schedule.loading')
                  : t('schedule.timeHint')}
              </p>
              {errors.startTime && (
                <ErrorLine>{tErr('time')}</ErrorLine>
              )}
            </div>
          </div>
        </div>
      </fieldset>

      {/* ─── 03. DETAILS ─────────────────────────────────────────── */}
      <fieldset
        className={cn(
          'flex flex-col gap-10 transition-opacity duration-500',
          (!sessionDate || !startTime) && 'pointer-events-none opacity-40'
        )}
      >
        <legend className="flex w-full items-center gap-5">
          <span className="meta !text-accent">03</span>
          <span className="h-px w-12 bg-rule" aria-hidden />
          <span className="meta">{t('steps.details')}</span>
        </legend>

        <div className="grid gap-8 md:grid-cols-2 md:gap-x-12">
          <Field
            id="customerName"
            label={t('details.name')}
            placeholder={t('details.namePh')}
            register={register('customerName')}
            error={errors.customerName?.message}
            tErr={tErr}
          />
          <Field
            id="customerEmail"
            label={t('details.email')}
            placeholder={t('details.emailPh')}
            type="email"
            register={register('customerEmail')}
            error={errors.customerEmail?.message}
            tErr={tErr}
          />
          <Field
            id="customerPhone"
            label={t('details.phone')}
            placeholder={t('details.phonePh')}
            type="tel"
            register={register('customerPhone')}
            error={errors.customerPhone?.message}
            tErr={tErr}
          />
          <Field
            id="artistName"
            label={`${t('details.artist')}  ${t('details.artistOptional')}`}
            placeholder={t('details.artistPh')}
            register={register('artistName')}
            error={errors.artistName?.message}
            tErr={tErr}
          />

          <div className="flex flex-col gap-3 md:col-span-2">
            <Label htmlFor="projectDescription">
              {t('details.project')}{' '}
              <span className="normal-case tracking-[0.12em] text-fg-dim/70">
                {t('details.projectOptional')}
              </span>
            </Label>
            <Textarea
              id="projectDescription"
              placeholder={t('details.projectPh')}
              rows={3}
              {...register('projectDescription')}
            />
          </div>

          <div className="flex flex-col gap-3 md:col-span-2">
            <Label htmlFor="referenceLinks">
              {t('details.references')}{' '}
              <span className="normal-case tracking-[0.12em] text-fg-dim/70">
                {t('details.referencesOptional')}
              </span>
            </Label>
            <Textarea
              id="referenceLinks"
              placeholder={t('details.referencesPh')}
              rows={2}
              {...register('referenceLinks')}
            />
          </div>
        </div>
      </fieldset>

      {/* ─── 04. REVIEW + SUBMIT ─────────────────────────────────── */}
      <fieldset className="flex flex-col gap-10">
        <legend className="flex w-full items-center gap-5">
          <span className="meta !text-accent">04</span>
          <span className="h-px w-12 bg-rule" aria-hidden />
          <span className="meta">{t('steps.review')}</span>
        </legend>

        <ReviewBlock
          locale={locale}
          values={watch()}
          service={selectedService}
        />

        {serverError && (
          <p className="border border-accent/50 px-4 py-3 font-mono text-[12px] uppercase tracking-meta text-accent">
            {serverError.code === 'slot_taken'
              ? tErr('slotTaken')
              : tErr('server')}
          </p>
        )}

        <div className="flex flex-col items-start gap-5 border-t hairline pt-10 md:flex-row md:items-center md:justify-between">
          <p className="max-w-md text-[12px] leading-[1.7] text-fg-dim">
            {t('review.consent')}
          </p>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="lg">
              <Link href={`/${locale}`}>{t('back')}</Link>
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? t('submitting') : t('submit')}
            </Button>
          </div>
        </div>
      </fieldset>
    </form>
  );
}

/* ───────────────────────── helpers ───────────────────────── */

function ErrorLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-meta text-accent">
      {children}
    </p>
  );
}

function Field({
  id,
  label,
  placeholder,
  type = 'text',
  register,
  error,
  tErr,
}: {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  error?: string;
  tErr: (key: string) => string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} placeholder={placeholder} {...register} />
      {error && <ErrorLine>{tErr(error.split('.').pop() || 'name')}</ErrorLine>}
    </div>
  );
}

function ReviewBlock({
  locale,
  values,
  service,
}: {
  locale: Locale;
  values: Partial<ReservationInput>;
  service: ServiceDef | undefined;
}) {
  const t = useTranslations('booking');
  const rows: Array<[string, string]> = [];
  if (service) rows.push([t('review.service'), service.name[locale]]);
  if (values.sessionDate)
    rows.push([t('review.date'), formatDateDisplay(values.sessionDate, locale)]);
  if (values.startTime) rows.push([t('review.time'), values.startTime]);
  if (values.durationHours)
    rows.push([
      t('review.duration'),
      `${values.durationHours} ${
        values.durationHours === 1 ? t('schedule.hour') : t('schedule.hours')
      }`,
    ]);
  if (values.customerName) rows.push([t('review.name'), values.customerName]);
  if (values.customerEmail) rows.push([t('review.email'), values.customerEmail]);
  if (values.customerPhone) rows.push([t('review.phone'), values.customerPhone]);

  if (rows.length === 0) {
    return (
      <div className="border hairline bg-bg-soft/40 px-6 py-10 text-center">
        <span className="meta">{t('review.title')}</span>
      </div>
    );
  }

  return (
    <div className="border hairline bg-bg-soft/40 px-6 py-8 md:px-10 md:py-10">
      <span className="meta">{t('review.title')}</span>
      <dl className="mt-6 grid gap-x-10 gap-y-4 md:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-6 border-b hairline pb-3">
            <dt className="meta">{k}</dt>
            <dd className="font-serif text-[15px] text-fg text-right">{v}</dd>
          </div>
        ))}
      </dl>
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
