# FamilyHub

A full-stack family coordination app: a Next.js/Supabase foundation
(architecture, design system, navigation, authentication, database schema)
plus all eight feature modules — Family & Profiles, Planner, Reminders /
Prayer Reminders / Check-Ins, Chat, Notifications, Settings, and Media —
built on top of it. Every module from the original plan is implemented.

## Stack

- **Next.js 14** (App Router) + **TypeScript** (strict)
- **Tailwind CSS** + custom design tokens + **shadcn/ui**-style components (Radix primitives)
- **Framer Motion** for animation
- **Supabase** — Auth, Postgres, Storage, Realtime
- Deploys to **Vercel**

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase project values
npm run dev
```

Open http://localhost:3000.

### Setting up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the Project URL, anon key, and service role key into `.env.local`.
3. Open the SQL editor in your Supabase dashboard and run, in order:
   1. `database/schema.sql` — every table, index, and baseline RLS policy.
   2. `database/002_family_and_profiles.sql` — real RLS policies plus the
      `create_family` / `add_family_member_by_email` /
      `update_family_member_role` / `remove_family_member` RPC functions
      the Family & Profiles module calls.
   3. `database/003_planner.sql` — RLS policies for `planner_events`
      (any family member can view/add; only the creator or a family
      admin can edit/delete).
   4. `database/004_reminders.sql` — RLS policies for `reminders`
      (family-sharing extension), `prayer_reminders` (owner-only), and
      `check_ins` (family-shared feed).
   5. `database/005_chat.sql` — RLS for `chats`/`chat_participants`/
      `messages`, the `get_or_create_family_chat` /
      `get_or_create_direct_chat` / `get_my_chat_threads` RPCs, and adds
      `messages` to the `supabase_realtime` publication (required for
      the live message subscription to fire).
   6. `database/006_notifications.sql` — update/delete RLS for
      `notifications`, adds it to the Realtime publication, and installs
      the triggers that actually generate notifications (new message,
      joining a family, a role change, a new planner event).
   7. `database/007_settings.sql` — **important, don't skip this one even
      if you only care about Settings**: it adds the trigger that creates
      a `public.users` row (and a default `public.settings` row) the
      moment someone signs up. Nothing earlier in this schema did that —
      see the "A bug this module fixed" note below. It also updates the
      four notification triggers from `006` to respect each user's
      per-type preferences.
   8. `database/008_media.sql` — creates the two Storage buckets FamilyHub
      uses (`public-media` for avatars/cover photos, `family-files` for
      the private family gallery) and every RLS policy for both the
      buckets and the `media` table. Storage buckets are created via plain
      SQL here (`insert into storage.buckets ...`), so no manual dashboard
      step is needed beyond running this file.
   9. `database/009_family_management_advanced.sql` — adds `family_code` to
      every family, join-by-code with admin approval, shareable invite
      links, and leave/delete family. Redefines `create_family` from
      migration 2 to also generate a code (existing families get one
      backfilled automatically when this runs).
   10. `database/010_user_profiles_advanced.sql` — adds nickname,
       relationship, phone, and a separate contact email to `profiles`,
       plus per-field privacy (family-visible vs. private) enforced by a
       new `get_family_profiles` RPC rather than raw table RLS.
   11. `database/011_planner_advanced.sql` — adds category, color,
       family-visible/privacy toggles to `planner_events`, and replaces
       the plain event select with a `get_family_planner_events` RPC that
       actually expands recurring events into real occurrences across a
       date range (they used to only ever show on their original creation
       date) and masks private events to "Busy" for non-creators.
   12. `database/012_notifications_advanced.sql` — four more
       notification-generating triggers (check-ins, shared reminders,
       join requests to admins, new media) so the category filter on
       `/notifications` has real variety instead of just the original
       four types.
   13. `database/013_private_groups.sql` — turns the `group` chat type
       (defined in the original schema but never built) into a real
       feature: any member can create a private group chat with a
       subset of the family, with its own admin/member roles.
   14. `database/014_prayer_center.sql` — prayer requests (family-wide or
       scoped to a private group), the "praying for this" commitment,
       marking prayers answered, a personal/shareable prayer journal, and
       makes prayer reminders shareable with the family (previously
       personal-only).
   15. `database/015_family_activity_feed.sql` — a real `activity_log`
       table and ten triggers across planner, reminders, prayer, family
       membership, check-ins, and media, plus a paginated
       `get_family_activity_feed` RPC. Replaces the ad-hoc 3-table query
       the Dashboard's activity card used to run.
   16. `database/016_chat_attachments.sql` — a `chat-files` Storage
       bucket scoped by chat participation (not family membership — a
       private group needs its own scope, see the Private Groups section)
       and four new columns on `messages` for attachments.
   17. `database/017_settings_advanced.sql` — adds `color_theme` to
       `settings` for the theme package picker. Two-factor authentication
       needs no migration at all — it's built entirely on Supabase Auth's
       native `auth.mfa.*` API, which every Supabase project already has.
4. Enable **Email** auth under Authentication → Providers (on by default).
5. Under Authentication → URL Configuration, set your Site URL and add
   `http://localhost:3000/auth/callback` as a redirect URL (and your
   production URL once deployed).

