'use server';

import { getFamilyActivityFeed } from '@/services/activity.service';

export async function loadMoreActivityAction(familyId: string, before: string) {
  return getFamilyActivityFeed(familyId, 20, before);
}
