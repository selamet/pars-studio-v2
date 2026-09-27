'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/auth/AuthProvider';
import { FormError, FormNotice } from '@/components/auth/Field';
import { ApiError } from '@/lib/api/client';
import {
  acceptDelivery,
  deliverableLink,
  fetchServiceOrder,
  requestRevision,
  updateBrief,
  type ServiceOrder,
} from '@/lib/api/services';
import ServiceStatus from './ServiceStatus';
import Uploader from './Uploader';

export default function ServiceDetail({ locale, id }: { locale: string; id: string }) {
  const t = useTranslations('services');
  const format = useFormatter();
  const router = useRouter();
  const { status } = useAuth();
  const [job, setJob] = useState<ServiceOrder | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => fetchServiceOrder(id).then(setJob).catch(() => setJob(null)), [id]);

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace(
        `/${locale}/account/login?next=${encodeURIComponent(`/${locale}/account/services/${id}`)}`
      );
    }
    if (status === 'authenticated') void load();
  }, [status, router, locale, id, load]);

  if (job === undefined) return <p className="meta animate-pulse">{t('loading')}</p>;
  if (job === null) return <p className="meta">{t('notFound')}</p>;

  const jobStatus = job.status ?? 'awaiting_files';
  const currentRound = job.revisions_used ?? 0;
  const uploads = job.files.filter((f) => f.direction === 'customer_upload');
  const deliverables = job.files.filter((f) => f.direction === 'studio_deliverable');
  const uploadsThisRound = uploads.filter((f) => (f.round ?? 0) === currentRound).length;
  const remaining = Math.max(0, job.max_files - uploadsThisRound);
  const briefEditable = jobStatus === 'awaiting_files' || jobStatus === 'received';

  async function run(action: () => Promise<ServiceOrder>) {
    setError(null);
    try {
      setJob(await action());
    } catch (err) {
      if (err instanceof ApiError && t.has(`errors.${err.code}` as never)) {
        setError(t(`errors.${err.code}` as never));
      } else {
        setError(t('errors.generic'));
      }
    }
  }

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-light">{job.product_name}</h2>
          <span className="meta block">
            {job.order_number}
            {job.due_at && ` · ${t('due')} ${format.dateTime(new Date(job.due_at), { dateStyle: 'medium' })}`}
          </span>
        </div>
        <ServiceStatus status={jobStatus} />
      </header>

      {error && <FormError>{error}</FormError>}

      {jobStatus === 'awaiting_files' && <FormNotice>{t('awaitingHint')}</FormNotice>}
      {jobStatus === 'delivered' && <FormNotice>{t('deliveredHint', { count: job.revisions_left })}</FormNotice>}

      {deliverables.length > 0 && (
        <section className="flex flex-col gap-4">
          <span className="meta">{t('deliverables')}</span>
          <ul className="flex flex-col gap-2">
            {deliverables.map((file) => (
              <li key={file.id} className="flex items-center justify-between gap-4 border-b border-rule py-3">
                <span className="truncate font-mono text-[13px]">{file.original_name}</span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const link = await deliverableLink(job.id, file.id);
                      window.open(link.url, '_blank', 'noopener');
                    } catch {
                      setError(t('errors.generic'));
                    }
                  }}
                  className="flex items-center gap-2 border border-fg/40 px-3 py-2 font-mono text-[10px] uppercase tracking-meta transition-colors hover:border-accent hover:text-accent"
                >
                  <Download className="h-3.5 w-3.5" /> {t('download')}
                </button>
              </li>
            ))}
          </ul>
          {jobStatus === 'delivered' && (
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button type="button" size="lg" onClick={() => run(() => acceptDelivery(job.id))}>
                {t('accept')}
              </Button>
              {job.revisions_left > 0 && <RevisionForm onSubmit={(m) => run(() => requestRevision(job.id, m))} />}
            </div>
          )}
        </section>
      )}

      {job.accepts_uploads && (
        <section className="flex flex-col gap-4">
          <span className="meta">{t('yourFiles')}</span>
          <Uploader orderId={job.id} remaining={remaining} onUploaded={() => void load()} />
        </section>
      )}

      {uploads.length > 0 && (
        <section className="flex flex-col gap-2">
          {!job.accepts_uploads && <span className="meta">{t('yourFiles')}</span>}
          <ul className="flex flex-col">
            {uploads.map((file) => (
              <li key={file.id} className="flex items-center justify-between border-b border-rule py-3 font-mono text-[13px]">
                <span className="truncate">{file.original_name}</span>
                <span className="text-fg-dim">{formatBytes(file.size ?? 0)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <BriefForm job={job} editable={briefEditable} onSave={(patch) => run(() => updateBrief(job.id, patch))} />

      <section className="flex flex-col gap-4">
        <span className="meta">{t('timeline')}</span>
        <ol className="flex flex-col border-l border-rule pl-5">
          {job.events.length === 0 && <li className="meta">{t('noEvents')}</li>}
          {job.events.map((event) => (
            <li key={event.id} className="relative pb-5">
              <span className="absolute -left-[23px] top-1.5 h-2 w-2 rounded-full bg-accent" aria-hidden />
              <span className="font-serif text-lg font-light">{t(`status.${event.to_status}` as never)}</span>
              <span className="meta block">
                {format.dateTime(new Date(event.created_at), { dateStyle: 'medium', timeStyle: 'short' })}
                {' · '}
                {event.by_studio ? t('byStudio') : t('byYou')}
              </span>
              {event.message && (
                <p className="mt-2 whitespace-pre-line text-[14px] leading-[1.6] text-fg/[0.7]">{event.message}</p>
              )}
            </li>
          ))}
        </ol>
      </section>

      <Link href={`/${locale}/account/services`} className="meta hover:text-fg">
        ← {t('backToList')}
      </Link>
    </div>
  );
}

function RevisionForm({ onSubmit }: { onSubmit: (message: string) => void }) {
  const t = useTranslations('services');
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  if (!open) {
    return (
      <Button type="button" size="lg" variant="outline" onClick={() => setOpen(true)}>
        {t('requestRevision')}
      </Button>
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(message);
        setOpen(false);
      }}
      className="flex w-full flex-col gap-3"
    >
      <Label htmlFor="revision">{t('revisionMessage')}</Label>
      <Textarea id="revision" required rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
      <Button type="submit" size="lg" variant="outline" disabled={!message.trim()}>
        {t('sendRevision')}
      </Button>
    </form>
  );
}

function BriefForm({
  job,
  editable,
  onSave,
}: {
  job: ServiceOrder;
  editable: boolean;
  onSave: (patch: { notes: string; reference_links: string }) => void;
}) {
  const t = useTranslations('services');
  const [notes, setNotes] = useState(job.notes ?? '');
  const [links, setLinks] = useState(job.reference_links ?? '');
  const dirty = notes !== (job.notes ?? '') || links !== (job.reference_links ?? '');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ notes, reference_links: links });
      }}
      className="flex flex-col gap-5 border-t border-rule pt-8"
    >
      <span className="meta">{t('brief')}</span>
      {!editable && <p className="text-[12px] text-fg-dim">{t('briefLocked')}</p>}
      <div className="flex flex-col gap-3">
        <Label htmlFor="notes">{t('notes')}</Label>
        <Textarea id="notes" rows={4} disabled={!editable} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="links">{t('links')}</Label>
        <Textarea id="links" rows={2} disabled={!editable} value={links} onChange={(e) => setLinks(e.target.value)} />
      </div>
      {editable && (
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!dirty}>
          {t('saveBrief')}
        </Button>
      )}
    </form>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
