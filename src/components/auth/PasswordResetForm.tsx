'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/client';
import { ensureCsrf, resetPassword } from '@/lib/api/auth';
import { Field, FormError, FormNotice } from './Field';

export default function PasswordResetForm({
  locale,
  keyParam,
}: {
  locale: string;
  keyParam: string;
}) {
  const t = useTranslations('auth');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setFieldErrors({ confirm: [t('reset.mismatch')] });
      return;
    }
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      await ensureCsrf();
      await resetPassword(decodeURIComponent(keyParam), password);
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors.password) setFieldErrors(err.fieldErrors);
        else if (err.fieldErrors.key || err.code === 'invalid_or_expired_key') {
          setError(t('reset.invalidKey'));
        } else setError(err.code === 'network' ? t('errors.network') : err.message);
      } else {
        setError(t('errors.generic'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col gap-6">
        <FormNotice>{t('reset.done')}</FormNotice>
        <Button asChild size="lg" className="w-full">
          <Link href={`/${locale}/account/login`}>{t('reset.backToLogin')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
      <Field
        id="password"
        type="password"
        label={t('reset.newPassword')}
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint={t('fields.passwordHint')}
        error={fieldErrors.password?.[0]}
      />
      <Field
        id="confirm"
        type="password"
        label={t('reset.confirmPassword')}
        autoComplete="new-password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={fieldErrors.confirm?.[0]}
      />
      {error && <FormError>{error}</FormError>}
      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? t('reset.submittingReset') : t('reset.submitReset')}
      </Button>
    </form>
  );
}
