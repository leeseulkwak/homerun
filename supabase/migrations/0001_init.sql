-- 홈런(HomeRun) 초기 스키마

create table apartment_complexes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  region text not null,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  avatar_url text,
  apartment_complex_id uuid references apartment_complexes (id),
  dong text,
  created_at timestamptz not null default now()
);

create type workout_type as enum ('walk', 'run', 'hike');

create table workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  apartment_complex_id uuid references apartment_complexes (id),
  type workout_type not null,
  route jsonb not null default '[]', -- [{ lat, lng, t }]
  distance_m integer not null,
  duration_s integer not null,
  avg_pace_sec_per_km integer,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index workouts_apartment_complex_id_started_at_idx
  on workouts (apartment_complex_id, started_at desc);

create table workout_likes (
  workout_id uuid not null references workouts (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (workout_id, user_id)
);

create table workout_comments (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table challenges (
  id uuid primary key default gen_random_uuid(),
  apartment_complex_id uuid references apartment_complexes (id),
  title text not null,
  description text,
  target_type text not null check (target_type in ('distance', 'count')),
  target_value integer not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now()
);

create table challenge_participants (
  challenge_id uuid not null references challenges (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  progress integer not null default 0,
  joined_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

-- Row Level Security
alter table profiles enable row level security;
alter table workouts enable row level security;
alter table workout_likes enable row level security;
alter table workout_comments enable row level security;
alter table challenge_participants enable row level security;

create policy "profiles are readable by authenticated users"
  on profiles for select to authenticated using (true);
create policy "users manage their own profile"
  on profiles for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "workouts are readable by same-complex members"
  on workouts for select to authenticated using (
    apartment_complex_id in (select apartment_complex_id from profiles where id = auth.uid())
  );
create policy "users manage their own workouts"
  on workouts for insert to authenticated with check (auth.uid() = user_id);
create policy "users update or delete their own workouts"
  on workouts for update to authenticated using (auth.uid() = user_id);
create policy "users delete their own workouts"
  on workouts for delete to authenticated using (auth.uid() = user_id);

create policy "likes are readable by authenticated users"
  on workout_likes for select to authenticated using (true);
create policy "users manage their own likes"
  on workout_likes for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "comments are readable by authenticated users"
  on workout_comments for select to authenticated using (true);
create policy "users manage their own comments"
  on workout_comments for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "participation is readable by authenticated users"
  on challenge_participants for select to authenticated using (true);
create policy "users manage their own participation"
  on challenge_participants for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
