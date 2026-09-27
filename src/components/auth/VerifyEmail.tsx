'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ensureCsrf, verifyEmail } from '@/lib/api/auth';
import { useAuth } from './AuthProvider';
import { FormError, FormNotice } from './Field';
import Link from 'next/link';

type State = 'verifying' | 'signed_in' | 'verified' | 'invalid';

export default function VerifyEmail({ locale, keyParam }: { locale: string; keyParam: string }) {
  const t = useTranslations('auth.verify');
  const { refresh } = useAuth();
  const [state, setState] = useState<State>('verifying');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        await ensureCsrf();
        const { status, data } = await verifyEmail(decodeURIComponent(keyParam));
        if (status === 200 && data.meta.is_authenticated) {
          await refresh();
          setState('signed_in');
        } else {
          setState('verified');
        }
      } catch {
        setState('invalid');
      }
    })();
  }, [keyParam, refresh]);

  if (state === 'verifying') {
    return <p className="meta animate-pulse">{t('verifying')}</p>;
  }
  if (state === 'invalid') {
    return (
      <div className="flex flex-col gap-6">
        <FormError>{t('invalid')}</FormError>
        <p className="text-[13px] leading-[1.6] text-fg-dim">{t('invalidBody')}</p>
        <Button asChild size="lg" className="w-full">
          <Link href={`/${locale}/account/login`}>{t('goLogin')}</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <FormNotice>{state === 'signed_in' ? t('successSignedIn') : t('success')}</FormNotice>
      <Button asChild size="lg" className="w-full">
        <Link href={`/${locale}/account${state === 'signed_in' ? '' : '/login'}`}>
          {state === 'signed_in' ? t('goAccount') : t('goLogin')}
        </Link>
      </Button>
    </div>
  );
}