## Project structure

```
app/
  (marketing)/        Landing page — public
  (auth)/              Login, register, forgot/reset password, verify email
  (dashboard)/         Protected app shell + one placeholder page per module
  auth/callback/       Supabase auth code-exchange route handler
  unauthorized/        Shown when a protected page is hit without a session
  layout.tsx           Root layout — fonts, metadata, providers
  icon.tsx             Generated favicon
  error.tsx / not-found.tsx / loading.tsx   Global fallback UI

components/
  ui/                  Reusable primitives (Button, Card, Modal, Toast, ...)
  layout/              Navbar, Sidebar, Topbar, MobileNav, layout shells
  shared/              Cross-cutting pieces (EmptyState, PageHeader, Logo, ...)

contexts/              One provider per domain (auth + theme are wired up;
                       family/planner/chat/notifications/settings are typed
                       placeholders future prompts will fill in)
hooks/                 useMediaQuery, useDebounce, useLocalStorage, ...
lib/supabase/          Browser / server / middleware Supabase clients
services/              Data-access layer pattern (one example: users.service.ts)
types/                 Database, auth, and UI types
constants/             Routes and site-wide copy
database/schema.sql    Full schema for every current + future table
styles/globals.css     Design tokens as CSS variables + base styles
```

## Design system

"Dusk & Hearth" — a soft indigo dusk palette paired with a warm porch-light
amber accent. Tokens live in `tailwind.config.ts` (Tailwind-facing) and
`styles/globals.css` (CSS variables). Both light and dark themes are
implemented and persisted (`contexts/theme-context.tsx`).

## What's implemented vs. placeholder

**Implemented:** the full foundation (routing, navigation, landing page,
auth, theme, layout system, design system, database schema, every reusable
UI component) plus all eight feature modules: **Family & Profiles**,
**Planner**, **Reminders / Prayer Reminders / Check-Ins**, **Chat**,
**Notifications**, **Settings**, and **Media**. Every module from the
original plan is now built — see each module's section below for what's
real vs. a known, documented simplification.

## Family & Profiles module

- **Create a family** — first-time users see a create-family form
  (`app/(dashboard)/family/create-family-form.tsx`); submitting calls the
  `create_family` RPC, which creates the family, makes the caller its
  `owner`, and seeds a blank profile row atomically.
