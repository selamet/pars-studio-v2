'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchServiceOrders, type ServiceOrder } from '@/lib/api/services';
import ServiceStatus from './ServiceStatus';

export default function ServiceList({ locale }: { locale: string }) {
  const t = useTranslations('services');
  const format = useFormatter();
  const router = useRouter();
  const { status } = useAuth();
  const [orders, setOrders] = useState<ServiceOrder[] | null>(null);

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace(`/${locale}/account/login?next=${encodeURIComponent(`/${locale}/account/services`)}`);
    }
    if (status === 'authenticated') {
      fetchServiceOrders().then(setOrders).catch(() => setOrders([]));
    }
  }, [status, router, locale]);

  if (orders === null) return <p className="meta animate-pulse">{t('loading')}</p>;
  if (orders.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[15px] text-fg/[0.7]">{t('empty')}</p>
        <Link href={`/${locale}/services`} className="meta underline underline-offset-4 hover:text-fg">
          {t('browse')}
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col border-t border-rule">
      {orders.map((job) => (
        <li key={job.id}>
          <Link
            href={`/${locale}/account/services/${job.id}`}
            className="flex items-center gap-6 border-b border-rule py-5 transition-colors hover:bg-bg-soft"
          >
            <div className="min-w-0 flex-1">
              <span className="font-serif text-xl font-light">{job.product_name}</span>
              <span className="meta block">
                {job.order_number}
                {job.due_at && ` · ${t('due')} ${format.dateTime(new Date(job.due_at), { dateStyle: 'medium' })}`}
              </span>
            </div>
            <ServiceStatus status={job.status ?? 'awaiting_files'} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
