import { BellRing } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { CreateReminderDialog } from './create-reminder-dialog';
import { ReminderItem } from './reminder-item';
import type { Reminder } from '@/types/reminders.types';

export function RemindersTab({
  reminders,
  familyId,
}: {
  reminders: Reminder[];
  familyId: string | null;
}) {
  const upcoming = reminders.filter((r) => !r.isCompleted);
  const completed = reminders.filter((r) => r.isCompleted);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <CreateReminderDialog familyId={familyId} />
      </div>

      {reminders.length === 0 ? (
        <EmptyState
          icon={<BellRing className="h-8 w-8" />}
          title="No reminders yet"
          description="Add your first reminder — for a bill, an errand, anything you don't want to forget."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-dusk-500 dark:text-dusk-300">
              Upcoming ({upcoming.length})
            </h3>
            {upcoming.length === 0 ? (
              <p className="text-sm text-dusk-300 dark:text-dusk-500">Nothing upcoming — you&apos;re clear.</p>
            ) : (
              upcoming.map((reminder) => <ReminderItem key={reminder.id} reminder={reminder} />)
            )}
          </div>

          {completed.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-dusk-500 dark:text-dusk-300">
                Completed ({completed.length})
              </h3>
              {completed.map((reminder) => (
                <ReminderItem key={reminder.id} reminder={reminder} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
