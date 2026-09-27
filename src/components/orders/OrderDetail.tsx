'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchOrder, type Order } from '@/lib/api/orders';
import OrderSummary, { OrderStatus } from './OrderSummary';

export default function OrderDetail({ locale, number }: { locale: string; number: string }) {
  const t = useTranslations('orders');
  const format = useFormatter();
  const router = useRouter();
  const { status } = useAuth();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  const load = useCallback(() => fetchOrder(number).then(setOrder).catch(() => setOrder(null)), [number]);

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace(
        `/${locale}/account/login?next=${encodeURIComponent(`/${locale}/account/orders/${number}`)}`
      );
    }
    if (status === 'authenticated') void load();
  }, [status, router, locale, number, load]);

  if (order === undefined) return <p className="meta animate-pulse">{t('loading')}</p>;
  if (order === null) return <p className="meta">{t('notFound')}</p>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[14px]">{order.number}</span>
          <span className="meta block">
            {format.dateTime(new Date(order.created_at), { dateStyle: 'long', timeStyle: 'short' })}
          </span>
        </div>
        <OrderStatus order={order} />
      </div>
      <OrderSummary order={order} locale={locale} onDownloadUsed={load} />
      <Link href={`/${locale}/account/orders`} className="meta hover:text-fg">
        ← {t('backToOrders')}
      </Link>
    </div>
  );
}
