import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { locales, type Locale } from '@/i18n';
import AuthShell from '@/components/auth/AuthShell';
import BookingList from '@/components/booking/BookingList';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function MyBookingsPage({ params: { locale } }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('booking.mine');
  return (
    <AuthShell eyebrow={t('eyebrow')} label={t('label')} heading={t('heading')} intro={t('intro')}>
      <BookingList locale={locale} />
    </AuthShell>
  );
}
