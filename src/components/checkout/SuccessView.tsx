'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCart } from '@/components/cart/CartProvider';
import { FormNotice } from '@/components/auth/Field';
import OrderSummary from '@/components/orders/OrderSummary';
import { fetchOrder, type Order } from '@/lib/api/orders';

const POLL_MS = 2500;
const MAX_POLLS = 24; // ~1 minute of webhook lag tolerated

/** Landing page after Stripe: waits for the webhook to flip the order to paid. */
export default function SuccessView({ locale }: { locale: string }) {
  const t = useTranslations('checkout');
  const params = useSearchParams();
  const number = params.get('order');
  const { status } = useAuth();
  const { clear } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const polls = useRef(0);
  const cleared = useRef(false);

  const load = useCallback(async () => {
    if (!number) return;
    const next = await fetchOrder(number).catch(() => null);
    setOrder(next);
    if (next?.status === 'paid' && !cleared.current) {
      cleared.current = true;
      clear();
    }
    return next;
  }, [number, clear]);

  useEffect(() => {
    if (status !== 'authenticated' || !number) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = async () => {
      const next = await load();
      polls.current += 1;
      if (next?.status === 'paid' || next?.status === 'cancelled' || next?.status === 'failed') return;
      if (polls.current >= MAX_POLLS) {
        setTimedOut(true);
        return;
      }
      timer = setTimeout(tick, POLL_MS);
    };
    void tick();
    return () => clearTimeout(timer);
  }, [status, number, load]);

  if (!number) return <p className="meta">{t('missingOrder')}</p>;
  if (status === 'anonymous') {
    return (
      <div className="flex flex-col gap-6">
        <FormNotice>{t('signInToSee')}</FormNotice>
        <Button asChild size="lg" className="w-fit">
          <Link
            href={`/${locale}/account/login?next=${encodeURIComponent(`/${locale}/checkout/success?order=${number}`)}`}
          >
            {t('signIn')}
          </Link>
        </Button>
      </div>
    );
  }

  if (order?.status === 'paid') {
    return (
      <div className="flex flex-col gap-8">
        <FormNotice>{t('paid', { number })}</FormNotice>
        <OrderSummary order={order} locale={locale} onDownloadUsed={load} />
        <Button asChild size="lg" className="w-fit">
          <Link href={`/${locale}/account/orders/${number}`}>{t('viewOrder')}</Link>
        </Button>
      </div>
    );
  }

  if (order?.status === 'cancelled' || order?.status === 'failed') {
    return (
      <div className="flex flex-col gap-6">
        <FormNotice>{t('notPaid')}</FormNotice>
        <Button asChild size="lg" className="w-fit">
          <Link href={`/${locale}/cart`}>{t('backToCart')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="meta animate-pulse">{timedOut ? t('slow') : t('confirming')}</p>
      {timedOut && (
        <Button asChild size="lg" className="w-fit">
          <Link href={`/${locale}/account/orders/${number}`}>{t('viewOrder')}</Link>
        </Button>
      )}
    </div>
  );
}
