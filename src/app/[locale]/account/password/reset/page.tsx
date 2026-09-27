import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { locales, type Locale } from '@/i18n';
import AuthShell from '@/components/auth/AuthShell';
import PasswordResetRequestForm from '@/components/auth/PasswordResetRequestForm';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function PasswordResetPage({ params: { locale } }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('auth');
  return (
    <AuthShell
      eyebrow={t('eyebrow')}
      label={t('reset.label')}
      heading={t('reset.heading')}
      intro={t('reset.intro')}
    >
      <PasswordResetRequestForm locale={locale} />
    </AuthShell>
  );
}
