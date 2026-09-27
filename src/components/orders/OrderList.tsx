'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/AuthProvider';
import { formatUsd } from '@/lib/api/catalog';
import { fetchOrders, type Order } from '@/lib/api/orders';
import { OrderStatus } from './OrderSummary';

export default function OrderList({ locale }: { locale: string }) {
  const t = useTranslations('orders');
  const format = useFormatter();
  const router = useRouter();
  const { status } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace(`/${locale}/account/login?next=${encodeURIComponent(`/${locale}/account/orders`)}`);
    }
    if (status === 'authenticated') {
      fetchOrders().then((page) => setOrders(page.results)).catch(() => setOrders([]));
    }
  }, [status, router, locale]);

  if (orders === null) return <p className="meta animate-pulse">{t('loading')}</p>;
  if (orders.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[15px] text-fg/[0.7]">{t('empty')}</p>
        <Link href={`/${locale}/beats`} className="meta underline underline-offset-4 hover:text-fg">
          {t('browse')}
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col border-t border-rule">
      {orders.map((order) => (
        <li key={order.number}>
          <Link
            href={`/${locale}/account/orders/${order.number}`}
            className="flex items-center gap-6 border-b border-rule py-5 transition-colors hover:bg-bg-soft"
          >
            <div className="min-w-0 flex-1">
              <span className="font-mono text-[14px]">{order.number}</span>
              <span className="meta block">
                {format.dateTime(new Date(order.created_at), { dateStyle: 'medium' })} ·{' '}
                {t('itemCount', { count: order.items.length })}
              </span>
            </div>
            <OrderStatus order={order} />
            <span className="font-mono text-[15px]">{formatUsd(order.total)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
