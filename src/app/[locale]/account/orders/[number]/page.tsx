import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n';
import AuthShell from '@/components/auth/AuthShell';
import OrderDetail from '@/components/orders/OrderDetail';

export default function OrderPage({
  params: { locale, number },
}: {
  params: { locale: Locale; number: string };
}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('orders');
  return (
    <AuthShell width="wide" eyebrow={t('eyebrow')} label={t('label')} heading={t('detailHeading')}>
      <OrderDetail locale={locale} number={number} />
    </AuthShell>
  );
}
