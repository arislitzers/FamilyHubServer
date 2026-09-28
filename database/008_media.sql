-- ============================================================================
-- FamilyHub — Media Module
-- ----------------------------------------------------------------------------
-- Run AFTER database/schema.sql through 007_settings.sql (relies on
-- is_family_member / is_family_admin).
--
-- Two Storage buckets, deliberately split by sensitivity:
--
--   public-media   PUBLIC bucket — avatars and family cover photos. These
--                  render constantly across the UI (every avatar, every
--                  family header), so they use public URLs rather than
--                  paying for a signed-URL round trip on every render.
--                  Path convention:
--                    avatars/{user_id}/{filename}
--                    family-covers/{family_id}/{filename}
--
--   family-files   PRIVATE bucket — the actual family photo/document
--                  gallery, tracked in the `media` table. Access requires
--                  a signed URL, generated server-side per request, so
--                  only family members can ever resolve a working link.
--                  Path convention: {family_id}/{uuid}-{filename}
--
-- Run this in the Supabase SQL editor like the others; storage.buckets and
-- storage.objects already exist as part of every Supabase project.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('public-media', 'public-media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('family-files', 'family-files', false)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- public-media: anyone can read (it's public); writes are scoped to the
-- relevant owner (your own avatar folder) or family admin (cover photo).
-- ----------------------------------------------------------------------------
drop policy if exists "Anyone can view public media" on storage.objects;
create policy "Anyone can view public media" on storage.objects
  for select using (bucket_id = 'public-media');

drop policy if exists "Users can manage their own avatar" on storage.objects;
create policy "Users can manage their own avatar" on storage.objects
  for all using (
    bucket_id = 'public-media'
    and (storage.foldername(name))[1] = 'avatars'
    and (storage.foldername(name))[2] = auth.uid()::text
  ) with check (
    bucket_id = 'public-media'
    and (storage.foldername(name))[1] = 'avatars'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "Admins can manage their family's cover photo" on storage.objects;
create policy "Admins can manage their family's cover photo" on storage.objects
  for all using (
    bucket_id = 'public-media'
    and (storage.foldername(name))[1] = 'family-covers'
    and public.is_family_admin(((storage.foldername(name))[2])::uuid)
  ) with check (
    bucket_id = 'public-media'
    and (storage.foldername(name))[1] = 'family-covers'
    and public.is_family_admin(((storage.foldername(name))[2])::uuid)
  );

-- ----------------------------------------------------------------------------
-- family-files: only family members can read or upload. Deletes are
-- scoped to match the same "uploader or admin" rule the `media` table
-- itself uses, checked by joining back to that table.
-- ----------------------------------------------------------------------------
drop policy if exists "Members can view their family's files" on storage.objects;
create policy "Members can view their family's files" on storage.objects
  for select using (
    bucket_id = 'family-files'
    and public.is_family_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "Members can upload files for their family" on storage.objects;
create policy "Members can upload files for their family" on storage.objects
  for insert with check (
    bucket_id = 'family-files'
    and public.is_family_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "Uploaders and admins can delete family files" on storage.objects;
create policy "Uploaders and admins can delete family files" on storage.objects
  for delete using (
    bucket_id = 'family-files'
    and exists (
      select 1 from public.media m
      where m.storage_path = storage.objects.name
        and (m.uploaded_by = auth.uid() or public.is_family_admin(m.family_id))
    )
  );

-- ============================================================================
-- RLS — the `media` table itself (schema.sql enabled RLS but added no
-- policies, so it currently denies everything by default).
-- ============================================================================
drop policy if exists "Members can view their family's media" on public.media;
create policy "Members can view their family's media" on public.media
  for select using (family_id is not null and public.is_family_member(family_id));

drop policy if exists "Members can add media" on public.media;
create policy "Members can add media" on public.media
  for insert with check (
    public.is_family_member(family_id) and uploaded_by = auth.uid()
  );

drop policy if exists "Uploaders and admins can delete media rows" on public.media;
create policy "Uploaders and admins can delete media rows" on public.media
  for delete using (
    uploaded_by = auth.uid() or public.is_family_admin(family_id)
  );
