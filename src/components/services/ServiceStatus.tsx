'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

const TONE: Record<string, 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'neutral'> = {
  awaiting_files: 'pending',
  received: 'confirmed',
  in_progress: 'confirmed',
  delivered: 'confirmed',
  revision_requested: 'pending',
  completed: 'completed',
};

export default function ServiceStatus({ status }: { status: string }) {
  const t = useTranslations('services.status');
  return <Badge tone={TONE[status] ?? 'neutral'}>{t(status as never)}</Badge>;
}
