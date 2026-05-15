import { redirect } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { createClient } from '@/lib/supabase/server';
import type { Reservation } from '@/lib/supabase/types';
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

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    // Supabase not configured — show an empty dashboard rather than 500.
    return <AdminDashboard locale={locale} reservations={[]} email={null} />;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/admin/login`);

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('session_date', { ascending: false })
    .order('start_time', { ascending: false });

  if (error) {
    console.error('[admin:page] fetch reservations:', error);
  }

  return (
    <AdminDashboard
      locale={locale}
      reservations={(data as Reservation[] | null) ?? []}
      email={user.email ?? null}
    />
  );
}
