-- ============================================================
--  My Wall — Supabase schema
--  Run this once in the Supabase SQL editor (Dashboard → SQL).
-- ============================================================

-- 1. The wall table, exactly as specified in the challenge brief.
create table posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  body text check (char_length(body) <= 280),
  created_at timestamptz default now()
);

-- A post has to contain something. The upper bound is already enforced above.
alter table public.posts
  add constraint posts_body_not_blank
  check (char_length(btrim(body)) between 1 and 280);

-- Newest-first reads are the main query.
create index posts_created_at_idx on public.posts (created_at desc);

-- 2. Row level security: anybody can read the wall, anybody can add a note.
alter table public.posts enable row level security;

create policy "Wall posts are public"
  on public.posts
  for select
  using (true);

create policy "Anyone can add a wall post"
  on public.posts
  for insert
  with check (char_length(btrim(body)) between 1 and 280);

grant select, insert on public.posts to anon, authenticated;

-- 3. Optional display names.
--    The app keeps a per-browser id in localStorage and stores the name the
--    visitor chooses next to it. If this table is missing, the wall still
--    works and falls back to "Guest".
create table public.profiles (
  id uuid primary key,
  display_name text not null
    check (char_length(btrim(display_name)) between 1 and 40),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are public"
  on public.profiles
  for select
  using (true);

create policy "Anyone can create a profile name"
  on public.profiles
  for insert
  with check (char_length(btrim(display_name)) between 1 and 40);

create policy "Anyone can update a profile name"
  on public.profiles
  for update
  using (true)
  with check (char_length(btrim(display_name)) between 1 and 40);

grant select, insert, update on public.profiles to anon, authenticated;

-- 4. Stream new posts to every open tab.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'posts'
  ) then
    alter publication supabase_realtime add table public.posts;
  end if;
end
$$;
