set search_path = public, extensions;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email citext not null,
  display_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint admin_users_email_check check (
    email::text ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  )
);

create unique index admin_users_email_uidx on public.admin_users (email);

create table public.settings (
  id boolean primary key default true,
  timezone text not null default 'America/Bogota',
  slot_interval_minutes integer not null default 30,
  min_notice_hours integer not null default 2,
  max_advance_days integer not null default 60,
  auto_confirm boolean not null default false,
  default_buffer_minutes integer not null default 15,
  frequent_threshold integer not null default 3,
  privacy_policy_version text not null default '2026-10-28',
  studio_name text not null default 'Perfect Woman T',
  contact_email citext,
  contact_phone text,
  updated_at timestamptz not null default now(),
  constraint settings_singleton_check check (id),
  constraint settings_timezone_check check (length(btrim(timezone)) between 1 and 64),
  constraint settings_slot_interval_check check (slot_interval_minutes between 5 and 120),
  constraint settings_min_notice_check check (min_notice_hours between 0 and 720),
  constraint settings_max_advance_check check (max_advance_days between 1 and 365),
  constraint settings_buffer_check check (default_buffer_minutes between 0 and 120),
  constraint settings_frequent_threshold_check check (frequent_threshold between 1 and 100),
  constraint settings_contact_email_check check (
    contact_email is null or contact_email::text ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  )
);

insert into public.settings (id) values (true)
on conflict (id) do nothing;

create table public.client_consents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  policy_version text not null,
  accepted_at timestamptz not null default now(),
  source text not null default 'public_booking',
  ip_hash text,
  constraint client_consents_policy_version_check check (length(btrim(policy_version)) between 1 and 32),
  constraint client_consents_source_check check (source in ('public_booking', 'admin')),
  constraint client_consents_unique unique (client_id, policy_version)
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_hash text,
  created_at timestamptz not null default now(),
  constraint audit_log_action_check check (length(btrim(action)) between 1 and 80),
  constraint audit_log_entity_check check (length(btrim(entity)) between 1 and 80)
);

create index audit_log_created_at_idx on public.audit_log (created_at desc);
create index audit_log_entity_idx on public.audit_log (entity, entity_id);

create table public.rate_limits (
  key_hash text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  primary key (key_hash, window_start),
  constraint rate_limits_count_check check (count >= 0)
);

create trigger settings_set_updated_at
before update on public.settings
for each row execute function public.set_updated_at();
