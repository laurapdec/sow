-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  username              text unique not null,
  display_name          text,
  bio                   text,
  avatar_url            text,
  neighborhood          text,
  latitude              numeric,
  longitude             numeric,
  skills                text[] default '{}',
  languages             text[] default '{}',
  credit_balance        integer default 0,
  subscription_status   text default 'inactive',
  subscription_amount   numeric,
  is_sustainer          boolean default false,
  sustainer_since       timestamptz,
  hardship_waiver       boolean default false,
  is_admin              boolean default false,
  created_at            timestamptz default now(),
  constraint subscription_status_check
    check (subscription_status in ('active', 'inactive', 'hardship'))
);

-- ============================================================
-- PLACES
-- ============================================================
create table public.places (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  description       text,
  address           text,
  latitude          numeric not null,
  longitude         numeric not null,
  category          text not null,
  ownership_types   text[] not null,
  place_values      text[] default '{}',
  is_cooperative    boolean default false,
  cooperative_type  text,
  website           text,
  instagram         text,
  photos            text[] default '{}',
  hours             jsonb,
  submitted_by      uuid references public.profiles(id),
  status            text default 'pending',
  rejection_reason  text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  constraint category_check
    check (category in ('business', 'service', 'garden', 'hub', 'skillshare')),
  constraint status_check
    check (status in ('pending', 'approved', 'rejected')),
  constraint cooperative_type_check
    check (cooperative_type in ('worker', 'consumer', 'producer', 'multi-stakeholder') or cooperative_type is null),
  constraint ownership_types_not_empty
    check (array_length(ownership_types, 1) >= 1)
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger places_updated_at
  before update on public.places
  for each row execute function public.set_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'preferred_username',
      split_part(new.email, '@', 1) || '_' || floor(random() * 9000 + 1000)::text
    ),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (username) do update set
    username = excluded.username || '_' || floor(random() * 9000 + 1000)::text;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- RLS
-- ============================================================
alter table public.profiles enable row level security;
alter table public.places enable row level security;

-- Profiles
create policy "authenticated users can read all profiles"
  on public.profiles for select to authenticated using (true);

create policy "users can insert own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "users can update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Places: approved places visible to all authenticated users
create policy "authenticated users can read approved places"
  on public.places for select to authenticated
  using (status = 'approved');

-- Places: submitters can see their own (including pending/rejected)
create policy "users can read own places"
  on public.places for select to authenticated
  using (submitted_by = auth.uid());

-- Places: admins can read all
create policy "admins can read all places"
  on public.places for select to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Places: authenticated users can submit
create policy "authenticated users can submit places"
  on public.places for insert to authenticated
  with check (submitted_by = auth.uid() and status = 'pending');

-- Places: submitters can update their own pending submissions
create policy "users can update own pending places"
  on public.places for update to authenticated
  using (submitted_by = auth.uid() and status = 'pending')
  with check (submitted_by = auth.uid() and status = 'pending');

-- Places: admins can update any place (approve/reject)
create policy "admins can update any place"
  on public.places for update to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ============================================================
-- STORAGE
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('place-photos', 'place-photos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "place-photos are publicly readable"
  on storage.objects for select using (bucket_id = 'place-photos');

create policy "authenticated users can upload place photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'place-photos');

create policy "avatars are publicly readable"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "users can upload own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars');
