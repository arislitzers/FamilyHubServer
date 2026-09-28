import { createClient } from '@/lib/supabase/server';
import { getMySettings } from '@/services/settings.service';
import { SettingsLayout } from '@/components/layout/settings-layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GeneralTab } from './general-tab';
import { NotificationsSettingsTab } from './notifications-settings-tab';
import { PrivacyTab } from './privacy-tab';
import { AppearanceTab } from './appearance-tab';
import { SecurityTab } from './security-tab';

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const settings = user
    ? await getMySettings(user.id)
    : {
        userId: '',
        theme: 'system',
        colorTheme: 'hearth',
        notificationPreferences: {
          message: true,
          family_member_added: true,
          role_changed: true,
          planner_event: true,
          check_in: true,
          reminder_shared: true,
          join_request: true,
          media_uploaded: true,
          prayer_request: true,
          prayer_answered: true,
        },
        language: 'en',
      };

  return (
    <SettingsLayout>
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab email={user?.email ?? ''} language={settings.language} />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceTab />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsSettingsTab preferences={settings.notificationPreferences} />
        </TabsContent>

        <TabsContent value="privacy">
          <PrivacyTab email={user?.email ?? ''} />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </SettingsLayout>
  );
}
