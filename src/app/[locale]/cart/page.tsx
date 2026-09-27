import { Suspense } from 'react';
import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { locales, type Locale } from '@/i18n';
import CartView from '@/components/cart/CartView';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function CartPage({ params: { locale } }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('cart');
  return (
    <main>
      <section className="section min-h-screen pt-[clamp(160px,18vh,240px)]">
        <div className="shell">
          <header className="mb-12">
            <div className="flex items-center gap-5">
              <span className="meta !text-accent">{t('section')}</span>
              <span className="h-px w-12 bg-rule" aria-hidden />
              <span className="meta">{t('label')}</span>
            </div>
            <h1 className="mt-7 font-serif font-light leading-[1.04] tracking-[-0.012em] text-[clamp(34px,4.5vw,64px)]">
              {t('heading')}
            </h1>
          </header>
          <Suspense fallback={null}>
            <CartView locale={locale} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
