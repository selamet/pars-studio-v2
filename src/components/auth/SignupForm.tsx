'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/client';
import { ensureCsrf, signup } from '@/lib/api/auth';
import { useAuth } from './AuthProvider';
import { Field, FormError, FormNotice } from './Field';
import { AuthLink } from './AuthShell';
import GoogleButton from './GoogleButton';

export default function SignupForm({ locale }: { locale: string }) {
  const t = useTranslations('auth');
  const router = useRouter();
  const { refresh } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    // The confirmation only guards against typos; the API takes one password.
    if (password !== passwordConfirm) {
      setFieldErrors({ password_confirm: [t('fields.passwordMismatch')] });
      return;
    }
    setSubmitting(true);
    setFieldErrors({});
    try {
      await ensureCsrf();
      const { status, data } = await signup({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email,
        password,
      });
      if (status === 200 && data.meta.is_authenticated) {
        await refresh();
        router.push(`/${locale}/account`);
        return;
      }
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (Object.keys(err.fieldErrors).length) setFieldErrors(err.fieldErrors);
        else setError(err.code === 'network' ? t('errors.network') : err.message);
      } else {
        setError(t('errors.generic'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-6">
        <FormNotice>{t('signup.checkInbox', { email })}</FormNotice>
        <p className="text-[13px] text-fg-dim">
          <AuthLink href={`/${locale}/account/login`}>{t('signup.login')}</AuthLink>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
        <div className="grid gap-8 sm:grid-cols-2">
          <Field
            id="first_name"
            label={t('fields.firstName')}
            autoComplete="given-name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={fieldErrors.first_name?.[0]}
          />
          <Field
            id="last_name"
            label={t('fields.lastName')}
            autoComplete="family-name"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            error={fieldErrors.last_name?.[0]}
          />
        </div>
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
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={t('fields.passwordHint')}
          error={fieldErrors.password?.[0]}
        />
        <Field
          id="password_confirm"
          type="password"
          label={t('fields.passwordConfirm')}
          autoComplete="new-password"
          required
          minLength={8}
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          error={fieldErrors.password_confirm?.[0]}
        />

        {error && <FormError>{error}</FormError>}

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? t('signup.submitting') : t('signup.submit')}
        </Button>
      </form>

      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-rule" aria-hidden />
        <span className="meta">{t('login.or')}</span>
        <span className="h-px flex-1 bg-rule" aria-hidden />
      </div>

      <GoogleButton locale={locale} />

      <p className="text-[13px] text-fg-dim">
        {t('signup.haveAccount')}{' '}
        <AuthLink href={`/${locale}/account/login`}>{t('signup.login')}</AuthLink>
      </p>
    </div>
  );
}
