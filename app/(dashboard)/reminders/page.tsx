import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getMyFamily } from '@/services/families.service';
import { getMyReminders, getFamilyCheckIns } from '@/services/reminders.service';
import { PageHeader } from '@/components/shared/page-header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ROUTES } from '@/constants/routes';
import { RemindersTab } from './reminders-tab';
import { CheckInsTab } from './check-ins-tab';

export default async function RemindersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { family, myRole } = await getMyFamily();
  const isAdmin = myRole === 'owner' || myRole === 'admin';

  const [reminders, checkIns] = await Promise.all([
    user ? getMyReminders(user.id) : Promise.resolve([]),
    family ? getFamilyCheckIns(family.id) : Promise.resolve([]),
  ]);

  return (
    <div>
      <PageHeader
        title="Reminders"
        description="Gentle nudges for the things that matter."
        actions={
          <Link
            href={ROUTES.prayer}
            className="flex items-center gap-1.5 text-sm text-hearth-500 hover:underline"
          >
            <Sparkles className="h-3.5 w-3.5" /> Prayer reminders moved to the Prayer Center
          </Link>
        }
      />

      <Tabs defaultValue="reminders">
        <TabsList>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="checkins">Check-Ins</TabsTrigger>
        </TabsList>

        <TabsContent value="reminders">
          <RemindersTab reminders={reminders} familyId={family?.id ?? null} />
        </TabsContent>

        <TabsContent value="checkins">
          <CheckInsTab
            familyId={family?.id ?? null}
            checkIns={checkIns}
            currentUserId={user?.id ?? ''}
            isAdmin={isAdmin}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
