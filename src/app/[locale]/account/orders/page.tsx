import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { locales, type Locale } from '@/i18n';
import AuthShell from '@/components/auth/AuthShell';
import OrderList from '@/components/orders/OrderList';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function OrdersPage({ params: { locale } }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('orders');
  return (
    <AuthShell width="wide" eyebrow={t('eyebrow')} label={t('label')} heading={t('heading')} intro={t('intro')}>
      <OrderList locale={locale} />
    </AuthShell>
  );
}
