'use client';

import { useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { CATEGORY_OPTIONS, getCategoryDefaultColor } from '@/types/planner.types';
import type { EventCategory } from '@/types/planner.types';
import { COLOR_SWATCHES } from '@/types/planner.types';
import { cn } from '@/lib/utils';

export function CategoryAndColorFields({
  defaultCategory = 'family',
  defaultColor,
}: {
  defaultCategory?: EventCategory;
  defaultColor?: string | null;
}) {
  const [category, setCategory] = useState<EventCategory>(defaultCategory);
  const [color, setColor] = useState<string>(defaultColor || getCategoryDefaultColor(defaultCategory));
  const [colorTouched, setColorTouched] = useState(!!defaultColor);

  const handleCategoryChange = (next: EventCategory) => {
    setCategory(next);
    if (!colorTouched) setColor(getCategoryDefaultColor(next));
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="category-trigger" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
          Category
        </label>
        <Select value={category} onValueChange={(v) => handleCategoryChange(v as EventCategory)}>
          <SelectTrigger id="category-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="category" value={category} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dusk-600 dark:text-linen-200">Color</label>
        <div className="flex h-10 items-center gap-1.5">
          {COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => {
                setColor(swatch);
                setColorTouched(true);
              }}
              aria-label={`Use color ${swatch}`}
              className={cn(
                'h-6 w-6 rounded-full border-2 transition-transform',
                color === swatch ? 'scale-110 border-dusk-700 dark:border-linen-100' : 'border-transparent'
              )}
              style={{ backgroundColor: swatch }}
            />
          ))}
        </div>
        <input type="hidden" name="color" value={color} />
      </div>
    </div>
  );
}
