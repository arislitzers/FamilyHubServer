'use client';

import { useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Pencil, Lock, Users as UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { updateProfileAction, updatePrivacySettingAction } from './actions';
import { TextareaWithEmoji } from '@/components/shared/textarea-with-emoji';
import {
  PRIVACY_FIELD_LABELS,
  RELATIONSHIP_OPTIONS,
  type FamilyProfileDetail,
  type ProfilePrivacySettings,
} from '@/types/family.types';

const COLOR_TAGS = [
  { value: 'hearth', label: 'Amber' },
  { value: 'sage', label: 'Sage' },
  { value: 'dusk', label: 'Dusk' },
];

const NOT_SET_VALUE = 'none';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save profile'}
    </Button>
  );
}

function PrivacyToggle({
  familyMemberId,
  field,
  value,
}: {
  familyMemberId: string;
  field: keyof ProfilePrivacySettings;
  value: 'family' | 'private';
}) {
  const [current, setCurrent] = useState(value);
  const [isPending, startTransition] = useTransition();
  const isPrivate = current === 'private';

  const toggle = () => {
    const next = isPrivate ? 'family' : 'private';
    setCurrent(next);
    startTransition(async () => {
      const result = await updatePrivacySettingAction(familyMemberId, field, next);
      if (result.error) setCurrent(isPrivate ? 'private' : 'family'); // revert on failure
    });
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b border-linen-200 py-2.5 last:border-0 dark:border-dusk-700">
      <div>
        <p className="text-sm text-dusk-700 dark:text-linen-100">{PRIVACY_FIELD_LABELS[field]}</p>
        <p className="text-xs text-dusk-400 dark:text-dusk-300">
          {isPrivate ? 'Only you and family admins can see this' : 'Visible to your whole family'}
        </p>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        aria-label={`Toggle ${PRIVACY_FIELD_LABELS[field]} privacy`}
        className={cn(
          'flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
          isPrivate
            ? 'border-dusk-300 bg-dusk-100 text-dusk-600 dark:border-dusk-500 dark:bg-dusk-700 dark:text-dusk-200'
            : 'border-sage-300 bg-sage-50 text-sage-600 dark:border-sage-500/40 dark:bg-sage-600/10 dark:text-sage-100'
        )}
      >
        {isPrivate ? <Lock className="h-3 w-3" /> : <UsersIcon className="h-3 w-3" />}
        {isPrivate ? 'Private' : 'Family'}
      </button>
    </div>
  );
}

export function EditProfileDialog({ profile }: { profile: FamilyProfileDetail }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(updateProfileAction, { error: null });
  const [relationship, setRelationship] = useState(profile.relationship ?? '');
  const [colorTag, setColorTag] = useState(profile.colorTag ?? 'hearth');
  const isCustomRelationship =
    relationship !== '' && !RELATIONSHIP_OPTIONS.includes(relationship as any);
  const relationshipSelectValue = relationship === '' || isCustomRelationship ? NOT_SET_VALUE : relationship;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Pencil className="h-3.5 w-3.5" /> Edit
      </Button>

      <Modal open={open} onOpenChange={setOpen} title="Edit your profile">
        <Tabs defaultValue="details" className="mt-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <form action={formAction} className="flex flex-col gap-4">
              <input type="hidden" name="familyMemberId" value={profile.familyMemberId} />

              {state.error && (
                <Alert variant="destructive">
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="displayName" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
                    Name
                  </label>
                  <input
                    id="displayName"
                    name="displayName"
                    defaultValue={profile.displayName ?? profile.fullName ?? ''}
                    placeholder={profile.fullName ?? 'Your name'}
                    className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nickname" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
                    Nickname
                  </label>
                  <input
                    id="nickname"
                    name="nickname"
                    defaultValue={profile.nickname ?? ''}
                    placeholder="What everyone calls you"
                    className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="relationship-trigger" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
                  Relationship
                </label>
                <Select
                  value={relationshipSelectValue}
                  onValueChange={(v) => setRelationship(v === NOT_SET_VALUE ? '' : v)}
                >
                  <SelectTrigger id="relationship-trigger">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NOT_SET_VALUE}>Not set</SelectItem>
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(isCustomRelationship || relationship === '') && (
                  <input
                    name="relationship"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    placeholder="Or type your own, e.g. Godmother"
                    className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
                  />
                )}
                {!isCustomRelationship && relationship !== '' && (
                  <input type="hidden" name="relationship" value={relationship} />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={profile.phone ?? ''}
                    placeholder="+1 555 123 4567"
                    className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="birthday" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
                    Birthday
                  </label>
                  <input
                    id="birthday"
                    name="birthday"
                    type="date"
                    defaultValue={profile.birthday ?? ''}
                    className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="contactEmail" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
                  Contact email <span className="text-dusk-300">(optional, separate from your login email)</span>
                </label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  defaultValue={profile.contactEmail ?? ''}
                  placeholder="A number or address someone should actually use to reach you"
                  className="h-10 rounded-md border border-linen-300 bg-white px-3 text-sm text-dusk-700 focus:border-hearth-400 dark:border-dusk-600 dark:bg-dusk-800 dark:text-linen-100"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="bio" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
                  Bio
                </label>
                <TextareaWithEmoji
                  id="bio"
                  name="bio"
                  rows={3}
                  defaultValue={profile.bio ?? ''}
                  placeholder="A little about you..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="colorTag-trigger" className="text-sm font-medium text-dusk-600 dark:text-linen-200">
                  Color tag
                </label>
                <Select value={colorTag} onValueChange={setColorTag}>
                  <SelectTrigger id="colorTag-trigger">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_TAGS.map((tag) => (
                      <SelectItem key={tag.value} value={tag.value}>
                        {tag.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="colorTag" value={colorTag} />
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <SubmitButton />
              </div>
            </form>
          </TabsContent>

          <TabsContent value="privacy">
            <p className="mb-3 text-xs text-dusk-400 dark:text-dusk-300">
              Changes here save immediately — no need to click Save.
            </p>
            <div className="rounded-md border border-linen-300 px-3 dark:border-dusk-600">
              <PrivacyToggle
                familyMemberId={profile.familyMemberId}
                field="phone"
                value={profile.privacySettings.phone}
              />
              <PrivacyToggle
                familyMemberId={profile.familyMemberId}
                field="birthday"
                value={profile.privacySettings.birthday}
              />
              <PrivacyToggle
                familyMemberId={profile.familyMemberId}
                field="contact_email"
                value={profile.privacySettings.contact_email}
              />
            </div>
          </TabsContent>
        </Tabs>
      </Modal>
    </>
  );
}
