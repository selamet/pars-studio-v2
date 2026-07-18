'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type {
  Reservation,
  ReservationStatus,
} from '@/lib/types';
import { SERVICES } from '@/lib/booking/services';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import ReservationDialog from './ReservationDialog';

type Locale = 'tr' | 'en';
type Filter = 'all' | ReservationStatus;

export default function AdminDashboard({
  locale,
  reservations: initial,
}: {
  locale: Locale;
  reservations: Reservation[];
}) {
  const t = useTranslations('admin.dashboard');
  const tStatus = useTranslations('admin.status');
  const router = useRouter();

  const [reservations, setReservations] = useState<Reservation[]>(initial);
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<Reservation | null>(null);

  const counts = useMemo(() => {
    const c = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    for (const r of reservations) c[r.status]++;
    return c;
  }, [reservations]);

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? reservations
        : reservations.filter((r) => r.status === filter),
    [reservations, filter]
  );

  function onUpdate(updated: Reservation) {
    setReservations((rows) =>
      rows.map((r) => (r.id === updated.id ? updated : r))
    );
    setOpen(updated);
  }

  function onDelete(id: string) {
    setReservations((rows) => rows.filter((r) => r.id !== id));
    setOpen(null);
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push(`/${locale}/admin/login`);
    router.refresh();
  }

  return (
    <main>
      <section className="section pt-[clamp(160px,18vh,240px)]">
        <div className="shell">
          {/* Header */}
          <header className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-5">
                <span className="meta !text-accent">∙</span>
                <span className="meta">{t('label')}</span>
              </div>
              <h1 className="mt-7 font-serif font-light leading-[1.04] tracking-[-0.012em] text-[clamp(34px,5vw,68px)]">
                {t('heading')}
              </h1>
            </div>

            <div className="flex flex-col items-start gap-3 md:items-end">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                {t('logout')}
              </Button>
            </div>
          </header>

          {/* Filter tabs */}
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as Filter)}
            className="mb-10"
          >
            <TabsList>
              <TabsTrigger value="all">
                {t('filters.all')}
                <span className="ml-2 normal-case tracking-[0.12em] text-fg-dim">
                  {reservations.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="pending">
                {t('filters.pending')}
                <span className="ml-2 normal-case tracking-[0.12em] text-fg-dim">
                  {counts.pending}
                </span>
              </TabsTrigger>
              <TabsTrigger value="confirmed">
                {t('filters.confirmed')}
                <span className="ml-2 normal-case tracking-[0.12em] text-fg-dim">
                  {counts.confirmed}
                </span>
              </TabsTrigger>
              <TabsTrigger value="completed">
                {t('filters.completed')}
                <span className="ml-2 normal-case tracking-[0.12em] text-fg-dim">
                  {counts.completed}
                </span>
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                {t('filters.cancelled')}
                <span className="ml-2 normal-case tracking-[0.12em] text-fg-dim">
                  {counts.cancelled}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="border hairline bg-bg-soft/40 px-6 py-14 text-center">
              <span className="meta">
                {reservations.length === 0 ? t('empty') : t('emptyFilter')}
              </span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('columns.date')}</TableHead>
                  <TableHead>{t('columns.time')}</TableHead>
                  <TableHead>{t('columns.service')}</TableHead>
                  <TableHead>{t('columns.customer')}</TableHead>
                  <TableHead>{t('columns.status')}</TableHead>
                  <TableHead className="text-right">
                    {t('columns.code')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow
                    key={r.id}
                    onClick={() => setOpen(r)}
                    className="cursor-pointer hover:bg-[rgba(255,255,255,0.02)]"
                  >
                    <TableCell className="font-mono text-[13px] tracking-[0.05em] text-fg">
                      {formatDateDisplay(r.session_date, locale)}
                    </TableCell>
                    <TableCell className="font-mono text-[13px] tracking-[0.05em] text-fg">
                      {r.start_time.slice(0, 5)}
                      <span className="ml-2 text-fg-dim">
                        · {r.duration_hours}h
                      </span>
                    </TableCell>
                    <TableCell className="font-serif text-[15px]">
                      {SERVICES.find((s) => s.id === r.service_type)?.name[
                        locale
                      ] ?? r.service_type}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-fg">{r.customer_name}</span>
                        <span className="text-[12px] text-fg-dim">
                          {r.customer_email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge tone={statusTone(r.status)}>
                        {tStatus(r.status)}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-mono text-[12px] tracking-[0.18em] text-fg-dim'
                      )}
                    >
                      {r.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>

      {open && (
        <ReservationDialog
          locale={locale}
          reservation={open}
          onClose={() => setOpen(null)}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}
    </main>
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
