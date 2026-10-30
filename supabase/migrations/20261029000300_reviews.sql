set search_path = public, extensions;

create type public.review_status as enum ('pending', 'approved', 'rejected');

create table public.review_invitations (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint review_invitations_token_hash_check check (token_hash ~ '^[0-9a-f]{64}$'),
  constraint review_invitations_expiry_check check (expires_at > created_at),
  constraint review_invitations_used_check check (used_at is null or used_at >= created_at)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  invitation_id uuid not null unique references public.review_invitations(id) on delete restrict,
  display_name text not null,
  rating smallint not null,
  message text not null,
  status public.review_status not null default 'pending',
  admin_note text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_display_name_check check (length(btrim(display_name)) between 2 and 60),
  constraint reviews_rating_check check (rating between 1 and 5),
  constraint reviews_message_check check (length(btrim(message)) between 10 and 600),
  constraint reviews_admin_note_check check (admin_note is null or length(admin_note) <= 500),
  constraint reviews_published_check check (status <> 'approved' or published_at is not null)
);

create index review_invitations_expires_at_idx
on public.review_invitations (expires_at);

create index reviews_status_published_idx
on public.reviews (status, published_at desc);

create index reviews_created_at_idx
on public.reviews (created_at desc);

create trigger review_invitations_set_updated_at
before update on public.review_invitations
for each row execute function public.set_updated_at();

create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

create or replace function public.hash_review_token(p_token text)
returns text
language sql
immutable
strict
set search_path = public, extensions, pg_temp
as $$
  select encode(extensions.digest(p_token, 'sha256'), 'hex');
$$;

create or replace function public.admin_create_review_invitation(
  p_appointment_id uuid
)
returns table (
  invitation_id uuid,
  token text,
  expires_at timestamptz,
  appointment_id uuid,
  client_name text,
  client_phone text,
  service_name text,
  appointment_starts_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_appointment public.appointments%rowtype;
  v_invitation public.review_invitations%rowtype;
  v_client public.clients%rowtype;
  v_service public.services%rowtype;
  v_token text;
  v_expires_at timestamptz;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN' using errcode = '42501';
  end if;

  select *
  into v_appointment
  from public.appointments
  where id = p_appointment_id
  for update;

  if not found then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'PT404';
  end if;

  if v_appointment.status <> 'completed' then
    raise exception 'APPOINTMENT_NOT_COMPLETED' using errcode = 'PT409';
  end if;

  if exists (
    select 1
    from public.reviews r
    where r.appointment_id = v_appointment.id
  ) then
    raise exception 'REVIEW_ALREADY_SUBMITTED' using errcode = 'PT409';
  end if;

  select * into v_client
  from public.clients
  where id = v_appointment.client_id;

  select * into v_service
  from public.services
  where id = v_appointment.service_id;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  v_expires_at := now() + interval '30 days';

  select ri.*
  into v_invitation
  from public.review_invitations ri
  where ri.appointment_id = v_appointment.id
  for update;

  if found then
    update public.review_invitations
    set
      token_hash = public.hash_review_token(v_token),
      expires_at = v_expires_at,
      used_at = null,
      created_by = auth.uid()
    where id = v_invitation.id
    returning * into v_invitation;
  else
    insert into public.review_invitations (
      appointment_id,
      token_hash,
      expires_at,
      created_by
    )
    values (
      v_appointment.id,
      public.hash_review_token(v_token),
      v_expires_at,
      auth.uid()
    )
    returning * into v_invitation;
  end if;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    'review_invitation_created',
    'review_invitation',
    v_invitation.id::text,
    jsonb_build_object(
      'appointment_id', v_appointment.id,
      'expires_at', v_expires_at
    )
  );

  return query
  select
    v_invitation.id,
    v_token,
    v_invitation.expires_at,
    v_appointment.id,
    v_client.full_name,
    v_client.phone,
    v_service.name,
    v_appointment.starts_at;
end;
$$;

