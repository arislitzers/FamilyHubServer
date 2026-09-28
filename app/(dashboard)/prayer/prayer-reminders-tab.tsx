import { Sparkles, Users } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { CreatePrayerReminderDialog } from './create-prayer-reminder-dialog';
import { PrayerReminderItem } from './prayer-reminder-item';
import type { PrayerReminder } from '@/types/reminders.types';

interface SharedReminder {
  id: string;
  label: string;
  timeOfDay: string;
  daysOfWeek: number[];
  isActive: boolean;
  ownerName: string;
}

export function PrayerRemindersTab({
  myReminders,
  sharedReminders,
  familyId,
}: {
  myReminders: PrayerReminder[];
  sharedReminders: SharedReminder[];
  familyId: string | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <CreatePrayerReminderDialog familyId={familyId} />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-dusk-500 dark:text-dusk-300">Your reminders</h3>
        {myReminders.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-8 w-8" />}
            title="No prayer reminders yet"
            description="Set a recurring time to pause and pray, on the days that work for you."
          />
        ) : (
          myReminders.map((reminder) => <PrayerReminderItem key={reminder.id} reminder={reminder} />)
        )}
      </div>

      {sharedReminders.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="flex items-center gap-1.5 text-sm font-medium text-dusk-500 dark:text-dusk-300">
            <Users className="h-3.5 w-3.5" /> Shared by your family
          </h3>
          {sharedReminders.map((reminder) => (
            <PrayerReminderItem
              key={reminder.id}
              reminder={{
                id: reminder.id,
                userId: reminder.id,
                label: `${reminder.label} — ${reminder.ownerName}`,
                timeOfDay: reminder.timeOfDay,
                daysOfWeek: reminder.daysOfWeek,
                isActive: reminder.isActive,
              }}
              isShared
            />
          ))}
        </div>
      )}
    </div>
  );
}
