alter table app_users add column if not exists theme text not null default 'dark' check (theme in ('dark','light'));
alter table app_users add column if not exists allow_direct_messages boolean not null default true;
alter table app_users add column if not exists notifications_enabled boolean not null default true;
