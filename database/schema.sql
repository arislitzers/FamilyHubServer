-- ============================================================================
-- FamilyHub Database Schema (Foundation)
-- ----------------------------------------------------------------------------
-- This migration defines STRUCTURE ONLY for every table future modules will
-- need. No business logic, no triggers beyond updated_at bookkeeping, and
-- Row Level Security is enabled with owner-scoped placeholder policies that
-- future prompts will refine per-feature.
-- Run in the Supabase SQL editor, or via `supabase db push` / migrations.
-- ============================================================================

-- Extensions -------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Reusable trigger to keep updated_at current on every UPDATE ------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- USERS
-- Mirrors auth.users (Supabase manages the auth table itself). This table
-- holds the app-facing profile data joined 1:1 to an auth user.
-- ============================================================================
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_users_email on public.users (email);
create trigger trg_users_updated_at before update on public.users
  for each row execute function set_updated_at();

-- ============================================================================
-- FAMILIES
-- A family is the top-level container everything else hangs off of.
-- ============================================================================
create table if not exists public.families (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  cover_image_url text,
  created_by uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_families_created_by on public.families (created_by);
create trigger trg_families_updated_at before update on public.families
  for each row execute function set_updated_at();

-- ============================================================================
-- FAMILY_MEMBERS
-- Join table linking users to families, with a role for permissioning.
-- ============================================================================
create type family_role as enum ('owner', 'admin', 'member', 'child');

create table if not exists public.family_members (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role family_role not null default 'member',
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, user_id)
);
create index if not exists idx_family_members_family on public.family_members (family_id);
create index if not exists idx_family_members_user on public.family_members (user_id);
create trigger trg_family_members_updated_at before update on public.family_members
  for each row execute function set_updated_at();

-- ============================================================================
-- PROFILES
-- Extended per-family-member profile data (distinct from auth identity).
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  family_member_id uuid not null references public.family_members (id) on delete cascade,
  display_name text,
  birthday date,
  bio text,
  color_tag text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_member_id)
);
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function set_updated_at();

