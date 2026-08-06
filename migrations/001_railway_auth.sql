create extension if not exists pgcrypto;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  password_hash text,
  full_name text not null,
  username text not null unique check (username ~ '^[a-z0-9_]{3,30}$'),
  birthday date,
  bio text,
  avatar_url text,
  email_verified_at timestamptz,
  google_subject text unique,
  created_at timestamptz not null default now()
);
create table if not exists app_email_verifications (
  token_hash text primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  expires_at timestamptz not null,
  consumed_at timestamptz
);
create table if not exists app_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references app_users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);
create table if not exists app_likes (
  post_id uuid not null references app_posts(id) on delete cascade,
  user_id uuid not null references app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id,user_id)
);
create table if not exists app_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references app_posts(id) on delete cascade,
  author_id uuid not null references app_users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists app_posts_created_at_idx on app_posts(created_at desc);
create index if not exists app_comments_post_id_idx on app_comments(post_id);
