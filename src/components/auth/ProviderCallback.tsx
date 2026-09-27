'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useAuth } from './AuthProvider';
import { FormError } from './Field';

/**
 * Landing page for the OAuth round-trip. On success allauth already set the
 * session cookie, so we simply refresh and move on; on failure allauth sends
 * us here with `?error=<code>`.
 */
export default function ProviderCallback({ locale }: { locale: string }) {
  const t = useTranslations('auth.provider');
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const [failed, setFailed] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const error = params.get('error');
    if (error) {
      setFailed(error);
      return;
    }
    (async () => {
      const me = await refresh();
      if (me) router.replace(`/${locale}/account`);
      else setFailed('unknown');
    })();
  }, [params, refresh, router, locale]);

  if (!failed) return <p className="meta animate-pulse">{t('finishing')}</p>;

  return (
    <div className="flex flex-col gap-6">
      <FormError>{t('failed')}</FormError>
      <p className="text-[13px] leading-[1.6] text-fg-dim">{t('failedBody')}</p>
      <Button asChild size="lg" className="w-full">
        <Link href={`/${locale}/account/login`}>{t('retry')}</Link>
      </Button>
    </div>
  );
}
