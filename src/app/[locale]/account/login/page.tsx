import { Suspense } from 'react';
import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { locales, type Locale } from '@/i18n';
import AuthShell from '@/components/auth/AuthShell';
import LoginForm from '@/components/auth/LoginForm';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LoginPage({ params: { locale } }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('auth');
  return (
    <AuthShell
      eyebrow={t('eyebrow')}
      label={t('login.label')}
      heading={t('login.heading')}
      intro={t('login.intro')}
    >
      <Suspense fallback={null}>
        <LoginForm locale={locale} />
      </Suspense>
    </AuthShell>
  );
}
