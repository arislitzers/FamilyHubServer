import {
  Activity,
  CalendarPlus,
  CalendarClock,
  BellRing,
  CheckSquare,
  HandHeart,
  CheckCircle2,
  UserPlus,
  ShieldCheck,
  HeartHandshake,
  Image as ImageIcon,
  type LucideIcon,
} from 'lucide-react';
import type { ActivityActionType } from '@/types/activity.types';

const ACTION_ICON: Record<string, LucideIcon> = {
  planner_event_created: CalendarPlus,
  planner_event_updated: CalendarClock,
  reminder_shared: BellRing,
  reminder_completed: CheckSquare,
  prayer_request_created: HandHeart,
  prayer_answered: CheckCircle2,
  member_joined: UserPlus,
  role_changed: ShieldCheck,
  check_in_posted: HeartHandshake,
  media_uploaded: ImageIcon,
};

export function getActivityIcon(actionType: ActivityActionType): LucideIcon {
  return ACTION_ICON[actionType] ?? Activity;
}

export function ActivityTypeIcon({
  actionType,
  className,
}: {
  actionType: ActivityActionType;
  className?: string;
}) {
  const Icon = getActivityIcon(actionType);
  return <Icon className={className} />;
}
