import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva('w-full rounded-md border p-4 text-sm', {
  variants: {
    variant: {
      default: 'border-linen-300 bg-linen-100 text-dusk-700 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100',
      success: 'border-sage-300 bg-sage-50 text-sage-600 dark:border-sage-500/40 dark:bg-sage-600/10 dark:text-sage-100',
      destructive: 'border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200',
      warning: 'border-hearth-300 bg-hearth-50 text-hearth-700 dark:border-hearth-500/40 dark:bg-hearth-500/10 dark:text-hearth-200',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface AlertProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div role="alert" className={cn(alertVariants({ variant, className }))} {...props} />;
}

export function AlertTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn('mb-1 font-medium leading-none', className)} {...props} />;
}

export function AlertDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm opacity-90', className)} {...props} />;
}
