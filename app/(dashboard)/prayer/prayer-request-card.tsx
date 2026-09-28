'use client';

import { useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { HandHeart, Lock, Trash2, CheckCircle2, Undo2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getInitials, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { TextareaWithEmoji } from '@/components/shared/textarea-with-emoji';
import { PRAYER_CATEGORY_OPTIONS } from '@/types/prayer.types';
import {
  togglePrayAction,
  deletePrayerRequestAction,
  markPrayerAnsweredAction,
  unmarkPrayerAnsweredAction,
} from './actions';
import type { PrayerRequest } from '@/types/prayer.types';

function categoryLabel(category: string) {
  return PRAYER_CATEGORY_OPTIONS.find((c) => c.value === category)?.label ?? 'General';
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Mark answered'}
    </Button>
  );
}

export function PrayerRequestCard({
  request,
  canManage,
}: {
  request: PrayerRequest;
  canManage: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [answerOpen, setAnswerOpen] = useState(false);
  const [justPrayed, setJustPrayed] = useState(false);
  const [state, formAction] = useFormState(markPrayerAnsweredAction, { error: null });

  const togglePray = () => {
    if (!request.iAmPraying) {
      setJustPrayed(true);
      setTimeout(() => setJustPrayed(false), 500);
    }
    startTransition(() => {
      togglePrayAction(request.id);
    });
  };

  const remove = () => {
    startTransition(() => {
      deletePrayerRequestAction(request.id);
    });
  };

  const undoAnswered = () => {
    startTransition(() => {
      unmarkPrayerAnsweredAction(request.id);
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-md border border-linen-300 bg-white p-4 dark:border-dusk-600 dark:bg-dusk-800">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={request.authorAvatar ?? undefined} alt={request.authorName ?? ''} />
          <AvatarFallback>{getInitials(request.authorName ?? '?')}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-dusk-700 dark:text-linen-100">{request.title}</p>
          <p className="text-xs text-dusk-300 dark:text-dusk-500">
            {request.authorName ?? 'Someone'} · {formatDate(request.createdAt, { month: 'short', day: 'numeric', year: undefined })}
          </p>
        </div>
        {canManage && !request.isAnswered && (
          <button
            onClick={remove}
            disabled={isPending}
            aria-label="Delete prayer request"
            className="text-dusk-300 transition-colors hover:text-red-500 dark:text-dusk-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {request.description && (
        <p className="text-sm text-dusk-500 dark:text-dusk-200">{request.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline">{categoryLabel(request.category)}</Badge>
        {request.groupName && (
          <Badge variant="secondary" className="gap-1">
            <Lock className="h-3 w-3" /> {request.groupName}
          </Badge>
        )}
        {request.isAnswered && (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> Answered
          </Badge>
        )}
      </div>

      {request.isAnswered && request.answerNote && (
        <div className="rounded-md bg-sage-50 p-3 text-sm text-sage-700 dark:bg-sage-600/10 dark:text-sage-100">
          <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-sage-500">
            How it was answered
          </p>
          {request.answerNote}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-linen-200 pt-3 dark:border-dusk-700">
        <button
          onClick={togglePray}
          disabled={isPending}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all active:scale-95',
            justPrayed && 'animate-bounce-once',
            request.iAmPraying
              ? 'bg-hearth-400 text-white'
              : 'border border-linen-300 text-dusk-500 hover:border-hearth-300 dark:border-dusk-600 dark:text-dusk-200'
          )}
        >
          <HandHeart className={cn('h-3.5 w-3.5', justPrayed && 'animate-bounce-once')} />
          {request.iAmPraying ? "I'm praying" : 'Pray for this'}
          {request.prayCount > 0 && <span>· {request.prayCount}</span>}
        </button>

        {canManage && !request.isAnswered && (
          <Button variant="outline" size="sm" onClick={() => setAnswerOpen(true)} className="gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Mark answered
          </Button>
        )}
        {canManage && request.isAnswered && (
          <Button variant="ghost" size="sm" onClick={undoAnswered} disabled={isPending} className="gap-1.5">
            <Undo2 className="h-3.5 w-3.5" /> Undo
          </Button>
        )}
      </div>

      <Modal open={answerOpen} onOpenChange={setAnswerOpen} title="Mark this prayer answered">
        <form action={formAction} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="requestId" value={request.id} />

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="answerNote" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
              How was it answered? <span className="text-dusk-300">(optional)</span>
            </label>
            <TextareaWithEmoji
              id="answerNote"
              name="answerNote"
              rows={3}
              placeholder="Share the testimony, if you'd like"
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setAnswerOpen(false)}>
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </Modal>
    </div>
  );
}
