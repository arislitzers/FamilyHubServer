export type ActivityActionType =
  | 'planner_event_created'
  | 'planner_event_updated'
  | 'reminder_shared'
  | 'reminder_completed'
  | 'prayer_request_created'
  | 'prayer_answered'
  | 'member_joined'
  | 'role_changed'
  | 'check_in_posted'
  | 'media_uploaded'
  | string;

export interface ActivityEntry {
  id: string;
  actorId: string;
  actorName: string | null;
  actorAvatar: string | null;
  actionType: ActivityActionType;
  objectType: string;
  objectId: string | null;
  summary: string;
  createdAt: string;
}
