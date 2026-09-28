import {
  Bell,
  MessageCircle,
  Users,
  ShieldCheck,
  CalendarDays,
  HeartHandshake,
  BellRing,
  UserPlus,
  Image as ImageIcon,
  HandHeart,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import type { NotificationType } from '@/types/notifications.types';

const TYPE_ICON: Record<string, LucideIcon> = {
  message: MessageCircle,
  family_member_added: Users,
  role_changed: ShieldCheck,
  planner_event: CalendarDays,
  check_in: HeartHandshake,
  reminder_shared: BellRing,
  join_request: UserPlus,
  media_uploaded: ImageIcon,
  prayer_request: HandHeart,
  prayer_answered: CheckCircle2,
};

export function getNotificationIcon(type: NotificationType): LucideIcon {
  return TYPE_ICON[type] ?? Bell;
}

export function NotificationTypeIcon({
  type,
  className,
}: {
  type: NotificationType;
  className?: string;
}) {
  const Icon = getNotificationIcon(type);
  return <Icon className={className} />;
}
