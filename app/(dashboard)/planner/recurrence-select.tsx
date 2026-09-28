'use client';

import { useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { RecurrenceOption } from '@/types/planner.types';

const OPTIONS: { value: RecurrenceOption; label: string }[] = [
  { value: 'none', label: "Doesn't repeat" },
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Every week' },
  { value: 'monthly', label: 'Every month' },
];

export function RecurrenceSelect({ defaultValue = 'none' }: { defaultValue?: RecurrenceOption }) {
  const [value, setValue] = useState<RecurrenceOption>(defaultValue);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="recurrence-trigger" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
        Repeats
      </label>
      <Select value={value} onValueChange={(v) => setValue(v as RecurrenceOption)}>
        <SelectTrigger id="recurrence-trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name="recurrence" value={value} />
    </div>
  );
}
