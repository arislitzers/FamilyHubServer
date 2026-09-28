'use client';

import { useRef, useState, type TextareaHTMLAttributes } from 'react';
import { EmojiPickerButton } from './emoji-picker-button';
import { cn } from '@/lib/utils';

/**
 * Drop-in replacement for a plain `<textarea>` inside a form — still
 * submits via its `name` attribute like any other form field, since it
 * renders a real textarea underneath. The only addition is an emoji
 * button in the corner that inserts at the current cursor position
 * (falling back to the end of the text if focus was lost) rather than
 * always appending to the end, which matters more for a multi-line field
 * than it does for a single-line chat composer.
 */
export function TextareaWithEmoji({
  className,
  defaultValue,
  onChange,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [value, setValue] = useState((defaultValue as string) ?? '');
  const ref = useRef<HTMLTextAreaElement>(null);

  const insertEmoji = (emoji: string) => {
    const el = ref.current;
    if (!el) {
      setValue((prev) => prev + emoji);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + emoji + value.slice(end);
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + emoji.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange?.(e);
        }}
        className={cn(
          'w-full rounded-md border border-linen-300 bg-white px-3 py-2 pr-10 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100',
          className
        )}
        {...props}
      />
      <EmojiPickerButton onSelect={insertEmoji} align="end" className="absolute right-1 top-1 h-7 w-7" />
    </div>
  );
}
