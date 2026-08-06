create table if not exists app_follows (
  follower_id uuid not null references app_users(id) on delete cascade,
  following_id uuid not null references app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
create index if not exists app_follows_following_idx on app_follows(following_id);