-- ============================================================================
-- PLANNER_EVENTS
-- Shared weekly/recurring planner entries for a family.
-- ============================================================================
create table if not exists public.planner_events (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references public.families (id) on delete cascade,
  created_by uuid not null references public.users (id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  is_recurring boolean not null default false,
  recurrence_rule text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_planner_events_family on public.planner_events (family_id);
create index if not exists idx_planner_events_starts_at on public.planner_events (starts_at);
create trigger trg_planner_events_updated_at before update on public.planner_events
  for each row execute function set_updated_at();

-- ============================================================================
-- REMINDERS
-- General-purpose reminders, scoped to a user or a family.
-- ============================================================================
create table if not exists public.reminders (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references public.families (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  notes text,
  remind_at timestamptz not null,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_reminders_user on public.reminders (user_id);
create index if not exists idx_reminders_remind_at on public.reminders (remind_at);
create trigger trg_reminders_updated_at before update on public.reminders
  for each row execute function set_updated_at();

-- ============================================================================
-- PRAYER_REMINDERS
-- Specialized reminder type for spiritual/prayer scheduling.
-- ============================================================================
create table if not exists public.prayer_reminders (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references public.families (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  label text not null,
  time_of_day time not null,
  days_of_week smallint[] not null default '{0,1,2,3,4,5,6}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_prayer_reminders_user on public.prayer_reminders (user_id);
create trigger trg_prayer_reminders_updated_at before update on public.prayer_reminders
  for each row execute function set_updated_at();

-- ============================================================================
-- CHECK_INS
-- Family check-in / wellbeing pings (e.g. "arrived safely", "feeling okay").
-- ============================================================================
create table if not exists public.check_ins (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  status text not null,
  note text,
  location_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_check_ins_family on public.check_ins (family_id);
create index if not exists idx_check_ins_user on public.check_ins (user_id);
create trigger trg_check_ins_updated_at before update on public.check_ins
  for each row execute function set_updated_at();

-- ============================================================================
-- CHATS
-- A chat can be a direct (2-person) or family-wide thread.
-- ============================================================================
create type chat_type as enum ('direct', 'family', 'group');

create table if not exists public.chats (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references public.families (id) on delete cascade,
  type chat_type not null default 'direct',
  name text,
  created_by uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_chats_family on public.chats (family_id);
create trigger trg_chats_updated_at before update on public.chats
  for each row execute function set_updated_at();

-- Join table: which users belong to which chat -----------------------------
create table if not exists public.chat_participants (
  id uuid primary key default uuid_generate_v4(),
  chat_id uuid not null references public.chats (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (chat_id, user_id)
);
create index if not exists idx_chat_participants_chat on public.chat_participants (chat_id);
create index if not exists idx_chat_participants_user on public.chat_participants (user_id);

-- ============================================================================
-- MESSAGES
-- Individual chat messages, supports realtime subscriptions.
-- ============================================================================
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  chat_id uuid not null references public.chats (id) on delete cascade,
  sender_id uuid not null references public.users (id) on delete cascade,
  content text,
  media_id uuid,
  is_edited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_messages_chat on public.messages (chat_id);
create index if not exists idx_messages_sender on public.messages (sender_id);
create index if not exists idx_messages_created_at on public.messages (created_at);
create trigger trg_messages_updated_at before update on public.messages
  for each row execute function set_updated_at();

-- ============================================================================
-- NOTIFICATIONS
-- System/user notifications feed.
-- ============================================================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users (id) on delete cascade,
  family_id uuid references public.families (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on public.notifications (user_id);
create index if not exists idx_notifications_is_read on public.notifications (is_read);
create trigger trg_notifications_updated_at before update on public.notifications
  for each row execute function set_updated_at();

-- ============================================================================
-- SETTINGS
-- Per-user application settings/preferences (theme, notification prefs, etc).
-- ============================================================================
create table if not exists public.settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users (id) on delete cascade,
  theme text not null default 'system',
  notification_preferences jsonb not null default '{}'::jsonb,
  language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
create trigger trg_settings_updated_at before update on public.settings
  for each row execute function set_updated_at();

-- ============================================================================
-- MEDIA
-- Metadata for files stored in Supabase Storage (photos, documents, etc).
-- ============================================================================
create table if not exists public.media (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references public.families (id) on delete cascade,
  uploaded_by uuid not null references public.users (id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_media_family on public.media (family_id);
create trigger trg_media_updated_at before update on public.media
  for each row execute function set_updated_at();

-- Add the deferred FK now that media exists ---------------------------------
alter table public.messages
  add constraint fk_messages_media foreign key (media_id) references public.media (id) on delete set null;

-- ============================================================================
-- ROW LEVEL SECURITY (placeholder policies)
-- Enabled everywhere; scoped to "owner can see/edit their own row" for now.
-- Family-shared visibility rules will be tightened per-feature in later
-- prompts (e.g. any family_member can read family-scoped rows).
-- ============================================================================
alter table public.users enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.profiles enable row level security;
alter table public.planner_events enable row level security;
alter table public.reminders enable row level security;
alter table public.prayer_reminders enable row level security;
alter table public.check_ins enable row level security;
alter table public.chats enable row level security;
alter table public.chat_participants enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.settings enable row level security;
alter table public.media enable row level security;

create policy "Users can view their own row" on public.users
  for select using (auth.uid() = id);
create policy "Users can update their own row" on public.users
  for update using (auth.uid() = id);

create policy "Users can view their own reminders" on public.reminders
  for select using (auth.uid() = user_id);
create policy "Users can manage their own reminders" on public.reminders
  for all using (auth.uid() = user_id);

create policy "Users can view their own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can view their own settings" on public.settings
  for select using (auth.uid() = user_id);
create policy "Users can manage their own settings" on public.settings
  for all using (auth.uid() = user_id);

-- NOTE: family_members / families / chats / messages / planner_events /
-- check_ins / profiles / media policies intentionally left minimal here —
-- each future feature prompt will add the precise "is a member of this
-- family" policies once that feature's access patterns are defined.
