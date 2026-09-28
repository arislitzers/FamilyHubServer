export const SITE = {
  name: 'FamilyHub',
  tagline: 'Bringing Families Together.',
  description:
    'FamilyHub is the all-in-one digital home for your family — profiles, planning, reminders, and real-time chat, in one calm, trustworthy place.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
} as const;

/** Placeholder feature cards for the landing page features section. */
export const FEATURES_PREVIEW = [
  {
    title: 'Family Profiles',
    description: 'A shared home for everyone in the family, each with their own space.',
    icon: 'UserCircle',
  },
  {
    title: 'Weekly Planner',
    description: 'See what everyone is doing this week, in one shared calendar.',
    icon: 'CalendarDays',
  },
  {
    title: 'Reminders',
    description: "Gentle nudges for the things that matter — never miss what's important.",
    icon: 'BellRing',
  },
  {
    title: 'Family Chat',
    description: 'A private space to talk, share, and stay close — wherever everyone is.',
    icon: 'MessageCircle',
  },
] as const;

/** Placeholder testimonials — replace with real quotes before launch. */
export const TESTIMONIALS_PLACEHOLDER = [
  {
    quote: 'Placeholder testimonial — how this family stays connected with FamilyHub.',
    name: 'Family Placeholder',
    role: 'Early Access User',
  },
  {
    quote: 'Placeholder testimonial — the moment FamilyHub became part of the routine.',
    name: 'Family Placeholder',
    role: 'Early Access User',
  },
  {
    quote: 'Placeholder testimonial — a small detail that made a big difference.',
    name: 'Family Placeholder',
    role: 'Early Access User',
  },
] as const;
