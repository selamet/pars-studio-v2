'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ensureCsrf, redirectToProvider } from '@/lib/api/auth';

export default function GoogleButton({ locale }: { locale: string }) {
  const t = useTranslations('auth');
  const [busy, setBusy] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  async function start() {
    setBusy(true);
    try {
      const providers = await ensureCsrf();
      if (!providers.some((p) => p.id === 'google')) {
        setUnavailable(true);
        setBusy(false);
        return;
      }
      const callback = `${window.location.origin}/${locale}/account/provider/callback`;
      redirectToProvider('google', callback);
    } catch {
      setUnavailable(true);
      setBusy(false);
    }
  }

  if (unavailable) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      disabled={busy}
      onClick={start}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="mr-3 h-4 w-4">
        <path
          fill="currentColor"
          d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z"
        />
        <path
          fill="currentColor"
          opacity=".7"
          d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"
        />
        <path
          fill="currentColor"
          opacity=".5"
          d="M6.4 14a6 6 0 0 1 0-3.9V7.4H3.1a10 10 0 0 0 0 9l3.3-2.5Z"
        />
        <path
          fill="currentColor"
          opacity=".85"
          d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4l3.3 2.6C7.2 7.7 9.4 6 12 6Z"
        />
      </svg>
      {t('login.google')}
    </Button>
  );
}
