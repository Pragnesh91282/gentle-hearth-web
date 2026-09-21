create extension if not exists pgcrypto;

create type public.account_role as enum ('patient', 'doctor', 'moderator');
create type public.request_status as enum ('open', 'claimed', 'closed');
create type public.conversation_status as enum ('active', 'closed');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Gentle Hearth member',
  role public.account_role not null default 'patient',
  country_code text,
  created_at timestamptz not null default now()
);

create table if not exists public.doctor_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  credentials text not null,
  specialties text[] not null default '{}',
  bio text not null default '',
  availability text not null default 'By arrangement',
  support_mode text not null default 'Free or low-cost',
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  support_type text not null,
  message text not null check (char_length(message) between 1 and 2000),
  country_code text,
  consented_to_guidance boolean not null default false,
  status public.request_status not null default 'open',
  claimed_by uuid references public.doctor_profiles(user_id),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid unique not null references public.support_requests(id) on delete cascade,
  patient_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid not null references public.doctor_profiles(user_id),
  status public.conversation_status not null default 'active',
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  message_id uuid references public.messages(id) on delete cascade,
  reason text not null check (char_length(reason) between 1 and 1000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved')),
  created_at timestamptz not null default now()
);

create table if not exists public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create or replace function public.is_verified_doctor(candidate_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    join public.doctor_profiles d on d.user_id = p.id
    where p.id = candidate_id and p.role = 'doctor' and d.verification_status = 'verified'
  );
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Gentle Hearth member'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.doctor_profiles enable row level security;
alter table public.support_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;

create policy "profiles are visible to signed in users" on public.profiles for select to authenticated using (true);
create policy "members update their own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "verified doctor profiles are public" on public.doctor_profiles for select using (verification_status = 'verified' or auth.uid() = user_id);

create policy "patients create their own requests" on public.support_requests for insert to authenticated
with check (auth.uid() = patient_id and consented_to_guidance = true);
create policy "patients and assigned doctors view requests" on public.support_requests for select to authenticated
using (auth.uid() = patient_id or auth.uid() = claimed_by or (status = 'open' and public.is_verified_doctor(auth.uid())));
create policy "patients close their requests" on public.support_requests for update to authenticated
using (auth.uid() = patient_id or auth.uid() = claimed_by) with check (auth.uid() = patient_id or auth.uid() = claimed_by);

create policy "conversation participants view conversations" on public.conversations for select to authenticated
using (auth.uid() = patient_id or auth.uid() = doctor_id);
create policy "verified doctors claim requests" on public.conversations for insert to authenticated
with check (auth.uid() = doctor_id and public.is_verified_doctor(auth.uid()));
create policy "participants close conversations" on public.conversations for update to authenticated
using (auth.uid() = patient_id or auth.uid() = doctor_id) with check (auth.uid() = patient_id or auth.uid() = doctor_id);

create policy "conversation participants view messages" on public.messages for select to authenticated
using (exists (select 1 from public.conversations c where c.id = conversation_id and (c.patient_id = auth.uid() or c.doctor_id = auth.uid())));
create policy "conversation participants send messages" on public.messages for insert to authenticated
with check (auth.uid() = sender_id and exists (select 1 from public.conversations c where c.id = conversation_id and c.status = 'active' and (c.patient_id = auth.uid() or c.doctor_id = auth.uid())));

create policy "members manage their own blocks" on public.blocks for all to authenticated
using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);
create policy "members submit reports" on public.reports for insert to authenticated with check (auth.uid() = reporter_id);
create policy "reporters view their reports" on public.reports for select to authenticated using (auth.uid() = reporter_id);

revoke all on all tables in schema public from anon;
grant usage on schema public to authenticated;
