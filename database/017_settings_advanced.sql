-- ============================================================================
-- FamilyHub — Advanced Settings (Theme packages)
-- ----------------------------------------------------------------------------
-- Run AFTER database/schema.sql through 016_chat_attachments.sql.
--
-- `settings.theme` already existed (light/dark/system). This adds
-- `color_theme` for the theme *package* — the accent color skin selected
-- in Settings → Appearance (see types/theme.types.ts for the six
-- packages and styles/globals.css for how one CSS-variable swap re-skins
-- every `hearth-*` class across the whole app).
--
-- Note: the browser's localStorage remains the actual source of truth
-- for instant, flash-free theme hydration on each device (see
-- contexts/theme-context.tsx) — this column is a server-side record of
-- the preference, written through whenever it changes in Settings,
-- rather than something the app reads from on every page load. Real
-- cross-device sync (reading this column back on a new device) is a
-- reasonable next step, not implemented here.
-- ============================================================================

alter table public.settings add column if not exists color_theme text not null default 'hearth';
alter table public.settings add constraint chk_settings_color_theme
  check (color_theme in ('hearth', 'ocean', 'forest', 'berry', 'sunset', 'slate'));
