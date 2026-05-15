import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-meta',
  {
    variants: {
      tone: {
        pending: 'border-accent/40 text-accent',
        confirmed: 'border-fg/30 text-fg',
        completed: 'border-fg-dim/30 text-fg-dim',
        cancelled: 'border-rule text-fg-dim line-through decoration-fg-dim/50',
        neutral: 'border-rule text-fg-dim',
      },
    },
    defaultVariants: { tone: 'neutral' },
  }
);

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props} />
  );
}
