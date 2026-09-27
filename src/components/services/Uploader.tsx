'use client';

import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { uploadServiceFile, type ServiceFile } from '@/lib/api/services';
import { cn } from '@/lib/utils';

type Item = { name: string; progress: number; error?: string; done?: boolean };

export default function Uploader({
  orderId,
  remaining,
  onUploaded,
}: {
  orderId: number;
  remaining: number;
  onUploaded: (file: ServiceFile) => void;
}) {
  const t = useTranslations('services.upload');
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);

  async function handle(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files).slice(0, Math.max(0, remaining));
    for (const file of list) {
      const index = items.length;
      setItems((cur) => [...cur, { name: file.name, progress: 0 }]);
      try {
        const uploaded = await uploadServiceFile(orderId, file, (fraction) =>
          setItems((cur) => cur.map((it, i) => (i === index ? { ...it, progress: fraction } : it)))
        );
        setItems((cur) => cur.map((it, i) => (i === index ? { ...it, progress: 1, done: true } : it)));
        onUploaded(uploaded);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? t.has(`errors.${err.code}` as never)
              ? t(`errors.${err.code}` as never)
              : err.message
            : t('errors.generic');
        setItems((cur) => cur.map((it, i) => (i === index ? { ...it, error: message } : it)));
      }
    }
  }

  const disabled = remaining <= 0;

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        disabled={disabled}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) void handle(e.dataTransfer.files);
        }}
        className={cn(
          'flex w-full flex-col items-center gap-3 border border-dashed px-6 py-10 text-center transition-colors',
          disabled
            ? 'cursor-not-allowed border-rule text-fg-dim/50'
            : dragging
              ? 'border-accent text-accent'
              : 'border-fg/30 text-fg hover:border-accent hover:text-accent'
        )}
      >
        <UploadCloud className="h-6 w-6" />
        <span className="font-serif text-xl font-light">{disabled ? t('full') : t('drop')}</span>
        <span className="meta">{t('hint', { count: remaining })}</span>
      </button>
      <input
        ref={input}
        type="file"
        multiple
        accept=".wav,.aif,.aiff,.flac,.mp3,.zip"
        className="hidden"
        onChange={(e) => {
          void handle(e.target.files);
          e.target.value = '';
        }}
      />
      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((item, i) => (
            <li key={`${item.name}-${i}`} className="flex flex-col gap-1">
              <div className="flex items-center justify-between font-mono text-[12px]">
                <span className="truncate">{item.name}</span>
                <span className={cn(item.error ? 'text-accent' : 'text-fg-dim')}>
                  {item.error ? item.error : item.done ? t('done') : `${Math.round(item.progress * 100)}%`}
                </span>
              </div>
              {!item.error && (
                <div className="h-px w-full bg-rule">
                  <div className="h-px bg-accent transition-[width]" style={{ width: `${item.progress * 100}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
