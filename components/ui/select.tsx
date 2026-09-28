'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { forwardRef } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = 'SelectTrigger';

/**
 * The actual fix for "dropdown cut off at the edge of the browser":
 * position="popper" (rather than the default centered "item-aligned"
 * mode) puts this through the same Popper collision-detection engine as
 * our DropdownMenu/Popover components — avoidCollisions is on by default,
 * collisionPadding keeps it off the very edge, and rendering through a
 * Portal means no ancestor's `overflow: hidden` can clip it. This is a
 * guarantee, not a hope that the browser's native <select> behaves —
 * native selects can't be controlled this way at all, which is why this
 * component exists instead.
 */
export const SelectContent = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', collisionPadding = 12, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      collisionPadding={collisionPadding}
      avoidCollisions
      sticky="always"
      className={cn(
        'z-50 max-h-[min(24rem,var(--radix-select-content-available-height))] min-w-[8rem] overflow-y-auto rounded-md border border-linen-300 bg-white shadow-lifted dark:border-dusk-600 dark:bg-dusk-800',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-150',
        className
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = 'SelectContent';

export const SelectItem = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-dusk-600 outline-none transition-colors focus:bg-linen-300 data-[state=checked]:font-medium data-[state=checked]:text-dusk-900 dark:text-linen-200 dark:focus:bg-dusk-600 dark:data-[state=checked]:text-linen-100',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-3.5 w-3.5" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = 'SelectItem';

export const SelectLabel = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-xs font-semibold text-dusk-400 dark:text-dusk-300', className)}
    {...props}
  />
));
SelectLabel.displayName = 'SelectLabel';

export const SelectSeparator = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-linen-300 dark:bg-dusk-600', className)}
    {...props}
  />
));
SelectSeparator.displayName = 'SelectSeparator';
