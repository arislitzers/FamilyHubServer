import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ease-hearth active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-hearth-400 text-white shadow-soft hover:bg-hearth-500 active:bg-hearth-600',
        secondary:
          'bg-dusk-700 text-linen-100 shadow-soft hover:bg-dusk-600 dark:bg-dusk-500 dark:hover:bg-dusk-400',
        outline:
          'border border-linen-400 bg-transparent text-dusk-700 hover:bg-linen-300 dark:border-dusk-500 dark:text-linen-100 dark:hover:bg-dusk-700',
        ghost: 'bg-transparent text-dusk-600 hover:bg-linen-300 dark:text-linen-200 dark:hover:bg-dusk-700',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        link: 'text-hearth-500 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';
