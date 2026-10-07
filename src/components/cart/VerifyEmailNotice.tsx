'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ensureCsrf, resendEmailVerification } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

// How long the button stays disabled after a successful send. The backend
// enforces its own (longer) per-address cooldown and answers 403 meanwhile.
const COOLDOWN_MS = 30_000;

type State = 'idle' | 'sending' | 'sent' | 'tooSoon' | 'failed';

/** "Verify your email" notice with a resend button for the cart aside. */
export default function VerifyEmailNotice({ email }: { email?: string }) {
  const t = useTranslations('cart');
  const [state, setState] = useState<State>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  async function resend() {
    if (!email) return;
    setState('sending');
    try {
      await ensureCsrf();
      await resendEmailVerification(email);
      setState('sent');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setState('idle'), COOLDOWN_MS);
    } catch (err) {
      setState(
        err instanceof ApiError && (err.status === 403 || err.status === 429)
          ? 'tooSoon'
          : 'failed'
      );
    }
  }

  const feedback =
    state === 'sent'
      ? t('verify.sent')
      : state === 'tooSoon'
        ? t('verify.tooSoon')
        : state === 'failed'
          ? t('verify.failed')
          : null;

  return (
    <div
      role="status"
      className="flex flex-col gap-3 border border-rule px-4 py-3 text-[13px] leading-[1.6] text-fg/[0.8]"
    >
      <p>{t('errors.unverified')}</p>
      {email && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          disabled={state === 'sending' || state === 'sent'}
          onClick={resend}
        >
          {state === 'sending' ? t('verify.sending') : t('verify.resend')}
        </Button>
      )}
      {feedback && (
        <p
          className={`font-mono text-[11px] uppercase tracking-meta ${state === 'sent' ? 'text-fg-dim' : 'text-accent'}`}
        >
          {feedback}
        </p>
      )}
    </div>
  );
}
