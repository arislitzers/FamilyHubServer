'use client';

import { useState } from 'react';
import { Users, Lock, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VisibilityFields({
  defaultFamilyVisible = true,
  defaultPrivacy = 'public',
}: {
  defaultFamilyVisible?: boolean;
  defaultPrivacy?: 'public' | 'private';
}) {
  const [familyVisible, setFamilyVisible] = useState(defaultFamilyVisible);
  const [privacy, setPrivacy] = useState<'public' | 'private'>(defaultPrivacy);

  return (
    <div className="flex flex-col gap-3 rounded-md border border-linen-300 p-3 dark:border-dusk-600">
      <label className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm text-dusk-700 dark:text-linen-100">
          <Users className="h-4 w-4" /> Visible to family
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={familyVisible}
          onClick={() => setFamilyVisible((v) => !v)}
          className={cn(
            'relative h-6 w-11 shrink-0 rounded-full transition-colors',
            familyVisible ? 'bg-hearth-400' : 'bg-linen-400 dark:bg-dusk-600'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform',
              familyVisible ? 'translate-x-5' : 'translate-x-0.5'
            )}
          />
        </button>
        <input type="hidden" name="isFamilyVisible" value={familyVisible ? 'on' : 'off'} />
      </label>
      {!familyVisible && (
        <p className="text-xs text-dusk-400 dark:text-dusk-300">
          Only you will see this event — not even as a &ldquo;busy&rdquo; time slot.
        </p>
      )}

      {familyVisible && (
        <label className="flex items-center justify-between gap-3 border-t border-linen-200 pt-3 dark:border-dusk-700">
          <span className="flex items-center gap-2 text-sm text-dusk-700 dark:text-linen-100">
            {privacy === 'private' ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
            {privacy === 'private' ? 'Private (family sees "Busy" only)' : 'Public (family sees full details)'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={privacy === 'private'}
            onClick={() => setPrivacy((p) => (p === 'private' ? 'public' : 'private'))}
            className={cn(
              'relative h-6 w-11 shrink-0 rounded-full transition-colors',
              privacy === 'private' ? 'bg-dusk-500' : 'bg-linen-400 dark:bg-dusk-600'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform',
                privacy === 'private' ? 'translate-x-5' : 'translate-x-0.5'
              )}
            />
          </button>
          <input type="hidden" name="privacy" value={privacy} />
        </label>
      )}
    </div>
  );
}
