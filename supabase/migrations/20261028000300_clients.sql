set search_path = public, extensions;

create or replace function public.normalize_phone(p_phone text)
returns text
language plpgsql
immutable
as $$
declare
  v_digits text;
begin
  if p_phone is null then
    return null;
  end if;

  v_digits := regexp_replace(p_phone, '\D', '', 'g');

  if v_digits like '57%' and length(v_digits) > 10 then
    v_digits := substr(v_digits, 3);
  end if;

  if length(v_digits) = 10 then
    return '+57' || v_digits;
  end if;

  if length(v_digits) between 7 and 15 then
    return '+' || v_digits;
  end if;

  return null;
end;
$$;

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email citext,
  notes text,
  is_frequent_manual boolean not null default false,
  last_booking_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clients_full_name_check check (length(btrim(full_name)) between 2 and 120),
  constraint clients_phone_check check (length(btrim(phone)) between 7 and 30),
  constraint clients_phone_valid_check check (public.normalize_phone(phone) is not null),
  constraint clients_email_check check (
    email is null or email::text ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  constraint clients_notes_check check (notes is null or length(notes) <= 2000)
);

create unique index clients_phone_normalized_uidx
on public.clients (public.normalize_phone(phone));

create unique index clients_email_uidx
on public.clients (email)
where email is not null;

create index clients_full_name_idx
on public.clients (lower(full_name));

create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();
