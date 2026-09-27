import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n';
import AuthShell from '@/components/auth/AuthShell';
import VerifyEmail from '@/components/auth/VerifyEmail';

export default function VerifyEmailPage({
  params: { locale, key },
}: {
  params: { locale: Locale; key: string };
}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('auth');
  return (
    <AuthShell eyebrow={t('eyebrow')} label={t('verify.label')} heading={t('verify.heading')}>
      <VerifyEmail locale={locale} keyParam={key} />
    </AuthShell>
  );
}
