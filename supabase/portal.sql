-- Gentle Hearth live portal upgrade.
-- Run after schema.sql, on new and existing projects. Safe to re-run.

-- Crisis language is saved and flagged instead of being rejected.
alter table public.support_requests add column if not exists is_urgent boolean not null default false;
alter table public.messages add column if not exists is_urgent boolean not null default false;
-- Moderators see only the reported text, never the whole conversation.
alter table public.reports add column if not exists message_excerpt text;

create index if not exists support_requests_queue_idx on public.support_requests (status, is_urgent desc, created_at);
create index if not exists support_requests_patient_idx on public.support_requests (patient_id, created_at desc);
create index if not exists conversations_patient_idx on public.conversations (patient_id);
create index if not exists conversations_doctor_idx on public.conversations (doctor_id);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

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
