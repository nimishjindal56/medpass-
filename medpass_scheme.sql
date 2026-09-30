-- MedPass (OSHN) - Supabase schema
-- Run in Supabase SQL editor (or as a migration).

-- ---------- Enums ----------
create type public.app_role as enum ('patient', 'doctor', 'admin');
create type public.access_tier as enum ('public', 'doctor');

-- ---------- Helper: unguessable QR token ----------
create or replace function public.gen_qr_token()
returns text language sql volatile as $$
  select replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
$$;

-- ---------- profiles (1:1 with auth.users) ----------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  abha_id     text unique,              -- ABDM/ABHA (mock in sandbox)
  abha_verified boolean not null default false,
  role        public.app_role not null default 'patient',
  created_at  timestamptz not null default now()
);

-- Every new signup becomes a 'patient'. Doctors are promoted by an admin only.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id,
          new.raw_user_meta_data ->> 'full_name',
          new.raw_user_meta_data ->> 'phone');
  insert into public.emergency_profiles (user_id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- doctors (Tier-2 identity) ----------
create table public.doctors (
  id               uuid primary key references public.profiles(id) on delete cascade,
  hospital         text not null,
  registration_no  text not null unique,   -- NMC / state council number
  verified         boolean not null default false,
  created_at       timestamptz not null default now()
);

-- ---------- emergency_profiles ----------
create table public.emergency_profiles (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references public.profiles(id) on delete cascade,
  blood_group         text check (blood_group in
                        ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  allergies           text[] not null default '{}',
  chronic_conditions  text[] not null default '{}',
  current_medications text[] not null default '{}',
  implants            text[] not null default '{}',   -- e.g. Pacemaker
  organ_donor         boolean not null default false,
  advance_directives  text,
  emergency_notes     text,
  qr_token            text not null unique default public.gen_qr_token(),
  is_active           boolean not null default true,  -- patient can disable QR
  updated_at          timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_emergency_profiles_updated
  before update on public.emergency_profiles
  for each row execute function public.touch_updated_at();

-- ---------- emergency_contacts ----------
create table public.emergency_contacts (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.emergency_profiles(id) on delete cascade,
  name          text not null,
  relationship  text,
  phone_number  text not null,
  is_primary    boolean not null default false
);
create index on public.emergency_contacts (profile_id);

-- ---------- medical_reports (Tier-2 only; files live in Storage) ----------
create table public.medical_reports (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.emergency_profiles(id) on delete cascade,
  title       text not null,
  file_path   text not null,          -- path in 'medical-reports' bucket
  created_at  timestamptz not null default now()
);
create index on public.medical_reports (profile_id);

-- ---------- access_logs (audit trail; written only by server) ----------
create table public.access_logs (
  id            bigint generated always as identity primary key,
  profile_id    uuid not null references public.emergency_profiles(id) on delete cascade,
  tier          public.access_tier not null,
  doctor_id     uuid references public.doctors(id),
  ip_address    text,
  user_agent    text,
  city          text,
  lat           double precision,
  lng           double precision,
  scanned_at    timestamptz not null default now()
);
create index on public.access_logs (profile_id, scanned_at desc);

-- ---------- access_otps (Tier-2 OTP verification) ----------
create table public.access_otps (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.emergency_profiles(id) on delete cascade,
  doctor_id   uuid not null references public.doctors(id),
  code_hash   text not null,
  expires_at  timestamptz not null,
  consumed    boolean not null default false
);

-- ---------- Row Level Security ----------
alter table public.profiles            enable row level security;
alter table public.doctors             enable row level security;
alter table public.emergency_profiles  enable row level security;
alter table public.emergency_contacts  enable row level security;
alter table public.medical_reports     enable row level security;
alter table public.access_logs         enable row level security;
alter table public.access_otps         enable row level security;

-- profiles: own row. (role/abha_verified cannot be self-edited, see column grants below)
create policy "own profile read"   on public.profiles for select using (id = auth.uid());
create policy "own profile update" on public.profiles for update using (id = auth.uid());
revoke update on public.profiles from authenticated;
grant  update (full_name, phone, abha_id) on public.profiles to authenticated;

-- doctors: can read own record only
create policy "own doctor record" on public.doctors for select using (id = auth.uid());

-- emergency_profiles: owner full control (qr_token rotation goes through the RPC below)
create policy "own emergency profile" on public.emergency_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- emergency_contacts / medical_reports: owner via parent profile
create policy "own contacts" on public.emergency_contacts for all
  using (exists (select 1 from public.emergency_profiles p
                 where p.id = profile_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.emergency_profiles p
                 where p.id = profile_id and p.user_id = auth.uid()));

create policy "own reports" on public.medical_reports for all
  using (exists (select 1 from public.emergency_profiles p
                 where p.id = profile_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.emergency_profiles p
                 where p.id = profile_id and p.user_id = auth.uid()));

-- access_logs: patient can only READ their own logs. No insert/update/delete policies,
-- so only the service role (Edge Functions) can write them.
create policy "own access logs" on public.access_logs for select
  using (exists (select 1 from public.emergency_profiles p
                 where p.id = profile_id and p.user_id = auth.uid()));

-- access_otps: no policies = inaccessible to clients; service role only.

-- Realtime: lets the patient app show "Your MedPass was just accessed" live.
alter publication supabase_realtime add table public.access_logs;

-- ---------- RPC: rotate QR token (if a card is lost) ----------
create or replace function public.rotate_qr_token()
returns text language plpgsql security invoker set search_path = '' as $$
declare new_token text := public.gen_qr_token();
begin
  update public.emergency_profiles set qr_token = new_token where user_id = auth.uid();
  return new_token;
end $$;

-- ---------- RPC: Tier-1 public emergency data + audit log (server-only) ----------
create or replace function public.get_emergency_public(
  p_token text, p_ip text, p_ua text,
  p_city text default null, p_lat double precision default null, p_lng double precision default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  ep public.emergency_profiles%rowtype;
  result jsonb;
begin
  select * into ep from public.emergency_profiles
   where qr_token = p_token and is_active;
  if not found then return null; end if;

  insert into public.access_logs (profile_id, tier, ip_address, user_agent, city, lat, lng)
  values (ep.id, 'public', p_ip, p_ua, p_city, p_lat, p_lng);

  select jsonb_build_object(
    'name',        (select full_name from public.profiles where id = ep.user_id),
    'blood_group', ep.blood_group,
    'allergies',   ep.allergies,
    'chronic_conditions', ep.chronic_conditions,
    'implants',    ep.implants,
    'current_medications', ep.current_medications,
    'organ_donor', ep.organ_donor,
    'contacts', coalesce((
        select jsonb_agg(jsonb_build_object(
                 'name', c.name, 'relationship', c.relationship, 'phone', c.phone_number)
               order by c.is_primary desc)
          from public.emergency_contacts c where c.profile_id = ep.id), '[]'::jsonb)
  ) into result;
  return result;
end $$;

revoke execute on function public.get_emergency_public(text,text,text,text,double precision,double precision)
  from public, anon, authenticated;
grant  execute on function public.get_emergency_public(text,text,text,text,double precision,double precision)
  to service_role;

-- ---------- Storage: private bucket for Tier-2 reports ----------
insert into storage.buckets (id, name, public) values ('medical-reports', 'medical-reports', false)
on conflict do nothing;

-- Files are stored as {user_id}/{filename}; owners manage only their own folder.
create policy "own report files" on storage.objects for all
  using (bucket_id = 'medical-reports' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'medical-reports' and (storage.foldername(name))[1] = auth.uid()::text);
