/**
 * Central route registry. Import these instead of hardcoding path
 * strings so future modules never drift out of sync with navigation,
 * middleware, or redirects.
 */
export const ROUTES = {
  // Marketing
  home: '/',

  // Auth
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',

  // App (protected)
  dashboard: '/dashboard',
  family: '/family',
  profiles: '/profiles',
  planner: '/planner',
  reminders: '/reminders',
  prayer: '/prayer',
  chat: '/chat',
  notifications: '/notifications',
  settings: '/settings',
  help: '/help',
} as const;

/** Routes that require an authenticated session. */
export const PROTECTED_ROUTES = [
  ROUTES.dashboard,
  ROUTES.family,
  ROUTES.profiles,
  ROUTES.planner,
  ROUTES.reminders,
  ROUTES.prayer,
  ROUTES.chat,
  ROUTES.notifications,
  ROUTES.settings,
  ROUTES.help,
];

/** Auth routes a logged-in user shouldn't see again (redirect to dashboard). */
export const AUTH_ROUTES = [
  ROUTES.login,
  ROUTES.register,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
];

/** Primary sidebar / mobile nav items for the dashboard shell. */
export const NAV_ITEMS = [
  { label: 'Dashboard', href: ROUTES.dashboard, icon: 'LayoutDashboard' },
  { label: 'Family', href: ROUTES.family, icon: 'Users' },
  { label: 'Profiles', href: ROUTES.profiles, icon: 'UserCircle' },
  { label: 'Planner', href: ROUTES.planner, icon: 'CalendarDays' },
  { label: 'Reminders', href: ROUTES.reminders, icon: 'BellRing' },
  { label: 'Prayer', href: ROUTES.prayer, icon: 'Sparkles' },
  { label: 'Chat', href: ROUTES.chat, icon: 'MessageCircle' },
  { label: 'Notifications', href: ROUTES.notifications, icon: 'Bell' },
  { label: 'Settings', href: ROUTES.settings, icon: 'Settings' },
  { label: 'Help', href: ROUTES.help, icon: 'HelpCircle' },
] as const;