create or replace function public.get_public_review_invitation(
  p_token text
)
returns table (
  invitation_id uuid,
  service_name text,
  professional_name text,
  appointment_starts_at timestamptz,
  client_first_name text,
  expires_at timestamptz
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

  return query
  select
    v_invitation.id,
    v_service.name,
    v_professional.full_name,
    v_appointment.starts_at,
    split_part(btrim(v_client.full_name), ' ', 1),
    v_invitation.expires_at;
end;
$$;

create or replace function public.submit_public_review(
  p_token text,
  p_display_name text,
  p_rating integer,
  p_message text,
  p_consent boolean default false
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
begin
  v_ip_hash := public.hash_request_ip();

  if not public.consume_rate_limit('review:' || v_ip_hash, 5, 3600) then
    raise exception 'RATE_LIMITED' using errcode = 'PT429';
  end if;

  if p_consent is not true then
    raise exception 'CONSENT_REQUIRED' using errcode = 'PT422';
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

  if p_rating is null or p_rating not between 1 and 5 then
    raise exception 'INVALID_REVIEW_RATING' using errcode = 'PT422';
  end if;

  v_message := btrim(coalesce(p_message, ''));
  if length(v_message) < 10 or length(v_message) > 600 then
    raise exception 'INVALID_REVIEW_MESSAGE' using errcode = 'PT422';
  end if;

  select * into v_appointment
  from public.appointments
  where id = v_invitation.appointment_id;

  insert into public.reviews (
    appointment_id,
    client_id,
    invitation_id,
    display_name,
    rating,
    message
  )
  values (
    v_appointment.id,
    v_appointment.client_id,
    v_invitation.id,
    v_name,
    p_rating,
    v_message
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
      'rating', p_rating
    ),
    v_ip_hash
  );

  return query
  select v_review.id, v_review.status::text;
end;
$$;

create or replace function public.admin_set_review_status(
  p_review_id uuid,
  p_status text,
  p_note text default null
)
returns table (
  review_id uuid,
  status text,
  published_at timestamptz,
  admin_note text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_review public.reviews%rowtype;
  v_note text;
  v_previous_status text;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN' using errcode = '42501';
  end if;

  if p_status is null or p_status not in ('approved', 'rejected') then
    raise exception 'INVALID_REVIEW_STATUS' using errcode = 'PT422';
  end if;

  v_note := nullif(btrim(coalesce(p_note, '')), '');
  if v_note is not null and length(v_note) > 500 then
    raise exception 'INVALID_REVIEW_NOTE' using errcode = 'PT422';
  end if;

  select *
  into v_review
  from public.reviews
  where id = p_review_id
  for update;

  if not found then
    raise exception 'REVIEW_NOT_FOUND' using errcode = 'PT404';
  end if;

  v_previous_status := v_review.status::text;

  update public.reviews
  set
    status = p_status::public.review_status,
    admin_note = v_note,
    published_at = case
      when p_status = 'approved' then coalesce(v_review.published_at, now())
      else null
    end
  where id = p_review_id
  returning * into v_review;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    'review_status_changed',
    'review',
    v_review.id::text,
    jsonb_build_object(
      'from', v_previous_status,
      'to', p_status
    )
  );

  return query
  select
    v_review.id,
    v_review.status::text,
    v_review.published_at,
    v_review.admin_note;
end;
$$;

create or replace function public.get_public_reviews(
  p_limit integer default 12
)
returns table (
  id uuid,
  display_name text,
  rating smallint,
  message text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    r.id,
    r.display_name,
    r.rating,
    r.message,
    r.created_at
  from public.reviews r
  where r.status = 'approved'
  order by r.published_at desc nulls last, r.created_at desc
  limit least(greatest(coalesce(p_limit, 12), 1), 50);
$$;

create or replace function public.get_public_review_summary()
returns table (
  review_count integer,
  average_rating numeric
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    count(*)::integer,
    round(avg(r.rating)::numeric, 1)
  from public.reviews r
  where r.status = 'approved';
$$;

alter table public.review_invitations enable row level security;
alter table public.reviews enable row level security;

create policy "review_invitations_admin_select"
on public.review_invitations
for select
to authenticated
using (public.is_admin());

create policy "reviews_admin_select"
on public.reviews
for select
to authenticated
using (public.is_admin());

revoke all on table public.review_invitations from anon, authenticated;
revoke all on table public.reviews from anon, authenticated;
grant select on table public.review_invitations to authenticated;
grant select on table public.reviews to authenticated;

revoke all on function public.hash_review_token(text) from public, anon, authenticated;
revoke all on function public.admin_create_review_invitation(uuid) from public, anon;
revoke all on function public.get_public_review_invitation(text) from public;
revoke all on function public.submit_public_review(text, text, integer, text, boolean) from public;
revoke all on function public.admin_set_review_status(uuid, text, text) from public, anon;
revoke all on function public.get_public_reviews(integer) from public;
revoke all on function public.get_public_review_summary() from public;

grant execute on function public.admin_create_review_invitation(uuid) to authenticated;
grant execute on function public.get_public_review_invitation(text) to anon, authenticated;
grant execute on function public.submit_public_review(text, text, integer, text, boolean) to anon, authenticated;
grant execute on function public.admin_set_review_status(uuid, text, text) to authenticated;
grant execute on function public.get_public_reviews(integer) to anon, authenticated;
grant execute on function public.get_public_review_summary() to anon, authenticated;
