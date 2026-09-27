import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n';
import AuthShell from '@/components/auth/AuthShell';
import PasswordResetForm from '@/components/auth/PasswordResetForm';

export default function PasswordResetKeyPage({
  params: { locale, key },
}: {
  params: { locale: Locale; key: string };
}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('auth');
  return (
    <AuthShell
      eyebrow={t('eyebrow')}
      label={t('reset.label')}
      heading={t('reset.newHeading')}
      intro={t('reset.newIntro')}
    >
      <PasswordResetForm locale={locale} keyParam={key} />
    </AuthShell>
  );
}
