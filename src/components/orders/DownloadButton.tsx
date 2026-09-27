'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { mintDownloadLink, type DownloadGrant } from '@/lib/api/orders';
import { cn } from '@/lib/utils';

export default function DownloadButton({
  grant,
  onUsed,
}: {
  grant: DownloadGrant;
  onUsed?: () => void;
}) {
  const t = useTranslations('orders.download');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setBusy(true);
    setError(null);
    try {
      const link = await mintDownloadLink(grant.id);
      window.open(link.url, '_blank', 'noopener');
      onUsed?.();
    } catch (err) {
      if (err instanceof ApiError && err.code === 'download_unavailable') setError(t('unavailable'));
      else if (err instanceof ApiError && err.code === 'file_missing') setError(t('missing'));
      else setError(t('failed'));
    } finally {
      setBusy(false);
    }
  }

  const disabled = !grant.available || busy;
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={download}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 border px-3 py-2 font-mono text-[10px] uppercase tracking-meta transition-colors',
          disabled
            ? 'cursor-not-allowed border-rule text-fg-dim/60'
            : 'border-fg/40 text-fg hover:border-accent hover:text-accent'
        )}
      >
        <Download className="h-3.5 w-3.5" />
        {grant.file_kind_label}
        <span className="text-fg-dim">
          {t('remaining', { count: grant.remaining })}
        </span>
      </button>
      {error && <span className="font-mono text-[10px] uppercase tracking-meta text-accent">{error}</span>}
    </div>
  );
}
