-- Thehrav (formerly Gentle Hearth) live portal upgrade.
-- Run after schema.sql, on new and existing projects. Safe to re-run.

-- Thehrav is not a crisis service: nothing is flagged urgent or
-- prioritised. Dropping the column also drops the old urgent-first index.
alter table public.support_requests drop column if exists is_urgent;
alter table public.messages drop column if exists is_urgent;
-- Moderators see only the reported text, never the whole conversation.
alter table public.reports add column if not exists message_excerpt text;

create index if not exists support_requests_queue_idx on public.support_requests (status, created_at);
create index if not exists support_requests_patient_idx on public.support_requests (patient_id, created_at desc);
create index if not exists conversations_patient_idx on public.conversations (patient_id);
create index if not exists conversations_doctor_idx on public.conversations (doctor_id);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);
-- Rate limits count each member's recent rows (src/lib/rateLimit.ts).
create index if not exists messages_sender_recent_idx on public.messages (sender_id, created_at desc);
create index if not exists reports_reporter_recent_idx on public.reports (reporter_id, created_at desc);

create or replace function public.is_moderator(candidate_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = candidate_id and role = 'moderator');
$$;

-- All writes go through server routes (service role) so safety checks and
-- request/conversation state cannot be bypassed from the browser.
drop policy if exists "patients close their requests" on public.support_requests;
drop policy if exists "verified doctors claim requests" on public.conversations;
drop policy if exists "participants close conversations" on public.conversations;
drop policy if exists "conversation participants send messages" on public.messages;
-- Reports carry a server-copied message excerpt that must not be forgeable.
drop policy if exists "members submit reports" on public.reports;

-- Members may rename themselves but never change their own role.
revoke update on public.profiles from authenticated;
grant update (display_name, country_code) on public.profiles to authenticated;

-- The public doctor directory must be readable before sign-in.
grant select on public.doctor_profiles to anon;

drop policy if exists "moderators view doctor profiles" on public.doctor_profiles;
create policy "moderators view doctor profiles" on public.doctor_profiles for select to authenticated
using (public.is_moderator(auth.uid()));
drop policy if exists "moderators view reports" on public.reports;
create policy "moderators view reports" on public.reports for select to authenticated
using (public.is_moderator(auth.uid()));

