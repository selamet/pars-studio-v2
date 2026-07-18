import { redirect } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { isAdmin } from '@/lib/auth-server';
import { getPool, RESERVATION_COLUMNS } from '@/lib/db';
import type { Reservation } from '@/lib/types';
import AdminDashboard from './AdminDashboard';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-dynamic';

export default async function AdminPage({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  unstable_setRequestLocale(locale);

  if (!(await isAdmin())) redirect(`/${locale}/admin/login`);

  let reservations: Reservation[] = [];
  try {
    const { rows } = await getPool().query(
      `select ${RESERVATION_COLUMNS}
         from reservations
        order by session_date desc, start_time desc`
    );
    reservations = rows as Reservation[];
  } catch (err) {
    // DB unreachable — show an empty dashboard rather than 500.
    console.error('[admin:page] fetch reservations:', err);
  }

  return <AdminDashboard locale={locale} reservations={reservations} />;
}
