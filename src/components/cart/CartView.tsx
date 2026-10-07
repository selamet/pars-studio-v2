'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { FormError, FormNotice } from '@/components/auth/Field';
import { AuthLink } from '@/components/auth/AuthShell';
import { ApiError } from '@/lib/api/client';
import { formatUsd } from '@/lib/api/catalog';
import { startCheckout, type CheckoutConflict } from '@/lib/api/orders';
import { bookingKey } from '@/lib/api/bookings';
import { useCart } from './CartProvider';
import VerifyEmailNotice from './VerifyEmailNotice';

export default function CartView({ locale }: { locale: string }) {
  const t = useTranslations('cart');
  const router = useRouter();
  const params = useSearchParams();
  const { status, user } = useAuth();
  const { lines, total, hydrated, remove, markUnavailable } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set when checkout answers `email_unverified` even though the cached user
  // said otherwise; the notice below then renders instead of an error box.
  const [unverified, setUnverified] = useState(false);

  const cancelled = params.get('cancelled');
  const sellable = lines.filter((l) => !l.unavailable);
  const showVerify =
    status === 'authenticated' && !!user && (!user.email_verified || unverified);

  async function checkout() {
    if (status !== 'authenticated') {
      router.push(`/${locale}/account/login?next=${encodeURIComponent(`/${locale}/cart`)}`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { checkout_url } = await startCheckout({
        items: sellable.map((l) =>
          l.type === 'booking' && l.booking
            ? { type: 'booking' as const, booking: l.booking }
            : { type: l.type, id: l.id }
        ),
        locale: locale as 'en' | 'tr',
      });
      window.location.assign(checkout_url);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const line = (err.data as Partial<CheckoutConflict> | undefined)?.line;
        if (line?.type === 'booking') {
          markUnavailable(bookingKey({ session_date: line.session_date, start_time: line.start_time }));
        } else if (line) {
          markUnavailable(`${line.type}:${line.id}`);
        }
        setError(
          err.code === 'slot_taken'
            ? t('errors.slotTaken')
            : err.code === 'invalid'
              ? t('errors.invalid')
              : t('errors.unavailable')
        );
      } else if (err instanceof ApiError && err.code === 'email_unverified') {
        setUnverified(true);
      } else if (err instanceof ApiError && err.code === 'payment_unavailable') {
        setError(t('errors.paymentUnavailable'));
      } else if (err instanceof ApiError && err.code === 'network') {
        setError(t('errors.network'));
      } else {
        setError(t('errors.generic'));
      }
      setSubmitting(false);
    }
  }

  if (!hydrated) return <p className="meta animate-pulse">{t('loading')}</p>;

  if (lines.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-[15px] leading-[1.7] text-fg/[0.7]">{t('empty')}</p>
        <Button asChild size="lg" className="w-fit">
          <Link href={`/${locale}/beats`}>{t('browse')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-20">
      <ul className="flex flex-col border-t border-rule">
        {lines.map((line) => (
          <li
            key={line.key}
            className={`flex items-center gap-5 border-b border-rule py-5 ${line.unavailable ? 'opacity-50' : ''}`}
          >
            <Link href={line.href} className="relative block h-16 w-16 shrink-0 overflow-hidden bg-bg-soft">
              {line.coverUrl ? (
                <Image src={line.coverUrl} alt="" fill sizes="64px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-serif text-2xl text-fg/20">
                  {line.title.charAt(0)}
                </span>
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={line.href} className="block truncate font-serif text-xl font-light hover:text-accent">
                {line.title}
              </Link>
              <span className="meta block truncate">
                {line.unavailable ? t('lineUnavailable') : line.subtitle}
              </span>
            </div>
            <span className="font-mono text-[15px]">{formatUsd(line.price)}</span>
            <button
              type="button"
              onClick={() => remove(line.key)}
              aria-label={t('remove')}
              className="text-fg-dim transition-colors hover:text-fg"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
        <div className="flex items-center justify-between border-b border-rule pb-4">
          <span className="meta">{t('total')}</span>
          <span className="font-mono text-[20px]">{formatUsd(total)}</span>
        </div>
        {cancelled && <FormNotice>{t('cancelled')}</FormNotice>}
        {showVerify && <VerifyEmailNotice email={user?.email} />}
        {error && <FormError>{error}</FormError>}
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={submitting || sellable.length === 0 || status === 'loading'}
          onClick={checkout}
        >
          {submitting
            ? t('redirecting')
            : status === 'authenticated'
              ? t('checkout')
              : t('signInToCheckout')}
        </Button>
        <p className="text-[12px] leading-[1.6] text-fg-dim">{t('stripeNote')}</p>
        {lines.some((l) => l.type === 'booking') && (
          <p className="text-[12px] leading-[1.6] text-fg-dim">{t('holdNote')}</p>
        )}
        <p className="text-[13px] text-fg-dim">
          <AuthLink href={`/${locale}/beats`}>{t('continue')}</AuthLink>
        </p>
      </aside>
    </div>
  );
}
