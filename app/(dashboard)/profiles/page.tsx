import { UserCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getMyFamily, getFamilyProfiles } from '@/services/families.service';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ProfileCard } from './profile-card';

export default async function ProfilesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { family, myRole } = await getMyFamily();

  if (!family) {
    return (
      <div>
        <PageHeader title="Profiles" description="Everyone's personal space within the family." />
        <EmptyState
          icon={<UserCircle className="h-8 w-8" />}
          title="Set up your family first"
          description="Profiles appear here once your family exists — head to the Family page to create one."
        />
      </div>
    );
  }

  const profiles = await getFamilyProfiles(family.id);
  const isAdmin = myRole === 'owner' || myRole === 'admin';

  return (
    <div>
      <PageHeader
        title="Profiles"
        description={`Everyone in ${family.name}, in one place.`}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <ProfileCard key={profile.familyMemberId} profile={profile} isAdmin={isAdmin} />
        ))}
      </div>
    </div>
  );
}
