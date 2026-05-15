import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono uppercase tracking-meta text-[11px] transition-colors duration-300 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
  {
    variants: {
      variant: {
        default:
          'bg-fg text-bg hover:bg-accent hover:text-bg',
        outline:
          'border hairline text-fg hover:border-accent hover:text-accent',
        ghost: 'text-fg-dim hover:text-fg',
        link: 'text-fg underline-offset-4 hover:text-accent hover:underline',
      },
      size: {
        default: 'h-10 px-5',
        sm: 'h-8 px-3',
        lg: 'h-12 px-7',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