-- Claiming is atomic: the row lock stops two doctors claiming the same request.
create or replace function public.claim_support_request(p_request_id uuid, p_doctor_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_patient_id uuid;
  v_conversation_id uuid;
begin
  if not public.is_verified_doctor(p_doctor_id) then
    return null;
  end if;

  select patient_id into v_patient_id
  from public.support_requests
  where id = p_request_id and status = 'open' and claimed_by is null
  for update;

  if v_patient_id is null or v_patient_id = p_doctor_id then
    return null;
  end if;

  if exists (
    select 1 from public.blocks
    where (blocker_id = v_patient_id and blocked_id = p_doctor_id)
       or (blocker_id = p_doctor_id and blocked_id = v_patient_id)
  ) then
    return null;
  end if;

  update public.support_requests set status = 'claimed', claimed_by = p_doctor_id where id = p_request_id;
  insert into public.conversations (request_id, patient_id, doctor_id)
  values (p_request_id, v_patient_id, p_doctor_id)
  returning id into v_conversation_id;

  return v_conversation_id;
end;
$$;

-- Closing a conversation also closes the request it came from.
create or replace function public.close_conversation(p_conversation_id uuid, p_user_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_request_id uuid;
begin
  update public.conversations
  set status = 'closed', closed_at = now()
  where id = p_conversation_id and status = 'active' and (patient_id = p_user_id or doctor_id = p_user_id)
  returning request_id into v_request_id;

  if v_request_id is null then
    return false;
  end if;

  update public.support_requests set status = 'closed', closed_at = now() where id = v_request_id;
  return true;
end;
$$;

revoke execute on function public.claim_support_request(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.close_conversation(uuid, uuid) from public, anon, authenticated;
grant execute on function public.claim_support_request(uuid, uuid) to service_role;
grant execute on function public.close_conversation(uuid, uuid) to service_role;

-- Private Realtime channels ("conversation:<id>") carry typing and presence
-- signals. Only the two participants may join.
drop policy if exists "conversation participants read live channel" on realtime.messages;
create policy "conversation participants read live channel" on realtime.messages for select to authenticated
using (
  realtime.topic() like 'conversation:%'
  and exists (
    select 1 from public.conversations c
    where c.id::text = split_part(realtime.topic(), ':', 2)
      and (c.patient_id = auth.uid() or c.doctor_id = auth.uid())
  )
);
drop policy if exists "conversation participants write live channel" on realtime.messages;
create policy "conversation participants write live channel" on realtime.messages for insert to authenticated
with check (
  realtime.topic() like 'conversation:%'
  and exists (
    select 1 from public.conversations c
    where c.id::text = split_part(realtime.topic(), ':', 2)
      and (c.patient_id = auth.uid() or c.doctor_id = auth.uid())
  )
);

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'doctor_profiles') then
    alter publication supabase_realtime add table public.doctor_profiles;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reports') then
    alter publication supabase_realtime add table public.reports;
  end if;
end;
$$;

-- Guide types (India): registered doctors (NMC / State Medical Council),
-- registered clinical psychologists (RCI), and listeners. Existing guides
-- start as listeners until they add registration details and are re-verified.
alter table public.doctor_profiles add column if not exists guide_type text not null default 'listener';
alter table public.doctor_profiles add column if not exists full_name text;
alter table public.doctor_profiles add column if not exists registration_council text;
alter table public.doctor_profiles add column if not exists registration_number text;
alter table public.doctor_profiles add column if not exists registration_checked_at timestamptz;
alter table public.doctor_profiles add column if not exists registration_checked_by uuid references public.profiles(id) on delete set null;

alter table public.doctor_profiles drop constraint if exists doctor_profiles_guide_type_check;
alter table public.doctor_profiles add constraint doctor_profiles_guide_type_check
  check (guide_type in ('doctor', 'psychologist', 'listener'));
alter table public.doctor_profiles drop constraint if exists doctor_profiles_registration_check;
alter table public.doctor_profiles add constraint doctor_profiles_registration_check
  check (guide_type = 'listener' or (full_name is not null and registration_council is not null and registration_number is not null));

-- One registration number can back only one account.
create unique index if not exists doctor_profiles_registration_idx
  on public.doctor_profiles (lower(registration_council), lower(registration_number))
  where registration_number is not null;

-- Reports outlive the accounts, conversations, and messages they are about,
-- so deleting an account cannot erase complaints against it.
alter table public.reports alter column reporter_id drop not null;
alter table public.reports drop constraint if exists reports_reporter_id_fkey;
alter table public.reports add constraint reports_reporter_id_fkey
  foreign key (reporter_id) references public.profiles(id) on delete set null;
alter table public.reports drop constraint if exists reports_conversation_id_fkey;
alter table public.reports add constraint reports_conversation_id_fkey
  foreign key (conversation_id) references public.conversations(id) on delete set null;
alter table public.reports drop constraint if exists reports_message_id_fkey;
alter table public.reports add constraint reports_message_id_fkey
  foreign key (message_id) references public.messages(id) on delete set null;
-- Who was reported, with their name copied in case the account is deleted.
alter table public.reports add column if not exists reported_user_id uuid;
alter table public.reports drop constraint if exists reports_reported_user_id_fkey;
alter table public.reports add constraint reports_reported_user_id_fkey
  foreign key (reported_user_id) references public.profiles(id) on delete set null;
alter table public.reports add column if not exists reported_name text;

-- Renamed from Gentle Hearth to Thehrav: new members' default display name.
alter table public.profiles alter column display_name set default 'Thehrav member';
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Thehrav member'))
  on conflict (id) do nothing;
  return new;
end;
$$;
update public.profiles set display_name = 'Thehrav member' where display_name = 'Gentle Hearth member';

-- Email when a guide replies (src/lib/notify.ts): an opt-out per member,
-- and when each participant was last emailed about a conversation.
alter table public.profiles add column if not exists email_notifications boolean not null default true;
alter table public.conversations add column if not exists patient_notified_at timestamptz;
alter table public.conversations add column if not exists doctor_notified_at timestamptz;
