'use client';

import { useRef, useState, type InputHTMLAttributes } from 'react';
import { EmojiPickerButton } from './emoji-picker-button';
import { cn } from '@/lib/utils';

/** Single-line sibling of TextareaWithEmoji — same drop-in-replacement idea. */
export function InputWithEmoji({
  className,
  defaultValue,
  onChange,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const [value, setValue] = useState((defaultValue as string) ?? '');
  const ref = useRef<HTMLInputElement>(null);

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
      <input
        ref={ref}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange?.(e);
        }}
        className={cn(
          'h-10 w-full rounded-md border border-linen-300 bg-white pl-3 pr-10 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100',
          className
        )}
        {...props}
      />
      <EmojiPickerButton
        onSelect={insertEmoji}
        align="end"
        className="absolute right-0.5 top-0.5 h-9 w-9"
      />
    </div>
  );
}
