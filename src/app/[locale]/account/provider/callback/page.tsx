import { Suspense } from 'react';
import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { locales, type Locale } from '@/i18n';
import AuthShell from '@/components/auth/AuthShell';
import ProviderCallback from '@/components/auth/ProviderCallback';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function ProviderCallbackPage({ params: { locale } }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('auth');
  return (
    <AuthShell eyebrow={t('eyebrow')} label={t('provider.label')} heading={t('provider.heading')}>
      <Suspense fallback={null}>
        <ProviderCallback locale={locale} />
      </Suspense>
    </AuthShell>
  );
}
