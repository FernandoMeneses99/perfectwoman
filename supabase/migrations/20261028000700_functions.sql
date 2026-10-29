set search_path = public, extensions;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and active = true
  );
$$;

create or replace function public.get_public_services()
returns table (
  id uuid,
  slug text,
  name text,
  category text,
  description text,
  duration_minutes integer,
  price_cop integer,
  price_verified boolean,
  sort_order integer
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    s.id,
    s.slug,
    s.name,
    s.category,
    s.description,
    s.duration_minutes,
    s.price_cop,
    s.price_verified,
    s.sort_order
  from public.services s
  where s.active = true
  order by s.sort_order, s.name;
$$;
