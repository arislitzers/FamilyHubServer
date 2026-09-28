import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Visual placeholder for the future Chat module — renders a couple of
 * skeleton message bubbles, no real message data.
 */
export function ChatBubblePlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3 rounded-lg border border-dashed border-linen-400 p-6 dark:border-dusk-500', className)}>
      <div className="flex items-center gap-2 text-dusk-400 dark:text-dusk-200">
        <MessageCircle className="h-4 w-4" />
        <span className="text-sm">Chat coming soon</span>
      </div>
      <div className="h-8 w-2/3 animate-pulse rounded-2xl rounded-tl-sm bg-linen-300 dark:bg-dusk-600" />
      <div className="ml-auto h-8 w-1/2 animate-pulse rounded-2xl rounded-tr-sm bg-hearth-100 dark:bg-hearth-900/40" />
      <div className="h-8 w-3/5 animate-pulse rounded-2xl rounded-tl-sm bg-linen-300 dark:bg-dusk-600" />
    </div>
  );
}
