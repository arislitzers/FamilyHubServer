-- ============================================================================
-- FamilyHub — Chat Attachments (documents, images, videos)
-- ----------------------------------------------------------------------------
-- Run AFTER database/schema.sql through 015_family_activity_feed.sql.
--
-- Attachments get their OWN bucket rather than reusing `family-files`
-- (the Media module's bucket) or the `media` table, deliberately: both of
-- those are scoped by is_family_member(), but a private group chat (see
-- 013_private_groups.sql) can contain a SUBSET of the family. Scoping
-- chat attachments by is_family_member() would let any family member
-- read a file shared inside a private group they're not part of — a
-- real privacy hole. Chat attachments are scoped by is_chat_participant()
-- instead, the same rule that already governs the messages themselves.
-- ============================================================================

alter table public.messages add column if not exists attachment_path text;
alter table public.messages add column if not exists attachment_name text;
alter table public.messages add column if not exists attachment_mime_type text;
alter table public.messages add column if not exists attachment_size_bytes bigint;

insert into storage.buckets (id, name, public)
values ('chat-files', 'chat-files', false)
on conflict (id) do nothing;

-- Path convention: {chat_id}/{uuid}-{filename}
drop policy if exists "Chat participants can view attachments" on storage.objects;
create policy "Chat participants can view attachments" on storage.objects
  for select using (
    bucket_id = 'chat-files'
    and public.is_chat_participant(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "Chat participants can upload attachments" on storage.objects;
create policy "Chat participants can upload attachments" on storage.objects
  for insert with check (
    bucket_id = 'chat-files'
    and public.is_chat_participant(((storage.foldername(name))[1])::uuid)
  );

-- A message's sender can remove their own attachment (paired with
-- editing/removing the message itself in a later pass).
drop policy if exists "Senders can delete their own attachments" on storage.objects;
create policy "Senders can delete their own attachments" on storage.objects
  for delete using (
    bucket_id = 'chat-files'
    and exists (
      select 1 from public.messages m
      where m.attachment_path = storage.objects.name and m.sender_id = auth.uid()
    )
  );
