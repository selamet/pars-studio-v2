'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/client';
import { changePassword, updateMe } from '@/lib/api/auth';
import { useAuth } from './AuthProvider';
import { Field, FormError, FormNotice } from './Field';

export default function AccountPanel({ locale }: { locale: string }) {
  const t = useTranslations('auth.account');
  const tErr = useTranslations('auth.errors');
  const router = useRouter();
  const { status, user, refresh, logout } = useAuth();

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace(`/${locale}/account/login?next=${encodeURIComponent(`/${locale}/account`)}`);
    }
  }, [status, router, locale]);

  if (status !== 'authenticated' || !user) {
    return <p className="meta animate-pulse">{t('loading')}</p>;
  }

  return (
    <div className="flex flex-col gap-14">
      <section className="flex flex-col gap-4">
        <span className="meta">{t('emailLabel')}</span>
        <p className="font-serif text-2xl">{user.email}</p>
        {!user.email_verified && <FormNotice>{t('unverified')}</FormNotice>}
      </section>

      <ProfileForm
        firstName={user.first_name ?? ''}
        lastName={user.last_name ?? ''}
        onSaved={refresh}
        t={t}
        tErr={tErr}
      />

      <PasswordForm t={t} tErr={tErr} />

      <section className="border-t border-rule pt-8">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={async () => {
            await logout();
            router.push(`/${locale}`);
          }}
        >
          {t('logout')}
        </Button>
      </section>
    </div>
  );
}

type T = ReturnType<typeof useTranslations>;

function ProfileForm({
  firstName,
  lastName,
  onSaved,
  t,
  tErr,
}: {
  firstName: string;
  lastName: string;
  onSaved: () => Promise<unknown>;
  t: T;
  tErr: T;
}) {
  const [first, setFirst] = useState(firstName);
  const [last, setLast] = useState(lastName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    setFieldErrors({});
    try {
      await updateMe({ first_name: first, last_name: last });
      await onSaved();
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) {
        setFieldErrors(err.fieldErrors);
      } else {
        setError(err instanceof ApiError && err.code === 'network' ? tErr('network') : tErr('generic'));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
      <span className="meta">{t('profile')}</span>
      <div className="grid gap-8 sm:grid-cols-2">
        <Field
          id="first_name"
          label={t('firstName')}
          autoComplete="given-name"
          value={first}
          onChange={(e) => setFirst(e.target.value)}
          error={fieldErrors.first_name?.[0]}
        />
        <Field
          id="last_name"
          label={t('lastName')}
          autoComplete="family-name"
          value={last}
          onChange={(e) => setLast(e.target.value)}
          error={fieldErrors.last_name?.[0]}
        />
      </div>
      {error && <FormError>{error}</FormError>}
      {saved && <FormNotice>{t('saved')}</FormNotice>}
      <Button type="submit" size="lg" disabled={saving} className="w-full sm:w-auto">
        {saving ? t('saving') : t('save')}
      </Button>
    </form>
  );
}

function PasswordForm({ t, tErr }: { t: T; tErr: T }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setChanged(false);
    setError(null);
    setFieldErrors({});
    try {
      await changePassword(current, next);
      setChanged(true);
      setCurrent('');
      setNext('');
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) {
        setFieldErrors(err.fieldErrors);
      } else {
        setError(err instanceof ApiError && err.code === 'network' ? tErr('network') : tErr('generic'));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8 border-t border-rule pt-8" noValidate>
      <span className="meta">{t('passwordHeading')}</span>
      <Field
        id="current_password"
        type="password"
        label={t('currentPassword')}
        autoComplete="current-password"
        required
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        error={fieldErrors.current_password?.[0]}
      />
      <Field
        id="new_password"
        type="password"
        label={t('newPassword')}
        autoComplete="new-password"
        required
        minLength={8}
        value={next}
        onChange={(e) => setNext(e.target.value)}
        error={fieldErrors.new_password?.[0]}
      />
      {error && <FormError>{error}</FormError>}
      {changed && <FormNotice>{t('passwordChanged')}</FormNotice>}
      <Button type="submit" size="lg" disabled={saving} className="w-full sm:w-auto">
        {saving ? t('saving') : t('changePassword')}
      </Button>
    </form>
  );
}
