'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/client';
import { ensureCsrf, requestPasswordReset } from '@/lib/api/auth';
import { Field, FormError, FormNotice } from './Field';
import { AuthLink } from './AuthShell';

export default function PasswordResetRequestForm({ locale }: { locale: string }) {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldError(null);
    try {
      await ensureCsrf();
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors.email?.[0]) {
        setFieldError(err.fieldErrors.email[0]);
      } else if (err instanceof ApiError && err.code === 'network') {
        setError(t('errors.network'));
      } else {
        // allauth answers 200 even for unknown emails; anything else is unexpected.
        setError(t('errors.generic'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-6">
        <FormNotice>{t('reset.sent', { email })}</FormNotice>
        <p className="text-[13px] text-fg-dim">
          <AuthLink href={`/${locale}/account/login`}>{t('reset.backToLogin')}</AuthLink>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
      <Field
        id="email"
        type="email"
        label={t('fields.email')}
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldError}
      />
      {error && <FormError>{error}</FormError>}
      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? t('reset.submitting') : t('reset.submit')}
      </Button>
      <p className="text-[13px] text-fg-dim">
        <AuthLink href={`/${locale}/account/login`}>{t('reset.backToLogin')}</AuthLink>
      </p>
    </form>
  );
}
