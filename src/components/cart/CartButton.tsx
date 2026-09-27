'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useCart } from './CartProvider';

export default function CartButton({ locale, className }: { locale: string; className?: string }) {
  const t = useTranslations('cart');
  const { count, hydrated } = useCart();
  return (
    <Link
      href={`/${locale}/cart`}
      aria-label={t('title')}
      className={cn(
        'relative flex items-center gap-2 font-mono text-[11px] uppercase tracking-meta transition-opacity duration-300 hover:opacity-60',
        className
      )}
    >
      <ShoppingBag className="h-4 w-4" />
      {hydrated && count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[9px] text-bg">
          {count}
        </span>
      )}
    </Link>
  );
}
