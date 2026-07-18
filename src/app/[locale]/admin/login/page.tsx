import { redirect } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { locales, type Locale } from '@/i18n';
import { isAdmin } from '@/lib/auth-server';
import LoginForm from './LoginForm';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  unstable_setRequestLocale(locale);

  // Already signed in → skip the form.
  if (await isAdmin()) redirect(`/${locale}/admin`);

  return <LoginShell locale={locale} />;
}

function LoginShell({ locale }: { locale: Locale }) {
  const t = useTranslations('admin.login');
  return (
    <main>
      <section className="section pt-[clamp(160px,18vh,240px)]">
        <div className="mx-auto w-full max-w-md">
          <header className="mb-12">
            <div className="flex items-center gap-5">
              <span className="meta !text-accent">∙</span>
              <span className="meta">{t('label')}</span>
            </div>
            <h1 className="mt-7 font-serif font-light leading-[1.04] tracking-[-0.012em] text-[clamp(34px,5vw,56px)]">
              {t('heading')}
            </h1>
            <p className="mt-5 text-[14px] leading-[1.7] text-fg/[0.6]">
              {t('intro')}
            </p>
          </header>

          <LoginForm locale={locale} />
        </div>
      </section>
    </main>
  );
}
