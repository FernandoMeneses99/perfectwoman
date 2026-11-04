set search_path = public, extensions;

alter table public.admin_users
add column role text not null default 'admin';

alter table public.admin_users
add constraint admin_users_role_check check (role in ('owner', 'admin'));

update public.admin_users
set role = 'owner'
where user_id = (
  select user_id
  from public.admin_users
  order by created_at, user_id
  limit 1
)
and not exists (
  select 1
  from public.admin_users
  where role = 'owner'
);

create or replace function public.is_owner()
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
      and role = 'owner'
  );
$$;

alter table public.gallery_items
drop constraint gallery_items_image_url_check;

alter table public.gallery_items
add constraint gallery_items_image_url_check
check (image_url ~ '^(https?://|/images/)');

alter table public.services
drop constraint services_image_url_check;

alter table public.services
add constraint services_image_url_check
check (image_url is null or image_url ~ '^(https?://|/images/)');

alter table public.professionals
drop constraint professionals_photo_url_check;

alter table public.professionals
add constraint professionals_photo_url_check
check (photo_url is null or photo_url ~ '^(https?://|/images/)');

drop function if exists public.get_public_services();

create function public.get_public_services()
returns table (
  id uuid,
  slug text,
  name text,
  category text,
  description text,
  duration_minutes integer,
  duration_verified boolean,
  price_cop integer,
  price_verified boolean,
  image_url text,
  image_alt text,
  featured boolean,
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
    s.duration_verified,
    s.price_cop,
    s.price_verified,
    s.image_url,
    s.image_alt,
    s.featured,
    s.sort_order
  from public.services s
  where s.active = true
  order by s.sort_order, s.name;
$$;

drop function if exists public.get_public_professionals();

create function public.get_public_professionals()
returns table (
  id uuid,
  full_name text,
  slug text,
  role text,
  bio text,
  quote text,
  photo_url text,
  photo_alt text,
  instagram text,
  sort_order integer
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    p.id,
    p.full_name,
    p.slug,
    p.role,
    p.bio,
    p.quote,
    p.photo_url,
    p.photo_alt,
    p.instagram,
    p.sort_order
  from public.professionals p
  where p.active = true
  order by p.sort_order, p.created_at;
$$;

update public.services
set image_url = case slug
  when 'pestanas-pelo-a-pelo-volumen' then '/images/pestañas-pelo-a-pelo.jpg'
  when 'diseno-laminado-cejas' then '/images/diseño-laminado.jpg'
  when 'lash-lifting-tinte' then '/images/lash-lifting.jpg'
  when 'facial-glow-therapy' then '/images/glow-terapy.jpg'
  else image_url
end,
image_alt = case slug
  when 'pestanas-pelo-a-pelo-volumen' then 'Pestañas pelo a pelo y volumen realizadas en Perfect Woman T'
  when 'diseno-laminado-cejas' then 'Diseño y laminado de cejas realizado en Perfect Woman T'
  when 'lash-lifting-tinte' then 'Lash lifting y tinte realizado en Perfect Woman T'
  when 'facial-glow-therapy' then 'Cuidado facial y glow therapy realizado en Perfect Woman T'
  else image_alt
end
where slug in (
  'pestanas-pelo-a-pelo-volumen',
  'diseno-laminado-cejas',
  'lash-lifting-tinte',
  'facial-glow-therapy'
);

update public.gallery_items
set image_url = case slug
  when 'pestanas-clasicas-1-1' then '/images/pestañas-clasicas.jpg'
  when 'cejas-efecto-sombra' then '/images/efecto-sombra.jpg'
  when 'lifting-natural' then '/images/lifting-natura.jpg'
  when 'volumen-glam-ruso' then '/images/glow-ruso.jpg'
  when 'ambiente-del-salon' then '/images/salon.jpg'
  else image_url
end
where slug in (
  'pestanas-clasicas-1-1',
  'cejas-efecto-sombra',
  'lifting-natural',
  'volumen-glam-ruso',
  'ambiente-del-salon'
);

update public.site_content
set content = content || jsonb_build_object(
  'hero', coalesce(content -> 'hero', '{}'::jsonb) || jsonb_build_object(
    'image', '/images/salon.jpg',
    'imageAlt', 'Ambiente del estudio Perfect Woman T en Bogotá',
    'cardTitle', 'Estudio de mirada'
  ),
  'specialist', coalesce(content -> 'specialist', '{}'::jsonb) || jsonb_build_object(
    'image', '/images/salon.jpg',
    'imageAlt', 'Ambiente del estudio Perfect Woman T'
  ),
  'seo', coalesce(content -> 'seo', '{}'::jsonb) || jsonb_build_object(
    'image', 'https://perfectwoman.vercel.app/images/salon.jpg'
  )
)
where id = true;

alter table public.reviews
add column consent_version text,
add column consent_at timestamptz,
add column consent_ip_hash text;

alter table public.reviews
add constraint reviews_consent_version_check
check (consent_version is null or length(btrim(consent_version)) between 1 and 32);

drop function if exists public.admin_list_admin_users();

create function public.admin_list_admin_users()
returns table (
  user_id uuid,
  email extensions.citext,
  display_name text,
  role text,
  active boolean,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_owner() then
    raise exception 'NOT_OWNER' using errcode = '42501';
  end if;

  return query
  select
    au.user_id,
    au.email,
    au.display_name,
    au.role,
    au.active,
    au.created_at
  from public.admin_users au
  order by au.active desc, au.created_at;
end;
$$;

drop function if exists public.admin_upsert_admin_user(text, text, boolean);

create function public.admin_upsert_admin_user(
  p_email text,
  p_display_name text default null,
  p_active boolean default true,
  p_role text default null
)
returns table (
  user_id uuid,
  email extensions.citext,
  display_name text,
  role text,
  active boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email extensions.citext;
  v_display_name text;
  v_user_id uuid;
  v_role text;
  v_admin public.admin_users%rowtype;
  v_owner_count integer;
begin
  if not public.is_owner() then
    raise exception 'NOT_OWNER' using errcode = '42501';
  end if;

  v_email := nullif(btrim(coalesce(p_email, '')), '')::extensions.citext;
  if v_email is null
    or v_email::text !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'INVALID_EMAIL' using errcode = 'PT422';
  end if;

  v_display_name := nullif(btrim(coalesce(p_display_name, '')), '');
  if v_display_name is not null and length(v_display_name) > 120 then
    raise exception 'INVALID_NAME' using errcode = 'PT422';
  end if;

  v_role := nullif(btrim(coalesce(p_role, '')), '');

  select users.id into v_user_id
  from auth.users users
  where lower(users.email) = lower(v_email::text)
  limit 1;

  if v_user_id is null then
    raise exception 'AUTH_USER_NOT_FOUND' using errcode = 'PT404';
  end if;

  if v_role is null then
    select au.role into v_role
    from public.admin_users au
    where au.user_id = v_user_id;

    v_role := coalesce(v_role, 'admin');
  end if;

  if v_role not in ('owner', 'admin') then
    raise exception 'INVALID_ROLE' using errcode = 'PT422';
  end if;

  if v_user_id = auth.uid() and p_active is not true then
    raise exception 'CANNOT_DEACTIVATE_SELF' using errcode = 'PT409';
  end if;

  select count(*) into v_owner_count
  from public.admin_users
  where role = 'owner'
    and active = true;

  select * into v_admin
  from public.admin_users
  where user_id = v_user_id;

  if found
    and v_admin.role = 'owner'
    and (p_active is not true or v_role <> 'owner')
    and v_owner_count <= 1 then
    raise exception 'LAST_OWNER_REQUIRED' using errcode = 'PT409';
  end if;

  insert into public.admin_users (
    user_id,
    email,
    display_name,
    role,
    active
  )
  values (
    v_user_id,
    v_email,
    v_display_name,
    v_role,
    coalesce(p_active, true)
  )
  on conflict on constraint admin_users_pkey do update
  set email = excluded.email,
      display_name = excluded.display_name,
      role = excluded.role,
      active = excluded.active
  returning * into v_admin;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    'admin_user_saved',
    'admin_user',
    v_admin.user_id::text,
    jsonb_build_object(
      'email', v_admin.email,
      'role', v_admin.role,
      'active', v_admin.active
    )
  );

  return query
  select
    v_admin.user_id,
    v_admin.email,
    v_admin.display_name,
    v_admin.role,
    v_admin.active;
end;
$$;

drop function if exists public.get_public_review_invitation(text);

create function public.get_public_review_invitation(
  p_token text
)
returns table (
  invitation_id uuid,
  service_name text,
  professional_name text,
  appointment_starts_at timestamptz,
  client_first_name text,
  expires_at timestamptz,
  privacy_policy_version text
)
language plpgsql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_token text;
  v_invitation public.review_invitations%rowtype;
  v_appointment public.appointments%rowtype;
  v_client public.clients%rowtype;
  v_service public.services%rowtype;
  v_professional public.professionals%rowtype;
  v_policy_version text;
begin
  v_token := btrim(coalesce(p_token, ''));

  if v_token !~ '^[0-9a-f]{64}$' then
    raise exception 'INVITATION_NOT_FOUND' using errcode = 'PT404';
  end if;

  select ri.*
  into v_invitation
  from public.review_invitations ri
  where ri.token_hash = public.hash_review_token(v_token);

  if not found then
    raise exception 'INVITATION_NOT_FOUND' using errcode = 'PT404';
  end if;

  if v_invitation.used_at is not null or exists (
    select 1
    from public.reviews r
    where r.appointment_id = v_invitation.appointment_id
  ) then
    raise exception 'REVIEW_ALREADY_SUBMITTED' using errcode = 'PT409';
  end if;

  if v_invitation.expires_at <= now() then
    raise exception 'INVITATION_EXPIRED' using errcode = 'PT410';
  end if;

  select * into v_appointment
  from public.appointments
  where id = v_invitation.appointment_id;

  select * into v_client
  from public.clients
  where id = v_appointment.client_id;

  select * into v_service
  from public.services
  where id = v_appointment.service_id;

  select * into v_professional
  from public.professionals
  where id = v_appointment.professional_id;

  select s.privacy_policy_version
  into v_policy_version
  from public.settings s
  where s.id = true;

  return query
  select
    v_invitation.id,
    v_service.name,
    v_professional.full_name,
    v_appointment.starts_at,
    split_part(btrim(v_client.full_name), ' ', 1),
    v_invitation.expires_at,
    v_policy_version;
end;
$$;

drop function if exists public.submit_public_review(text, text, integer, text, boolean);

create function public.submit_public_review(
  p_token text,
  p_display_name text,
  p_rating integer,
  p_message text,
  p_consent boolean default false,
  p_policy_version text default null
)
returns table (
  review_id uuid,
  status text
)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_token text;
  v_invitation public.review_invitations%rowtype;
  v_appointment public.appointments%rowtype;
  v_review public.reviews%rowtype;
  v_name text;
  v_message text;
  v_ip_hash text;
  v_policy_version text;
  v_current_policy_version text;
begin
  v_ip_hash := public.hash_request_ip();

  if not public.consume_rate_limit('review:' || v_ip_hash, 5, 3600) then
    raise exception 'RATE_LIMITED' using errcode = 'PT429';
  end if;

  if p_consent is not true then
    raise exception 'CONSENT_REQUIRED' using errcode = 'PT422';
  end if;

  select s.privacy_policy_version
  into v_current_policy_version
  from public.settings s
  where s.id = true;

  v_policy_version := nullif(btrim(coalesce(p_policy_version, '')), '');
  if v_policy_version is null or v_policy_version <> v_current_policy_version then
    raise exception 'POLICY_VERSION_MISMATCH' using errcode = 'PT422';
  end if;

  v_token := btrim(coalesce(p_token, ''));

  if v_token !~ '^[0-9a-f]{64}$' then
    raise exception 'INVITATION_NOT_FOUND' using errcode = 'PT404';
  end if;

  select ri.*
  into v_invitation
  from public.review_invitations ri
  where ri.token_hash = public.hash_review_token(v_token)
  for update;

  if not found then
    raise exception 'INVITATION_NOT_FOUND' using errcode = 'PT404';
  end if;

  if v_invitation.used_at is not null or exists (
    select 1
    from public.reviews r
    where r.appointment_id = v_invitation.appointment_id
  ) then
    raise exception 'REVIEW_ALREADY_SUBMITTED' using errcode = 'PT409';
  end if;

  if v_invitation.expires_at <= now() then
    raise exception 'INVITATION_EXPIRED' using errcode = 'PT410';
  end if;

  v_name := btrim(coalesce(p_display_name, ''));
  if length(v_name) < 2 or length(v_name) > 60 then
    raise exception 'INVALID_REVIEW_NAME' using errcode = 'PT422';
  end if;

  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'INVALID_REVIEW_RATING' using errcode = 'PT422';
  end if;

  v_message := btrim(coalesce(p_message, ''));
  if length(v_message) < 10 or length(v_message) > 600 then
    raise exception 'INVALID_REVIEW_MESSAGE' using errcode = 'PT422';
  end if;

  select a.*
  into v_appointment
  from public.appointments a
  where a.id = v_invitation.appointment_id;

  insert into public.reviews (
    appointment_id,
    client_id,
    invitation_id,
    display_name,
    rating,
    message,
    consent_version,
    consent_at,
    consent_ip_hash
  )
  values (
    v_appointment.id,
    v_appointment.client_id,
    v_invitation.id,
    v_name,
    p_rating,
    v_message,
    v_policy_version,
    now(),
    v_ip_hash
  )
  returning * into v_review;

  update public.review_invitations
  set used_at = now()
  where id = v_invitation.id;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity,
    entity_id,
    metadata,
    ip_hash
  )
  values (
    null,
    'review_submitted',
    'review',
    v_review.id::text,
    jsonb_build_object(
      'appointment_id', v_appointment.id,
      'rating', p_rating,
      'consent_version', v_policy_version
    ),
    v_ip_hash
  );

  return query
  select v_review.id, v_review.status::text;
end;
$$;

revoke all on function public.get_public_services() from public;
revoke all on function public.get_public_professionals() from public;
revoke all on function public.get_public_review_invitation(text) from public;
revoke all on function public.admin_list_admin_users() from public;
revoke all on function public.admin_upsert_admin_user(text, text, boolean, text) from public;
revoke all on function public.submit_public_review(text, text, integer, text, boolean, text) from public;

grant execute on function public.get_public_services() to anon, authenticated;
grant execute on function public.get_public_professionals() to anon, authenticated;
grant execute on function public.get_public_review_invitation(text) to anon, authenticated;
grant execute on function public.admin_list_admin_users() to authenticated;
grant execute on function public.admin_upsert_admin_user(text, text, boolean, text) to authenticated;
grant execute on function public.submit_public_review(text, text, integer, text, boolean, text) to anon, authenticated;
