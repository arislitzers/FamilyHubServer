import { createClient } from '@/lib/supabase/server';
import { getMyFamily, getFamilyProfiles } from '@/services/families.service';
import { getPlannerEvents } from '@/services/planner.service';
import { getMyPrayerReminders } from '@/services/reminders.service';
import { getUnreadMessagesSummary } from '@/services/dashboard.service';
import { getFamilyActivityFeed } from '@/services/activity.service';
import { addDays, startOfDay } from '@/lib/date-utils';
import { getUpcomingBirthdays, getNextPrayerOccurrence } from '@/lib/schedule-utils';
import { FamilyOnboarding } from '@/app/(dashboard)/family/family-onboarding';
import { WelcomeCard } from './welcome-card';
import { TodaysPlannerCard } from './todays-planner-card';
import { UpcomingBirthdaysCard } from './upcoming-birthdays-card';
import { PrayerReminderCard } from './prayer-reminder-card';
import { UnreadMessagesCard } from './unread-messages-card';
import { FamilyActivityCard } from './family-activity-card';
import { QuickActionsCard } from './quick-actions-card';
import { RecentNotificationsCard } from './recent-notifications-card';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { family, myRole } = await getMyFamily();

  if (!family) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <FamilyOnboarding />
      </div>
    );
  }

  const isAdmin = myRole === 'owner' || myRole === 'admin';
  const todayStart = startOfDay(new Date());
  const todayEnd = addDays(todayStart, 1);

  const [todaysEvents, profiles, myPrayerReminders, unreadSummary, activity] = await Promise.all([
    getPlannerEvents(family.id, todayStart, todayEnd),
    getFamilyProfiles(family.id),
    user ? getMyPrayerReminders(user.id) : Promise.resolve([]),
    user ? getUnreadMessagesSummary(user.id) : Promise.resolve({ count: 0, latestTitle: null, latestPreview: null, latestAt: null }),
    getFamilyActivityFeed(family.id, 6),
  ]);

  const myProfile = profiles.find((p) => p.isSelf);
  const emailLocalPart = (user?.email ?? 'there').split('@')[0] ?? 'there';
  const displayName = myProfile?.nickname || myProfile?.displayName || myProfile?.fullName || emailLocalPart;

  const birthdays = getUpcomingBirthdays(profiles);
  const nextPrayer = getNextPrayerOccurrence(myPrayerReminders);

  return (
    <div className="flex flex-col gap-4">
      <WelcomeCard displayName={displayName} familyName={family.name} />

      <QuickActionsCard familyId={family.id} isAdmin={isAdmin} />

      <div className="grid gap-4 lg:grid-cols-2">
        <TodaysPlannerCard events={todaysEvents} />
        <UpcomingBirthdaysCard birthdays={birthdays} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PrayerReminderCard next={nextPrayer} />
        <UnreadMessagesCard summary={unreadSummary} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FamilyActivityCard entries={activity} />
        <RecentNotificationsCard />
      </div>
    </div>
  );
}
