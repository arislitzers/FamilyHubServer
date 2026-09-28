import { Users, Image as ImageIcon, Activity } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import {
  getMyFamily,
  getFamilyMembers,
  getMyPendingJoinRequest,
  getFamilyJoinRequests,
  getFamilyInviteLinks,
} from '@/services/families.service';
import { getFamilyMedia } from '@/services/media.service';
import { getFamilyActivityFeed } from '@/services/activity.service';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FamilyOnboarding } from './family-onboarding';
import { PendingRequestCard } from './pending-request-card';
import { InviteMemberDialog } from './invite-member-dialog';
import { EditFamilyDialog } from './edit-family-dialog';
import { MemberList } from './member-list';
import { MediaGallery } from './media-gallery';
import { CoverPhotoUploader } from './cover-photo-uploader';
import { FamilySettingsTab } from './family-settings-tab';
import { ActivityFeedTab } from './activity-feed-tab';

export default async function FamilyPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { family, myRole } = await getMyFamily();

  if (!family) {
    const pendingRequest = await getMyPendingJoinRequest();

    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        {pendingRequest ? <PendingRequestCard request={pendingRequest} /> : <FamilyOnboarding />}
      </div>
    );
  }

  const isAdmin = myRole === 'owner' || myRole === 'admin';
  const isOwner = myRole === 'owner';

  const [members, media, joinRequests, inviteLinks, activity] = await Promise.all([
    getFamilyMembers(family.id),
    getFamilyMedia(family.id),
    isAdmin ? getFamilyJoinRequests(family.id) : Promise.resolve([]),
    isAdmin ? getFamilyInviteLinks(family.id) : Promise.resolve([]),
    getFamilyActivityFeed(family.id, 20),
  ]);

  return (
    <div>
      <div
        className="relative mb-5 flex h-32 items-end justify-end overflow-hidden rounded-lg bg-dusk-gradient bg-cover bg-center p-3 sm:h-40"
        style={family.coverImageUrl ? { backgroundImage: `url(${family.coverImageUrl})` } : undefined}
      >
        {isAdmin && <CoverPhotoUploader familyId={family.id} />}
      </div>

      <PageHeader
        title={family.name}
        description={family.description ?? 'Your family at a glance.'}
        actions={
          <div className="flex items-center gap-2">
            {isAdmin && <EditFamilyDialog family={family} />}
            {isAdmin && <InviteMemberDialog familyId={family.id} />}
          </div>
        }
      />

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="photos">Photos & Files</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-4.5 w-4.5" /> Members
              </CardTitle>
              <CardDescription>
                {members.length} {members.length === 1 ? 'person' : 'people'} in this family
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MemberList members={members} currentUserId={user?.id ?? ''} isAdmin={isAdmin} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="h-4.5 w-4.5" /> Photos & Files
              </CardTitle>
              <CardDescription>Shared with everyone in {family.name}.</CardDescription>
            </CardHeader>
            <CardContent>
              <MediaGallery
                familyId={family.id}
                items={media}
                currentUserId={user?.id ?? ''}
                isAdmin={isAdmin}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-4.5 w-4.5" /> Activity
              </CardTitle>
              <CardDescription>Everything {family.name} has been up to.</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeedTab familyId={family.id} initialEntries={activity} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <FamilySettingsTab
            familyId={family.id}
            familyName={family.name}
            familyCode={family.familyCode}
            myRole={myRole}
            isAdmin={isAdmin}
            isOwner={isOwner}
            joinRequests={joinRequests}
            inviteLinks={inviteLinks}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
