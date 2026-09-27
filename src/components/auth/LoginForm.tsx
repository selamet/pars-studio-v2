'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/client';
import { ensureCsrf, login } from '@/lib/api/auth';
import { useAuth } from './AuthProvider';
import { Field, FormError, FormNotice } from './Field';
import { AuthLink } from './AuthShell';
import GoogleButton from './GoogleButton';

export default function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [needsVerification, setNeedsVerification] = useState(false);

  const nextPath = params.get('next') || `/${locale}/account`;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    setNeedsVerification(false);
    try {
      await ensureCsrf();
      const { status, data } = await login(email, password);
      if (status === 200 && data.meta.is_authenticated) {
        await refresh();
        router.push(nextPath);
        return;
      }
      if (data.data.flows?.some((f) => f.id === 'verify_email' && f.is_pending)) {
        setNeedsVerification(true);
      } else {
        setError(t('errors.generic'));
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (Object.keys(err.fieldErrors).length) setFieldErrors(err.fieldErrors);
        else setError(err.code === 'network' ? t('errors.network') : t('login.errorInvalid'));
      } else {
        setError(t('errors.generic'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
        <Field
          id="email"
          type="email"
          label={t('fields.email')}
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email?.[0]}
        />
        <Field
          id="password"
          type="password"
          label={t('fields.password')}
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password?.[0]}
        />

        {needsVerification && <FormNotice>{t('login.unverified')}</FormNotice>}
        {error && <FormError>{error}</FormError>}

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? t('login.submitting') : t('login.submit')}
        </Button>
      </form>

      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-rule" aria-hidden />
        <span className="meta">{t('login.or')}</span>
        <span className="h-px flex-1 bg-rule" aria-hidden />
      </div>

      <GoogleButton locale={locale} />

      <div className="flex flex-col gap-2 text-[13px] text-fg-dim">
        <AuthLink href={`/${locale}/account/password/reset`}>{t('login.forgot')}</AuthLink>
        <span>
          {t('login.noAccount')}{' '}
          <AuthLink href={`/${locale}/account/signup`}>{t('login.signup')}</AuthLink>
        </span>
      </div>
    </div>
  );
}
