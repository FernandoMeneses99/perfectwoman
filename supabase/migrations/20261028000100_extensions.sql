set search_path = public, extensions;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;
create extension if not exists btree_gist with schema extensions;

create type public.appointment_status as enum (
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);

create type public.appointment_source as enum ('public', 'admin');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
