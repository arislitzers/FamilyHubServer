import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-hearth-100 text-hearth-700 dark:bg-hearth-900 dark:text-hearth-200',
        secondary: 'bg-dusk-100 text-dusk-700 dark:bg-dusk-600 dark:text-linen-100',
        success: 'bg-sage-100 text-sage-600 dark:bg-sage-600/30 dark:text-sage-100',
        outline: 'border border-linen-400 text-dusk-600 dark:border-dusk-500 dark:text-linen-200',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
