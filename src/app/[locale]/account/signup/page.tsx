import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { locales, type Locale } from '@/i18n';
import AuthShell from '@/components/auth/AuthShell';
import SignupForm from '@/components/auth/SignupForm';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function SignupPage({ params: { locale } }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('auth');
  return (
    <AuthShell
      eyebrow={t('eyebrow')}
      label={t('signup.label')}
      heading={t('signup.heading')}
      intro={t('signup.intro')}
    >
      <SignupForm locale={locale} />
    </AuthShell>
  );
}
