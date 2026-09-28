'use client';

import { useState } from 'react';
import { Smile } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EMOJI_CATEGORIES } from '@/lib/emoji-data';
import { cn } from '@/lib/utils';

/**
 * A button that opens a grid of emoji (rendered in Android/Google style —
 * see the Noto Color Emoji font loaded in app/layout.tsx) and calls
 * `onSelect` with the chosen character. Deliberately unopinionated about
 * *where* the emoji goes — the caller decides whether to append it,
 * insert it at a cursor position, etc. — so this one component can sit
 * next to a single-line input, a multi-line textarea, or a chat
 * composer without knowing anything about the field it's attached to.
 */
export function EmojiPickerButton({
  onSelect,
  align = 'end',
  className,
}: {
  onSelect: (emoji: string) => void;
  align?: 'start' | 'center' | 'end';
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Insert emoji"
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-dusk-400 transition-colors hover:bg-linen-300 hover:text-dusk-600 dark:text-dusk-300 dark:hover:bg-dusk-700 dark:hover:text-linen-100',
            className
          )}
        >
          <Smile className="h-4.5 w-4.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-72 p-0">
        <Tabs defaultValue={EMOJI_CATEGORIES[0]?.label ?? 'Smileys'}>
          <TabsList className="m-2 flex-wrap">
            {EMOJI_CATEGORIES.map((cat) => (
              <TabsTrigger key={cat.label} value={cat.label} className="text-[11px]">
                {cat.label.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>
          {EMOJI_CATEGORIES.map((cat) => (
            <TabsContent key={cat.label} value={cat.label} className="mt-0 px-2 pb-2">
              <div className="grid max-h-56 grid-cols-8 gap-0.5 overflow-y-auto">
                {cat.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onSelect(emoji);
                      setOpen(false);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-linen-300 dark:hover:bg-dusk-700"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
