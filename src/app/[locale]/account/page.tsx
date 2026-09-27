import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { locales, type Locale } from '@/i18n';
import AuthShell from '@/components/auth/AuthShell';
import AccountPanel from '@/components/auth/AccountPanel';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function AccountPage({ params: { locale } }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('auth');
  return (
    <AuthShell
      eyebrow={t('eyebrow')}
      label={t('account.label')}
      heading={t('account.heading')}
      intro={t('account.intro')}
    >
      <AccountPanel locale={locale} />
    </AuthShell>
  );
}
