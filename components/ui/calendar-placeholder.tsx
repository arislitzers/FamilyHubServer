import { CalendarDays } from 'lucide-react';

/**
 * Visual placeholder for the future Planner calendar module.
 * Renders a lightweight month-grid skeleton — no dates or events wired up.
 */
export function CalendarPlaceholder({ label = 'Planner coming soon' }: { label?: string }) {
  const cells = Array.from({ length: 35 });

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-linen-400 bg-linen-100/60 p-8 text-center dark:border-dusk-500 dark:bg-dusk-800/40">
      <CalendarDays className="h-8 w-8 text-hearth-400" />
      <div className="grid w-full max-w-xs grid-cols-7 gap-1">
        {cells.map((_, i) => (
          <div key={i} className="aspect-square rounded-sm bg-linen-300 dark:bg-dusk-600" />
        ))}
      </div>
      <p className="text-sm text-dusk-400 dark:text-dusk-200">{label}</p>
    </div>
  );
}
