import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SITE } from '@/constants/site';

export function Logo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-hearth-400 text-white">
        <Home className="h-4 w-4" />
      </span>
      {!iconOnly && <span className="font-display text-lg">{SITE.name}</span>}
    </span>
  );
}
