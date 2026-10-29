set search_path = public, extensions;

create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  weekday smallint not null,
  opens_at time not null,
  closes_at time not null,
  active boolean not null default true,
  valid_from date,
  valid_to date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_hours_weekday_check check (weekday between 0 and 6),
  constraint business_hours_time_check check (closes_at > opens_at),
  constraint business_hours_validity_check check (
    valid_to is null or valid_from is null or valid_to >= valid_from
  ),
  constraint business_hours_unique unique (professional_id, weekday, opens_at, closes_at)
);

create index business_hours_lookup_idx
on public.business_hours (professional_id, weekday)
where active;

create table public.schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid references public.professionals(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedule_blocks_range_check check (ends_at > starts_at),
  constraint schedule_blocks_reason_check check (reason is null or length(reason) <= 500)
);

create index schedule_blocks_range_idx
on public.schedule_blocks using gist (tstzrange(starts_at, ends_at, '[)'));

create trigger business_hours_set_updated_at
before update on public.business_hours
for each row execute function public.set_updated_at();

create trigger schedule_blocks_set_updated_at
before update on public.schedule_blocks
for each row execute function public.set_updated_at();
