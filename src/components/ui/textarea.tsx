import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full resize-y border-0 border-b border-rule bg-transparent px-0 py-3 font-sans text-[15px] leading-relaxed text-fg outline-none transition-colors duration-300 placeholder:text-fg-dim/60 focus:border-accent disabled:opacity-50',
      className
    )}
    rows={props.rows ?? 4}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export { Textarea };
