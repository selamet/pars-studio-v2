'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { formatUsd } from '@/lib/api/catalog';
import type { Order } from '@/lib/api/orders';
import DownloadButton from './DownloadButton';

const TONE: Record<string, 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'neutral'> = {
  pending: 'pending',
  paid: 'confirmed',
  failed: 'cancelled',
  cancelled: 'cancelled',
  refunded: 'completed',
};

export function OrderStatus({ order }: { order: Order }) {
  const t = useTranslations('orders.status');
  const status = order.status ?? 'pending';
  return <Badge tone={TONE[status] ?? 'neutral'}>{t(status as never)}</Badge>;
}

/** Lines + downloads for one order; used by the detail and success pages. */
export default function OrderSummary({
  order,
  locale,
  onDownloadUsed,
}: {
  order: Order;
  locale: string;
  onDownloadUsed?: () => void;
}) {
  const t = useTranslations('orders');
  return (
    <div className="flex flex-col gap-8">
      <ul className="flex flex-col border-t border-rule">
        {order.items.map((item) => (
          <li key={item.id} className="flex flex-col gap-4 border-b border-rule py-5">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                {item.beat_slug ? (
                  <Link
                    href={`/${locale}/beats/${item.beat_slug}`}
                    className="font-serif text-xl font-light hover:text-accent"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <span className="font-serif text-xl font-light">{item.title}</span>
                )}
                {item.description && <span className="meta block">{item.description}</span>}
              </div>
              <span className="font-mono text-[15px]">{formatUsd(item.line_total)}</span>
            </div>
            {item.downloads.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {item.downloads.map((grant) => (
                  <DownloadButton key={grant.id} grant={grant} onUsed={onDownloadUsed} />
                ))}
              </div>
            )}
            {item.item_type === 'service' && order.status === 'paid' && (
              <Link href={`/${locale}/account/services`} className="meta underline underline-offset-4 hover:text-fg">
                {t('serviceNext')}
              </Link>
            )}
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between">
        <span className="meta">{t('total')}</span>
        <span className="font-mono text-[20px]">{formatUsd(order.total)}</span>
      </div>
    </div>
  );
}
