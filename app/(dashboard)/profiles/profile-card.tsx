import { Cake, Phone, Mail, Users2, Lock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getInitials, formatDate } from '@/lib/utils';
import { EditProfileDialog } from './edit-profile-dialog';
import { AvatarUploader } from './avatar-uploader';
import type { FamilyProfileDetail } from '@/types/family.types';

const COLOR_TAG_CLASSES: Record<string, string> = {
  hearth: 'bg-hearth-400',
  sage: 'bg-sage-400',
  dusk: 'bg-dusk-400',
};

/**
 * A private-marked field that's still visible to this viewer (because
 * they're the owner or a family admin) gets a small lock icon so it's
 * clear the info isn't broadly visible — everyone else simply never
 * receives the value at all (nulled server-side), so there's nothing to
 * mark for them.
 */
function PrivacyHint({ isPrivate, canSeeOthersPrivate }: { isPrivate: boolean; canSeeOthersPrivate: boolean }) {
  if (!isPrivate || !canSeeOthersPrivate) return null;
  return <Lock className="h-3 w-3 text-dusk-300 dark:text-dusk-500" aria-label="Private" />;
}

export function ProfileCard({
  profile,
  isAdmin,
}: {
  profile: FamilyProfileDetail;
  isAdmin: boolean;
}) {
  const displayName = profile.displayName || profile.fullName || profile.accountEmail;
  const colorClass = COLOR_TAG_CLASSES[profile.colorTag ?? 'hearth'] ?? COLOR_TAG_CLASSES.hearth;
  // Viewing someone else's private field only happens if you're an admin
  // (owners/admins can see everything); viewing your own is never "private
  // from you", so the lock hint is admin-viewing-others only.
  const canSeeOthersPrivate = isAdmin && !profile.isSelf;

  return (
    <Card className="overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lifted">
      <div className={`h-2 w-full ${colorClass}`} />
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <div className="relative">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatarUrl ?? undefined} alt={displayName} />
            <AvatarFallback className="text-lg">{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          {profile.isSelf && <AvatarUploader />}
        </div>

        <div>
          <p className="font-display text-lg text-dusk-700 dark:text-linen-100">
            {displayName}
            {profile.nickname && (
              <span className="ml-1.5 font-sans text-sm text-dusk-400 dark:text-dusk-300">
                &ldquo;{profile.nickname}&rdquo;
              </span>
            )}
          </p>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <Badge variant="outline" className="capitalize">
              {profile.role}
            </Badge>
            {profile.relationship && (
              <Badge variant="secondary" className="gap-1">
                <Users2 className="h-3 w-3" /> {profile.relationship}
              </Badge>
            )}
          </div>
        </div>

        {profile.bio && <p className="text-sm text-dusk-400 dark:text-dusk-200">{profile.bio}</p>}

        <div className="flex flex-col items-center gap-1 text-xs text-dusk-300 dark:text-dusk-400">
          {profile.birthday && (
            <p className="flex items-center gap-1.5">
              <Cake className="h-3.5 w-3.5" />
              {formatDate(profile.birthday, { month: 'long', day: 'numeric', year: undefined })}
              <PrivacyHint
                isPrivate={profile.privacySettings.birthday === 'private'}
                canSeeOthersPrivate={canSeeOthersPrivate}
              />
            </p>
          )}
          {profile.phone && (
            <p className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {profile.phone}
              <PrivacyHint
                isPrivate={profile.privacySettings.phone === 'private'}
                canSeeOthersPrivate={canSeeOthersPrivate}
              />
            </p>
          )}
          {profile.contactEmail && (
            <p className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {profile.contactEmail}
              <PrivacyHint
                isPrivate={profile.privacySettings.contact_email === 'private'}
                canSeeOthersPrivate={canSeeOthersPrivate}
              />
            </p>
          )}
        </div>

        {profile.isSelf && <EditProfileDialog profile={profile} />}
      </CardContent>
    </Card>
  );
}
