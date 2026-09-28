'use client';

import { Search, X } from 'lucide-react';
import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange?: (value: string) => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, placeholder = 'Search...', onChange, defaultValue, ...props }, ref) => {
    const [value, setValue] = useState((defaultValue as string) ?? '');

    return (
      <div className={cn('relative flex items-center', className)}>
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-dusk-300 dark:text-dusk-400" />
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onChange?.(e.target.value);
          }}
          className="h-10 w-full rounded-md border border-linen-300 bg-white pl-9 pr-8 text-sm text-dusk-700 placeholder:text-dusk-300 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
          {...props}
        />
        {value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setValue('');
              onChange?.('');
            }}
            className="absolute right-3 text-dusk-300 hover:text-dusk-500 dark:text-dusk-400"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
SearchBar.displayName = 'SearchBar';
