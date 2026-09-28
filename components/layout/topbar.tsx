'use client';

import Link from 'next/link';
import { Bell, LogOut, Settings, UserCircle } from 'lucide-react';
import { SearchBar } from '@/components/ui/search-bar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { NotificationBadge } from '@/components/ui/notification-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useNotifications } from '@/contexts/notification-context';
import { ROUTES } from '@/constants/routes';
import { getInitials } from '@/lib/utils';

export function Topbar() {
  const { user, logOut } = useAuth();
  const { unreadCount } = useNotifications();

  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? 'Guest';

  return (
    <header className="flex h-16 items-center gap-4 border-b border-linen-300 bg-white/80 px-4 backdrop-blur-md dark:border-dusk-600 dark:bg-dusk-900/80 sm:px-6">
      <div className="max-w-sm flex-1">
        <SearchBar placeholder="Search FamilyHub..." />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        <Button variant="ghost" size="icon" asChild className="relative" aria-label="Notifications">
          <Link href={ROUTES.notifications}>
            <Bell className="h-4 w-4" />
            <NotificationBadge count={unreadCount} />
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus:outline-none">
              <Avatar>
                <AvatarImage src={user?.user_metadata?.avatar_url as string | undefined} alt={displayName} />
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={ROUTES.profiles} className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={ROUTES.settings} className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logOut()} className="flex items-center gap-2 text-red-600">
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
