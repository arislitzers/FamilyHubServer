import { createClient } from '@/lib/supabase/server';
import { getMyFamily } from '@/services/families.service';
import { getMyPrayerReminders } from '@/services/reminders.service';
import {
  getPrayerRequests,
  getMyPrayerGroupOptions,
  getMyPrayerJournalEntries,
  getSharedFamilyJournalEntries,
  getFamilySharedPrayerReminders,
} from '@/services/prayer.service';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sparkles } from 'lucide-react';
import { RequestsTab } from './requests-tab';
import { AnsweredTab } from './answered-tab';
import { PrayerRemindersTab } from './prayer-reminders-tab';
import { JournalTab } from './journal-tab';
import { PrayerCalendarTab } from './calendar-tab';

export default async function PrayerPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { family, myRole } = await getMyFamily();

  if (!family || !user) {
    return (
      <div>
        <PageHeader title="Prayer Center" description="Requests, answered prayers, reminders, and a private journal." />
        <EmptyState
          icon={<Sparkles className="h-8 w-8" />}
          title="Set up your family first"
          description="The Prayer Center appears here once your family exists — head to the Family page to create one."
        />
      </div>
    );
  }

  const isAdmin = myRole === 'owner' || myRole === 'admin';

  const [
    activeRequests,
    answeredRequests,
    groups,
    myReminders,
    sharedReminders,
    myJournalEntries,
    sharedJournalEntries,
  ] = await Promise.all([
    getPrayerRequests(family.id, false),
    getPrayerRequests(family.id, true),
    getMyPrayerGroupOptions(family.id),
    getMyPrayerReminders(user.id),
    getFamilySharedPrayerReminders(family.id, user.id),
    getMyPrayerJournalEntries(user.id),
    getSharedFamilyJournalEntries(family.id, user.id),
  ]);

  return (
    <div>
      <PageHeader
        title="Prayer Center"
        description="Requests, answered prayers, reminders, and a private journal."
      />

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Requests ({activeRequests.length})</TabsTrigger>
          <TabsTrigger value="answered">Answered ({answeredRequests.length})</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <RequestsTab
            requests={activeRequests}
            familyId={family.id}
            groups={groups}
            currentUserId={user.id}
            isAdmin={isAdmin}
          />
        </TabsContent>

        <TabsContent value="answered">
          <AnsweredTab requests={answeredRequests} currentUserId={user.id} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="reminders">
          <PrayerRemindersTab
            myReminders={myReminders}
            sharedReminders={sharedReminders}
            familyId={family.id}
          />
        </TabsContent>

        <TabsContent value="journal">
          <JournalTab myEntries={myJournalEntries} sharedEntries={sharedJournalEntries} familyId={family.id} />
        </TabsContent>

        <TabsContent value="calendar">
          <PrayerCalendarTab
            reminders={[...myReminders]}
            activeRequests={activeRequests}
            answeredRequests={answeredRequests}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
