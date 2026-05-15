import * as React from 'react';
import { cn } from '@/lib/utils';

/** Monospace meta label, matching the studio aesthetic. */
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'font-mono text-[11px] uppercase tracking-meta text-fg-dim',
      className
    )}
    {...props}
  />
));
Label.displayName = 'Label';

export { Label };
