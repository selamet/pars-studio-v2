import { Suspense } from 'react';
import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { locales, type Locale } from '@/i18n';
import AuthShell from '@/components/auth/AuthShell';
import SuccessView from '@/components/checkout/SuccessView';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function CheckoutSuccessPage({ params: { locale } }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('checkout');
  return (
    <AuthShell eyebrow={t('eyebrow')} label={t('label')} heading={t('heading')} intro={t('intro')}>
      <Suspense fallback={null}>
        <SuccessView locale={locale} />
      </Suspense>
    </AuthShell>
  );
}
