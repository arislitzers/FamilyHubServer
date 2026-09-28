export type FamilyRole = 'owner' | 'admin' | 'member' | 'child';

export interface FamilySummary {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  createdBy: string;
  familyCode: string;
}

export interface FamilyMemberWithProfile {
  id: string; // family_members.id
  userId: string;
  role: FamilyRole;
  joinedAt: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  profile: {
    id: string;
    displayName: string | null;
    birthday: string | null;
    bio: string | null;
    colorTag: string | null;
  } | null;
}

export interface UpdateProfileInput {
  displayName?: string;
  birthday?: string | null;
  bio?: string;
  colorTag?: string;
}

export interface PendingJoinRequest {
  requestId: string;
  familyName: string;
  requestedAt: string;
}

export interface FamilyJoinRequest {
  requestId: string;
  userId: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  requestedAt: string;
}

export interface FamilyInviteLink {
  id: string;
  familyId: string;
  token: string;
  role: FamilyRole;
  createdBy: string;
  maxUses: number | null;
  useCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export const ROLE_PERMISSIONS: Record<FamilyRole, string[]> = {
  owner: [
    'Everything admins can do',
    'Transfer or delete the family',
    'Cannot be removed or demoted while the only owner',
  ],
  admin: [
    'Invite and remove members',
    'Approve or deny join requests',
    'Create and revoke invite links',
    'Edit family details and cover photo',
    'Change member roles (except demoting the last owner)',
  ],
  member: [
    'View and edit their own profile',
    'Add planner events, reminders, and check-ins',
    'Chat with the family',
    'Upload and manage their own photos/files',
  ],
  child: [
    'Same as Member in this version',
    'A dedicated reduced permission set is a natural next refinement',
  ],
};

export type FieldPrivacy = 'family' | 'private';

export interface ProfilePrivacySettings {
  phone: FieldPrivacy;
  birthday: FieldPrivacy;
  contact_email: FieldPrivacy;
}

export const PRIVACY_FIELD_LABELS: Record<keyof ProfilePrivacySettings, string> = {
  phone: 'Phone number',
  birthday: 'Birthday',
  contact_email: 'Contact email',
};

/** Full profile detail as returned by the privacy-aware get_family_profiles RPC. */
export interface FamilyProfileDetail {
  familyMemberId: string;
  userId: string;
  role: FamilyRole;
  joinedAt: string;
  fullName: string | null;
  accountEmail: string;
  avatarUrl: string | null;
  displayName: string | null;
  nickname: string | null;
  relationship: string | null;
  bio: string | null;
  colorTag: string | null;
  birthday: string | null; // nulled out server-side if private and viewer isn't owner/admin
  phone: string | null;
  contactEmail: string | null;
  privacySettings: ProfilePrivacySettings;
  isSelf: boolean;
}

export const RELATIONSHIP_OPTIONS = [
  'Mother',
  'Father',
  'Parent',
  'Spouse',
  'Partner',
  'Son',
  'Daughter',
  'Child',
  'Brother',
  'Sister',
  'Sibling',
  'Grandmother',
  'Grandfather',
  'Grandchild',
  'Aunt',
  'Uncle',
  'Cousin',
  'Guardian',
  'Other',
] as const;
