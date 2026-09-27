import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n';
import AuthShell from '@/components/auth/AuthShell';
import ServiceDetail from '@/components/services/ServiceDetail';

export default function ServiceOrderPage({
  params: { locale, id },
}: {
  params: { locale: Locale; id: string };
}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('services');
  return (
    <AuthShell width="wide" eyebrow={t('eyebrow')} label={t('label')} heading={t('detailHeading')}>
      <ServiceDetail locale={locale} id={id} />
    </AuthShell>
  );
}
