'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type {
  Reservation,
  ReservationStatus,
} from '@/lib/types';
import { SERVICES } from '@/lib/booking/services';

type Locale = 'tr' | 'en';

const STATUSES: ReservationStatus[] = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
];

export default function ReservationDialog({
  locale,
  reservation,
  onClose,
  onUpdate,
  onDelete,
}: {
  locale: Locale;
  reservation: Reservation;
  onClose: () => void;
  onUpdate: (r: Reservation) => void;
  onDelete: (id: string) => void;
}) {
  const t = useTranslations('admin.dialog');
  const tStatus = useTranslations('admin.status');

  const [status, setStatus] = useState<ReservationStatus>(reservation.status);
  const [notes, setNotes] = useState<string>(reservation.admin_notes ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    status !== reservation.status ||
    (notes || '') !== (reservation.admin_notes ?? '');

  const service = SERVICES.find((s) => s.id === reservation.service_type);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: notes }),
      });
      if (!res.ok) {
        setError(t('error'));
        return;
      }
      const updated = (await res.json()) as Reservation;
      onUpdate(updated);
      setSavedAt(Date.now());
    } catch {
      setError(t('error'));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(t('deleteConfirm'))) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        setError(t('error'));
        setDeleting(false);
        return;
      }
      onDelete(reservation.id);
    } catch {
      setError(t('error'));
      setDeleting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <DialogTitle>{t('title')}</DialogTitle>
          <Badge tone={statusTone(reservation.status)}>
            {tStatus(reservation.status)}
          </Badge>
        </div>

        {/* Code + createdAt */}
        <div className="mt-5 flex items-center justify-between border-b border-rule pb-5">
          <div>
            <div className="meta">{t('code')}</div>
            <div className="mt-1 font-mono text-[18px] tracking-[0.22em] text-accent">
              {reservation.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
          <div className="text-right">
            <div className="meta">{t('createdAt')}</div>
            <div className="mt-1 font-mono text-[12px] tracking-[0.05em] text-fg-dim">
              {formatDateTime(reservation.created_at, locale)}
            </div>
          </div>
        </div>

        {/* Session */}
        <Section title={t('session')}>
          <Row label={t('service')}>{service?.name[locale] ?? reservation.service_type}</Row>
          <Row label={t('date')}>{formatDateDisplay(reservation.session_date, locale)}</Row>
          <Row label={t('time')}>{reservation.start_time.slice(0, 5)}</Row>
          <Row label={t('duration')}>
            {reservation.duration_hours}{' '}
            {reservation.duration_hours === 1 ? t('hour') : t('hours')}
          </Row>
        </Section>

        {/* Customer */}
        <Section title={t('customer')}>
          <Row label={t('name')}>{reservation.customer_name}</Row>
          <Row label={t('email')}>
            <a
              href={`mailto:${reservation.customer_email}`}
              className="text-fg hover:text-accent"
            >
              {reservation.customer_email}
            </a>
          </Row>
          <Row label={t('phone')}>
            <a
              href={`tel:${reservation.customer_phone}`}
              className="text-fg hover:text-accent"
            >
              {reservation.customer_phone}
            </a>
          </Row>
          {reservation.artist_name && (
            <Row label={t('artist')}>{reservation.artist_name}</Row>
          )}
        </Section>

        {/* Project / Refs */}
        {(reservation.project_description || reservation.reference_links) && (
          <Section title={t('project')}>
            {reservation.project_description && (
              <p className="whitespace-pre-wrap text-[14px] leading-[1.7] text-fg/80">
                {reservation.project_description}
              </p>
            )}
            {reservation.reference_links && (
              <div className="mt-3">
                <div className="meta">{t('references')}</div>
                <p className="mt-1 whitespace-pre-wrap text-[13px] leading-[1.6] text-fg-dim">
                  {reservation.reference_links}
                </p>
              </div>
            )}
          </Section>
        )}

        {/* Status changer */}
        <div className="mt-7">
          <Label className="mb-3 block">{t('statusLabel')}</Label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => {
              const active = status === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    'h-9 border px-3 font-mono text-[10px] uppercase tracking-meta transition-all duration-200',
                    active
                      ? 'border-accent text-accent'
                      : 'border-rule text-fg-dim hover:border-fg-dim hover:text-fg'
                  )}
                  aria-pressed={active}
                >
                  {tStatus(s)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="mt-7">
          <Label htmlFor="admin-notes" className="mb-3 block">
            {t('notes')}
          </Label>
          <Textarea
            id="admin-notes"
            placeholder={t('notesPh')}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error && (
          <p className="mt-5 border border-accent/50 px-4 py-3 font-mono text-[11px] uppercase tracking-meta text-accent">
            {error}
          </p>
        )}

        {savedAt && !error && !dirty && (
          <p className="mt-5 font-mono text-[11px] uppercase tracking-meta text-fg-dim">
            {t('saved')}
          </p>
        )}

        <DialogFooter className="mt-8 flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
          <div className="flex gap-3">
            <a
              href={`/api/reservations/${reservation.id}/ics`}
              className="inline-flex items-center font-mono text-[11px] uppercase tracking-meta text-fg-dim transition-colors hover:text-accent"
            >
              {t('downloadIcs')}
            </a>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={remove}
              disabled={deleting || saving}
              className="!text-fg-dim hover:!text-accent"
            >
              {deleting ? t('deleting') : t('delete')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              {t('close')}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={save}
              disabled={!dirty || saving || deleting}
            >
              {saving ? t('saving') : t('save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-7 border-t border-rule pt-5">
      <span className="meta">{title}</span>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <span className="meta normal-case tracking-[0.12em]">{label}</span>
      <span className="text-right text-[14px] text-fg">{children}</span>
    </div>
  );
}

function statusTone(s: ReservationStatus) {
  switch (s) {
    case 'pending':
      return 'pending' as const;
    case 'confirmed':
      return 'confirmed' as const;
    case 'completed':
      return 'completed' as const;
    case 'cancelled':
      return 'cancelled' as const;
  }
}

function formatDateDisplay(iso: string, locale: Locale): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (locale === 'tr') {
    return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`;
  }
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}

function formatDateTime(iso: string, locale: Locale): string {
  const d = new Date(iso);
  const date = formatDateDisplay(
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    locale
  );
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${date} · ${time}`;
}
