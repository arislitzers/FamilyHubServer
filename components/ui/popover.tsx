'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

/**
 * PopoverContent always renders through a Portal (escapes any parent
 * `overflow: hidden`, which is what actually clips a naively-positioned
 * dropdown) and keeps Radix's collision detection on — `avoidCollisions`
 * defaults to true, `collisionPadding` gives it a small buffer from the
 * viewport edge so content never touches the very edge of the browser
 * window, and `sticky="always"` keeps repositioning as the user scrolls
 * rather than only computing position once on open.
 */
export const PopoverContent = forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 8, collisionPadding = 12, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      avoidCollisions
      sticky="always"
      className={cn(
        'z-50 rounded-md border border-linen-300 bg-white shadow-lifted dark:border-dusk-600 dark:bg-dusk-800',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 duration-150',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = 'PopoverContent';