- **Member roster** — `/family` lists every member with their role, joined
  from `users` + `profiles`. Admins (`owner`/`admin` roles) get an
  "Add member" dialog (looks up an existing FamilyHub account by email —
  it won't silently invite an email with no account) and a per-member menu
  to change roles or remove someone. Removing/demoting the last `owner` is
  blocked at the database layer.
- **Edit family details** — admins can rename the family or update its
  description via a dialog backed by a Server Action.
- **Profiles** — `/profiles` shows a card per family member (display name,
  bio, birthday, a color tag). Each person can edit only their own card;
  RLS enforces this even if the UI were bypassed.
- All mutations are **Server Actions** (`app/(dashboard)/family/actions.ts`,
  `app/(dashboard)/profiles/actions.ts`) calling either a Postgres RPC
  function (multi-table writes) or a direct table update (single-table),
  so there's no separate API route layer to maintain.
- Known simplification: a user belongs to **one family** in this iteration
  (the schema already supports more — `getMyFamily()` in
  `services/families.service.ts` just takes the first membership row). A
  family switcher can be added later without a schema change.

## Advanced Family Management

Built on top of the original Family & Profiles module — same tables,
extended with three new ones (`family_join_requests`,
`family_invite_links`) plus a `family_code` column on `families`.

- **Two ways to join, deliberately different trust levels:**
  - **Family code** — every family gets a short code (e.g. `7F3K9QRT`,
    shown and copyable on the new Settings tab of the Family page).
    Anyone who enters it *requests* to join — an admin has to approve or
    deny it from a queue on that same tab. Good for "I know roughly who
    might use this code" scenarios where you still want a checkpoint.
  - **Invite links** — `family-settings → Invite links → New invite link`
    generates a URL like `/join/<token>`. Whoever opens it joins
    *instantly*, no approval — because an admin explicitly generated and
    shared that specific link. Links can have a max-use count and/or an
    expiry, and can be revoked any time; the role granted (member/admin/
    child — not owner) is chosen at creation. The `/join/[token]` page
    itself works for signed-out visitors too: it previews which family
    they're being invited to and prompts them to log in or sign up first,
    landing them back on the same invite afterward.
- **Onboarding now branches** — anyone without a family sees tabs to
  either create one or join one by code, instead of only the create form.
  Someone with a pending code request sees a "waiting for approval" state
  instead, so they're not stuck staring at the same form.
- **Leave family** — available to any member from the Settings tab, with
  a confirmation dialog. Blocked for a sole owner (the database, not just
  the UI, enforces this) with a message pointing them to promote another
  owner first.
- **Delete family** — owner-only, requires typing the family's exact name
  to confirm, and cascades through every table scoped to that family
  (members, profiles, planner events, reminders, chats, messages, media —
  all of it, permanently).
- **Permissions reference** — a plain-language card on the Settings tab
  listing what Owner/Admin/Member/Child can each do. `child` is currently
  functionally identical to `member`; a genuinely reduced permission set
  for that role (e.g. read-only chat, no invite/remove rights) is flagged
  as a clear next step rather than silently implied by the role existing.

## Advanced User Profiles

Extends the original Profiles module with the rest of the requested
fields, plus real per-field privacy — not just a UI toggle, but something
the database itself enforces.

- **New fields**: nickname, relationship (a preset dropdown — Mother,
  Father, Sibling, Grandparent, etc. — with a free-text "Other" option so
  it's never a dead end), phone, and a **contact email distinct from your
  login email** (the login email that authenticates you stays account-only
  and is never shown to other family members; the contact email is
  something you explicitly choose to share, and only if you want to).
- **Privacy is enforced server-side, not just hidden in the UI.** RLS
  can't selectively hide individual columns on a row everyone can
  otherwise read, so field-level privacy for phone/birthday/contact-email
  is handled by a new `get_family_profiles` RPC (see
  `database/010_user_profiles_advanced.sql`): it nulls out any field
  its owner marked "Private" before the row ever leaves the database,
  unless the viewer is that person or a family admin. A member trying to
  read someone else's private phone number directly would get null back
  regardless of what the client code does — there's no client-side check
  to bypass.
- **Two visibility levels, chosen per field**: "Family" (default — anyone
  in the family sees it) or "Private" (only you and family admins). Toggle
  each independently from the profile edit dialog's Privacy tab; changes
  save instantly, no separate "Save" click needed.
- On someone else's profile card, a field that's set to Private simply
  doesn't render at all (indistinguishable from "not filled in") — that's
  privacy working as intended. On your own card, or as an admin looking at
  someone else's, a small lock icon marks fields you're seeing *because*
  of that elevated access, so it's clear the info isn't broadly visible.
- Known simplification: only phone, birthday, and contact email are
  privacy-controlled (name, nickname, relationship, bio, and the avatar
  are always visible to the family — they're not sensitive in the same
  way). A "hide my profile entirely" option is a reasonable future
  addition but wasn't requested here.

## Advanced Weekly Planner

The original Planner module had one weekly grid and a "repeat" field that
was really just a label — this pass makes every piece of that real, plus
adds the two other views.

- **Three views, one shared data model** — Week (the original grid, now
  with drag-and-drop), **Day** (an hour-by-hour grid, 12 AM–11 PM, with
  overlapping events laid out side-by-side rather than stacked on top of
  each other), and **Month** (a full 6-week calendar grid with color-coded
  event pills; click any day to jump into its Day view). A tab switcher at
  the top moves between them, and the current view + date live in the URL
  (`?view=week&week=...`, `?view=day&date=...`, `?view=month&date=...`) so
  any specific view is linkable and survives a refresh.
- **Recurring events are now real**, not just a label. A "weekly" event
  created once now actually appears every week going forward —
  `get_family_planner_events` (in `database/011_planner_advanced.sql`)
  walks forward from the event's original start date and expands
  daily/weekly/monthly occurrences across whatever range the current view
  is showing, entirely server-side. Editing a recurring event edits the
  whole series (its template); editing a single occurrence without
  detaching it from the series is flagged as a reasonable next step, not
  built here.
- **Categories & color coding** — 8 presets (Family, Work, School, Health,
  Birthday, Holiday, Personal, Other), each with a default color, plus a
  small swatch picker to override the color per event independently of
  its category. Both render throughout all three views.
- **Drag & drop** — built with the native HTML5 drag-and-drop API (no
  extra dependency): drag an event chip to a different day in Week or
  Month view, or a different hour in Day view, and it reschedules,
  keeping its original duration. Dragging a recurring event moves its
  template occurrence (shifting the whole series' anchor date), the same
  scope boundary as editing one.
- **Family Visible toggle** — off means the event is purely personal and
  never appears to anyone but its creator, not even as a time-blocked
  placeholder. This is enforced by RLS on the base table, not just hidden
  in a query: a non-family-visible event's row is only ever returned to
  its creator, full stop.
- **Public/Private toggle** — only relevant when Family Visible is on.
  Public means the rest of the family sees full details; Private means
  everyone else sees a generic "Busy" block at the right time (so they
  still know you're occupied) with the title and notes masked — enforced
  the same way as private profile fields: inside the RPC, before the data
  ever leaves the database, not as a client-side check that could be
  bypassed.

## Advanced Notification Center

The badge, history, mark-as-read, and delete were already real from the
original Notifications module — this pass is specifically about making
**categories** mean something, since four trigger types didn't give the
filter much to actually filter.

- **Four more notification types**, each its own trigger in
  `database/012_notifications_advanced.sql`: a **check-in** posted, a
  **reminder shared** with the family, someone submitting a **join
  request** (notifies admins specifically — previously the only way to
  learn about a pending request was to happen to open Family → Settings),
  and a new **photo or file** added to the gallery. All four respect
  per-user preferences the same way the original four did.
- **Category filter pills** on `/notifications` — All, Messages, Family,
  Planner, Reminders, Media (grouped via `NOTIFICATION_CATEGORIES` in
  `types/notifications.types.ts` — a type nobody's grouped yet falls into
  an implicit "Other" rather than silently vanishing from the list), plus
  an "Unread only" toggle that composes with whichever category is
  selected.
- **Delete read** — a bulk action next to "Mark all read," since "Delete"
  was asked for as a first-class feature, not just a per-item X button.
- The icon-per-type mapping used to live separately in the dashboard's
  Recent Notifications card and the full feed, which meant they could
  quietly drift apart as types were added. Both now import the same
  `NotificationTypeIcon` from `components/shared/notification-icon.tsx`.
- Settings → Notifications gained four more toggles to match (check-ins,
  shared reminders, join requests, new media) — that tab already iterated
  generically over whatever's in `NOTIFICATION_TYPE_LABELS`, so no
  structural change was needed there, just filling in the new entries.

## Private Groups

Reuses infrastructure that already existed rather than inventing a
parallel one: `chats.type = 'group'` was defined in the very first schema
migration but never built. Creating a "private group" now really is
creating a group chat with a specific subset of the family as its
participants.

- **Anyone can create a group** from Chat → "New group" — name it, pick
  which family members to include. The creator becomes the group's admin
  automatically.
- **Genuinely private**: `get_my_chat_threads()` only ever returns chats
  you participate in, for any chat type — a family owner or admin gets no
  automatic visibility into a group they weren't added to. That's not a
  UI choice, it's what the RLS on `chat_participants` actually enforces.
- **Group admin controls** (a "Manage group" gear icon in the chat header
  for group threads): add or remove members, promote another member to
  admin, rename the group, or delete it outright. A group can't be left
  without an admin — removing or promoting is blocked if it would leave
  zero admins, the same pattern used for family ownership.
- Any member can leave a group themselves at any time (blocked only if
  they're the sole remaining admin, same reasoning).
- Known simplification: groups are chat-only for now — no group-scoped
  planner events or reminders. Prayer Requests (see below) are the one
  place a private group is used for something beyond messaging.

## Prayer Center

Described as one of the most distinctive parts of the app, so it got a
dedicated top-level page (`/prayer`) rather than being buried as another
Reminders tab. Prayer Reminders moved here from the Reminders module
entirely — the Reminders page now links over to this one instead of
duplicating that UI.

- **Prayer Requests** — post what's on your mind, with a category (Health,
  Family, Guidance, Thanksgiving, General, Other) and a visibility scope:
  the whole family, or a specific private group (see above). Sharing with
  a group means only that group's members ever see it, not the whole
  family — enforced by `can_view_prayer_request()`, a single function
  every relevant policy and RPC calls so the visibility rule can't drift
  between the request list, the "who's praying" list, and notifications.
- **"Praying for this"** — a lightweight commitment, not just a like: tap
  to add yourself to the list of people praying for a request, with a
  running count everyone can see. Un-tap to remove yourself.
- **Answered Prayers** — mark a request answered (creator or a family
  admin), optionally with a note on how it was answered. Everyone who
  committed to pray for it gets notified. Answered requests move to their
  own tab — a running record of what the family has seen come through,
  separate from what's still active. Marking answered is reversible.
- **Prayer Reminders** — the same recurring reminders from before, now
  optionally shareable with the family (mirroring how personal Reminders
  already worked) — your reminders and ones your family has shared both
  show up here.
- **Prayer Journal** — a personal space for writing freely, private by
  default. Each entry can optionally be shared with the family; shared
  entries from others show up in their own section, clearly marked, never
  mixed into your own private list.
- **Prayer Calendar** — a read-only month grid marking which days have a
  scheduled prayer reminder, a request that was shared, or a prayer that
  was answered (hover a day for specifics). Deliberately simpler than the
  Planner's month view — no drag-and-drop or event creation here, just an
  at-a-glance view of prayer activity across the month.
- Known simplification: no cross-linking yet between a prayer request and
  a specific planner event or reminder (e.g. "pray for this at 7am daily
  until answered") — each lives in its own space for now.

## Chat & Group Attachments

Documents, images, and videos can now be shared in any chat — the family
thread, a direct message, or a private group.

- **A dedicated Storage bucket, not the Media module's.** `chat-files` is
  scoped by `is_chat_participant()`, not `is_family_member()` — reusing
  the Media module's `family-files` bucket would have let any family
  member read a file shared inside a private group they aren't part of,
  since that bucket's policy only checks family membership. Attachments
  live at `{chat_id}/{uuid}-{filename}`, matched to the same access rule
  that already governs the messages themselves.
- **Inline previews** — images render directly in the bubble, videos get
  a native player with controls, everything else (PDFs, docs, anything)
  shows as a file chip with name, size, and a download link.
- **Signed URLs, resolved client-side.** The bucket is private, so every
  attachment URL is a short-lived signed URL. Messages arriving live via
  Realtime only carry the raw storage path — `MessageThread` resolves the
  signed URL itself the moment a new attachment arrives, the same pattern
  the Media module uses server-side, just running in the browser since
  chat is already fully client-driven.
- 25 MB per file, one attachment per message, no separate caption field —
  the message's own text field doubles as a caption when both are sent
  together.

## Emoji Picker (Android/Google style)

- **One reusable component** (`EmojiPickerButton`, plus `TextareaWithEmoji`
  / `InputWithEmoji` wrappers for form fields) rather than a chat-specific
  bespoke widget — a curated set of ~250 emoji across 8 categories, no new
  npm dependency or emoji-data package required.
- **Genuinely Android-style, not just an SVG set that looks similar.**
  `app/layout.tsx` loads Google's real Noto Color Emoji web font, and
  `styles/globals.css` adds it as a fallback at the point every font
  stack is actually consumed (rather than in the CSS variable itself,
  which next/font would otherwise override). The practical effect: any
  emoji character — picked from this component, typed on a native
  keyboard, or pasted from elsewhere — renders in Google's style
  everywhere in the app, on every OS, not just the ones inserted through
  the picker.
- **Wired into every freeform content field that reasonably takes one**:
  the chat composer, planner event notes, reminder notes, prayer request
  descriptions, prayer answer notes, the prayer journal, profile bios,
  check-in notes, and family descriptions. Short, structured fields
  (names, titles, labels) were deliberately left as plain inputs — emoji
  in a family's name isn't a real use case the way it is in a chat
  message or a journal entry, and the pattern here is reusable if that
  changes.

## Dropdown Positioning Fix

The category and recurrence dropdowns on the Planner (among others) could
render clipped at the edge of the browser window. Native `<select>`
elements are entirely browser-controlled — there's no way to guarantee
their popup position from CSS or JS — so the real fix was replacing every
native select that had this problem with a custom `Select` component
built on Radix UI, the same library already backing the Dropdown/Popover
components elsewhere in the app.

- **`components/ui/select.tsx`** uses Radix's `position="popper"` mode,
  which runs through the same collision-detection engine as our existing
  dropdown menus: `avoidCollisions` keeps it from ever rendering outside
  the viewport, `collisionPadding` keeps a buffer from the very edge, and
  rendering through a Portal means no ancestor's `overflow: hidden` can
  clip it. This is a structural guarantee, not a hope that browser
  behavior happens to cooperate.
- **Replaced everywhere it was native**: Planner's category and repeat
  selects, the family invite/invite-link role pickers, the Settings
  language picker, the Prayer request category/visibility pickers, and
  the profile relationship/color-tag pickers.
- The existing `DropdownMenuContent` and `TooltipContent` components (used
  for the topbar menu, member action menus, etc.) got the same explicit
  `collisionPadding` treatment for consistency, even though Radix's
  defaults were already reasonable there.

## Family Activity Feed

The Dashboard's "Family activity" card previously assembled itself from
three separate live queries (planner events, check-ins, new members) at
read time. That approach doesn't scale to "think Facebook timeline" —
more action types, real pagination, and per-entry privacy all need
somewhere durable to live. This replaces it with a real `activity_log`
table, written by a trigger at the moment each action happens, across ten
action types: planner events created/updated, reminders shared/completed,
prayer requests created/answered, joining the family, role changes,
check-ins, and new media.

- **Full timeline** — a new Activity tab on the Family page, paginated
  20-at-a-time via "Load more" (cursor-based on timestamp, so loading page
  2 can never show you an entry from page 1 again even if new activity
  arrived in between).
- **Same data, two views** — the Dashboard's preview card and the full
  Activity tab both call the same `getFamilyActivityFeed()` (in
  `services/activity.service.ts`) and render through the same
  `ActivityRow` component, just with different limits — no separate
  "dashboard version" of the feed to keep in sync with the real one.
- **Privacy carries through automatically.** A personal (non-family-visible)
  planner event never generates an entry at all. A prayer request scoped
  to a private group generates an entry only that group can see — the
  activity_log row itself carries the same `visible_to_group_id` the
  prayer request does, checked by the same RLS pattern used everywhere
  else in the app. There's no separate "activity feed privacy" system to
  keep in sync with the real one.
- Each entry's `summary` text (e.g. `added "Dentist appointment" to the
  planner`) is written once, at the moment the trigger fires, not
  recomputed by joining back to the original table on every read. That
  means an entry keeps making sense even if the underlying event, reminder,
  or prayer request is later edited or deleted — the known tradeoff, same
  as a real social timeline, is that the entry doesn't update or
  disappear along with it.

## Dashboard

`/dashboard` is now a real command center rather than a static shell,
built entirely from data the other modules already produce — no new
tables were needed.

- **Welcome** — a time-of-day greeting (morning/afternoon/evening) using
  your nickname if you've set one, then display name, then account name,
  plus the family name and today's date.
- **Quick actions** — one-click shortcuts that reuse the *actual* create
  dialogs from other modules (new planner event, new reminder, post a
  check-in, invite a member if you're an admin) rather than separate
  dashboard-only forms, so there's exactly one implementation of each to
  keep in sync.
- **Today's planner** — just today's events off the full week, with a
  link to the complete Planner.
- **Upcoming birthdays** — computed client-side from everyone's birthday
  field (`lib/schedule-utils.ts`), finding each person's next occurrence
  (this year or next) and sorting by soonest. Respects the same privacy
  rule as the Profiles page — a birthday set to Private simply isn't in
  the data this card receives, so it can't leak here either.
- **Prayer reminder** — the single soonest upcoming occurrence across all
  your active prayer reminders, walking forward day-by-day against each
  one's days-of-week + time-of-day.
- **Messages** — reads from `notifications` (type = `message`) rather than
  the messages table itself, since FamilyHub doesn't track per-message
  read receipts; the notification a new message already generates is a
  reasonable proxy for "unread."
- **Family activity** — a merged, timestamp-sorted feed built directly
  from recent planner events, check-ins, and new members (not from
  `notifications`, which only ever reaches people *other* than whoever
  did the thing — a poor fit for "everything that happened," including
  your own actions).
- **Recent notifications** — the same live, real-time notification
  context that backs the topbar bell, just rendered as a short list here
  instead of a full feed.
- If you don't belong to a family yet, the dashboard shows the same
  create-or-join onboarding as the Family page, rather than an empty
  shell pointing you elsewhere first.

## Planner module

- **Weekly grid** — `/planner` shows Monday–Sunday as columns (stacking on
  mobile), reading the week from a `?week=YYYY-MM-DD` search param so it's
  linkable/shareable and survives a refresh. "Today" always jumps back to
  the current week regardless of which week you're viewing.
- **Any family member can add an event** — via the header "Add event"
  button (defaults to today) or the compact "+ Add" control at the bottom
  of any day column (defaults to that day). Events support an optional end
  time, notes, and a simple repeat setting (daily/weekly/monthly, stored as
  `recurrence_rule` — this pass renders each occurrence as a label on the
  event rather than materializing future instances; expanding recurring
  events into actual future rows is a good next refinement).
- **Editing/deleting** is restricted to whoever created the event or a
  family admin — enforced by `database/003_planner.sql`'s RLS policies,
  not just hidden in the UI. Other members can still open an event to view
  its details (time, notes, who added it) read-only.
- Everything routes through Server Actions
  (`app/(dashboard)/planner/actions.ts`) that write directly to
  `planner_events`; no RPC functions were needed since it's single-table
  CRUD once RLS is in place.

## Reminders, Prayer Reminders & Check-Ins module

`/reminders` groups all three under tabs, since they share a shape
(personal-or-shared nudges) rather than needing separate top-level nav
entries:

- **Reminders tab** — personal to-dos with a title, optional notes, and a
  date/time. Each has a tap-to-complete circle and a delete button.
  Optionally check "Share with my family" to make one visible (read-only)
  to the rest of the family — only the creator can still edit or complete
  it, enforced by the extra RLS policy in `004_reminders.sql`.
- **Prayer tab** — recurring reminders: a label, a time of day, and which
  days of the week it repeats on (weekday chip picker). Each has an
  active/paused toggle instead of a one-time complete state, since it's
  meant to recur indefinitely. Personal only in this pass — the
  `prayer_reminders.family_id` column exists in the schema for a future
  family-wide prayer schedule, just not wired into the UI yet.
- **Check-Ins tab** — a family-wide feed. Anyone posts a quick status
  (from a preset list like "Arrived safely" / "On my way") plus an
  optional note and location label; everyone in the family sees the feed
  in real time on next load. A member can delete their own check-in; a
  family admin can remove any (light moderation). This tab requires a
  family to exist (it's inherently shared), unlike the other two tabs.
- Server Actions (`app/(dashboard)/reminders/actions.ts`) write directly
  to `reminders`, `prayer_reminders`, and `check_ins` — no RPCs needed.

### A typing note worth knowing about

A few Supabase calls in this codebase are cast with `supabase as any`
(e.g. every `.insert()`/`.update()` and any embedded-resource `.select()`
with a join). This hand-written `types/database.types.ts` doesn't carry
the `Relationships` metadata that Supabase's real generated types include,
and in this supabase-js version that's enough to make the insert/update
generics collapse to `never` for every table, not just ones with joins.
The casts route around that without weakening runtime behavior — Postgres
and RLS still validate every write. Running
`npx supabase gen types typescript --project-id <id> > types/database.types.ts`
against a real project produces fully-typed versions of these calls; at
that point the `as any` casts can be removed table-by-table.

## Chat module

- **One family chat, auto-provisioned** — the first time anyone opens
  `/chat` (or clicks "Start the family chat" if it doesn't exist yet), the
  `get_or_create_family_chat` RPC creates a `chats` row of type `family`
  and adds every current family member as a participant. It's idempotent,
  so it's safe to call from multiple people/devices.
- **Direct messages** — "New message" lists other family members; picking
  one calls `get_or_create_direct_chat`, which finds an existing 1:1 thread
  between the two of you or creates one. FamilyHub direct messages are
  intentionally restricted to people who share a family — enforced in the
  RPC, not just the UI.
- **Realtime** — `MessageThread` fetches the last 100 messages on load,
  then subscribes to Postgres changes on `messages` filtered to that
  `chat_id` via Supabase Realtime, so messages from other participants
  appear live without a refresh. Sending a message is a direct insert from
  the browser client (not a Server Action) — that's what makes the
  realtime round-trip work, and RLS (not the UI) is what actually stops
  someone posting into a chat they're not part of.
- **Thread list** — `get_my_chat_threads` is one RPC that returns every
  chat you're in with the other participant's name/avatar (for directs)
  and a last-message preview, avoiding an N+1 query pattern from the
  client.
- Two-pane layout on desktop (thread list + message view side by side);
  on mobile, one pane at a time with a back button, driven by a
  `?thread=<chatId>` URL param so a conversation is linkable.
- Known simplification: message search, read receipts, typing indicators,
  file/image attachments, and group chats beyond the single family thread
  are not implemented — the `group` value in `chat_type` exists in the
  schema for that future work.

## Notifications module

- **Generated by the database, not the app.** Rather than every feature
  remembering to insert a notification, `database/006_notifications.sql`
  adds `SECURITY DEFINER` triggers that fire on the events that should
  produce one: a new chat message (notifies other participants), joining a
  family (notifies the new member — not the owner who just created it),
  a role change, and a new planner event (notifies the rest of the
  family). Any future feature that wants notifications can add a trigger
  the same way instead of threading notification-creation code through
  the UI layer.
- **`contexts/notification-context.tsx`** now actually does something: on
  login it fetches the last 50 notifications and subscribes to Realtime
  INSERT/UPDATE/DELETE on `notifications` filtered to the current user, so
  the bell badge in the topbar and the `/notifications` feed both update
  live. Marking read / dismissing updates local state immediately and
  writes through to Supabase in the background.
- **`/notifications`** — an All/Unread tabbed feed, click a card to mark it
  read, an X to dismiss it, "Mark all read" when there's anything unread.
- Known simplification: no per-type notification preferences yet (that's
  natural Settings-module territory — see below), and no push/email
  delivery, only in-app.

## Settings module

- **A bug this module fixed:** every earlier migration assumed a
  `public.users` row exists per signed-up person — `family_members`,
  `reminders`, `messages`, and others all have a foreign key to it. Nothing
  was ever creating that row; Supabase Auth only populates `auth.users`.
  In practice this meant `create_family()` (and anything else touching
  `public.users`-referencing tables) would have failed with a foreign-key
  violation for a real new sign-up. `database/007_settings.sql` adds the
  standard Supabase fix — a trigger on `auth.users` that provisions both
  `public.users` and a default `public.settings` row at sign-up — plus a
  one-time backfill for any accounts created before it existed. If you've
  already been testing against a live Supabase project, run this migration
  before anything else breaks on you.
- **General tab** — account email (read-only) and a language selector
  (English, French, Spanish, Portuguese, Arabic, Swahili; the value is
  stored, but no actual UI translation exists yet — that's a future
  prompt).
- **Appearance tab** — light/dark/system as before, plus a real **theme
  package library**: six accent-color skins (Hearth, Ocean, Forest,
  Berry, Sunset, Slate). The mechanism is the interesting part —
  `tailwind.config.ts`'s `hearth` color scale (used throughout the app as
  `bg-hearth-400`, `text-hearth-500`, etc.) was converted to reference CSS
  variables instead of static hex values, so switching a `data-color-theme`
  attribute on `<html>` re-skins every button, badge, and highlight in
  the app instantly, with zero changes to any of the ~100 files that use
  those classes. `localStorage` stays the source of truth for instant,
  flash-free hydration on each device; the choice is also written through
  to `settings.theme` / `settings.color_theme` as a server-side record,
  though real cross-device sync (reading it back on a new device) is a
  reasonable next step, not built here.
- **Notifications tab** — unchanged from before: a toggle per
  notification type, wired to the same `wants_notification()` check the
  trigger functions use, so turning one off actually stops that
  notification from being created.
- **Privacy tab** — the data-visibility note, plus two things that
  weren't there before: **Export my data** (a real JSON download of your
  profile, reminders, prayer requests, journal entries, and check-ins,
  assembled from a Server Action) and **Delete my account**, which
  previously wasn't implemented because it genuinely needs
  service-role privileges a normal session can't have. That's now a real
  Route Handler (`app/api/account/delete/route.ts`) using Supabase's
  admin client to call `auth.admin.deleteUser()`. It's blocked with a
  clear message if you're the sole owner of a family (the same rule
  `leave_family()` already enforces) — and it's worth knowing plainly:
  deleting your account cascades through every foreign key in the schema,
  including **messages you've sent in any chat**, which get deleted along
  with everything else rather than anonymized in place. That's a
  deliberate tradeoff (simpler, and "your data is gone" is more honestly
  true) rather than an oversight.
- **Security tab** (new) — a real password-change form; **two-factor
  authentication built entirely on Supabase Auth's native TOTP support**
  (`supabase.auth.mfa.*`) rather than a third-party library or extra
  backend — enroll, scan the QR code (or enter the secret manually),
  verify a 6-digit code, and it's on; unenroll to turn it off. No new
  database table was needed for this at all, since Supabase already
  manages MFA factors internally. "Sign out everywhere" moved here from
  Privacy, since it's a session/security concern more than a data one.

## Media module

- **Two Storage buckets, split by sensitivity** (`database/008_media.sql`):
  `public-media` (public bucket) for avatars and family cover photos —
  these render everywhere in the UI, so they use plain public URLs rather
  than paying for a signed-URL fetch on every avatar. `family-files`
  (private bucket) for the actual family photo/document gallery, tracked
  in the `media` table — access always requires a signed URL generated
  server-side per request, so only family members can ever resolve a
  working link, even if one leaked.
- **Family avatar** — every profile card gets a small camera-icon control
  (only visible on your own card) that uploads straight to
  `public-media/avatars/{user_id}/...` and updates `users.avatar_url`.
- **Family cover photo** — admins get a "Change cover" control over the
  banner at the top of the Family page, uploading to
  `public-media/family-covers/{family_id}/...` and updating
  `families.cover_image_url`. Storage RLS double-checks the admin role at
  the bucket level too, not just in the UI.
- **Photos & Files tab** on the Family page — any member can upload
  (25 MB limit, any file type); the grid shows an image thumbnail or a
  generic file icon, with uploader name, date, and size. Everyone can
  download; only the uploader or a family admin can delete — enforced by
  both the `media` table's RLS and a matching `storage.objects` delete
  policy that joins back to the same table, so the two can't drift out of
  sync with each other.
- Uploads go through **Server Actions** that read the file via
  `formData.get('file') as File`, upload the bytes to Storage, then insert
  the tracking row — if the row insert fails after a successful upload,
  the action rolls back the Storage object rather than leaving an orphaned
  file with no owner.
- Known simplification: no image resizing/thumbnailing (the original file
  is stored and displayed at whatever size it was uploaded), no folders or
  albums within the gallery, and no virus/content scanning on uploads.
