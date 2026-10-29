set search_path = public, extensions;

create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  slug text not null unique,
  email citext,
  phone text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professionals_full_name_check check (length(btrim(full_name)) between 2 and 120),
  constraint professionals_slug_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint professionals_email_check check (
    email is null or email::text ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  )
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text,
  description text,
  duration_minutes integer not null,
  buffer_before_minutes integer not null default 0,
  buffer_after_minutes integer not null default 15,
  price_cop integer,
  price_verified boolean not null default false,
  duration_verified boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_name_check check (length(btrim(name)) between 2 and 120),
  constraint services_slug_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint services_duration_check check (duration_minutes between 40 and 60),
  constraint services_buffer_before_check check (buffer_before_minutes between 0 and 60),
  constraint services_buffer_after_check check (buffer_after_minutes between 0 and 60),
  constraint services_price_check check (price_cop is null or price_cop >= 0),
  constraint services_description_check check (description is null or length(description) <= 2000)
);

create trigger professionals_set_updated_at
before update on public.professionals
for each row execute function public.set_updated_at();

create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();
