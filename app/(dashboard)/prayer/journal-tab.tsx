import { BookHeart } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { CreateJournalEntryDialog } from './create-journal-entry-dialog';
import { JournalEntryCard } from './journal-entry-card';
import type { PrayerJournalEntry } from '@/types/prayer.types';

export function JournalTab({
  myEntries,
  sharedEntries,
  familyId,
}: {
  myEntries: PrayerJournalEntry[];
  sharedEntries: (PrayerJournalEntry & { ownerName: string | null })[];
  familyId: string | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <CreateJournalEntryDialog familyId={familyId} />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-dusk-500 dark:text-dusk-300">Your journal</h3>
        {myEntries.length === 0 ? (
          <EmptyState
            icon={<BookHeart className="h-8 w-8" />}
            title="Your journal is empty"
            description="A quiet place to write down what you're praying through — private by default."
          />
        ) : (
          myEntries.map((entry) => <JournalEntryCard key={entry.id} entry={entry} canDelete />)
        )}
      </div>

      {sharedEntries.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-dusk-500 dark:text-dusk-300">Shared by your family</h3>
          {sharedEntries.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} ownerName={entry.ownerName ?? undefined} canDelete={false} />
          ))}
        </div>
      )}
    </div>
  );
}
