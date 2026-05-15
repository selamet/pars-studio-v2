import * as React from 'react';
import { cn } from '@/lib/utils';

/** Editorial input: transparent, single hairline underline, brass focus. */
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'w-full border-0 border-b border-rule bg-transparent px-0 py-3 font-sans text-[15px] text-fg outline-none transition-colors duration-300 placeholder:text-fg-dim/60 focus:border-accent disabled:opacity-50',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };
