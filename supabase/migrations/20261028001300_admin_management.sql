set search_path = public, extensions;

create or replace function public.admin_slot_is_available(
  p_service_id uuid,
  p_professional_id uuid,
  p_starts_at timestamptz,
  p_exclude_appointment_id uuid default null
)
returns boolean
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_settings public.settings%rowtype;
  v_service public.services%rowtype;
  v_professional public.professionals%rowtype;
  v_local_start timestamp;
  v_local_date date;
  v_weekday smallint;
begin
  if p_service_id is null or p_professional_id is null or p_starts_at is null then
    return false;
  end if;

  select * into v_settings
  from public.settings
  where id = true;

  if not found then
    return false;
  end if;

  select * into v_service
  from public.services
  where id = p_service_id;

  if not found then
    return false;
  end if;

  select * into v_professional
  from public.professionals
  where id = p_professional_id
    and active = true;

  if not found then
    return false;
  end if;

  if p_starts_at < now() + make_interval(hours => v_settings.min_notice_hours)
    or p_starts_at > now() + make_interval(days => v_settings.max_advance_days) then
    return false;
  end if;

  v_local_start := p_starts_at at time zone v_settings.timezone;
  v_local_date := v_local_start::date;
  v_weekday := extract(dow from v_local_date)::smallint;

  if not exists (
    select 1
    from public.business_hours bh
    where bh.professional_id = v_professional.id
      and bh.active = true
      and bh.weekday = v_weekday
      and (bh.valid_from is null or v_local_date >= bh.valid_from)
      and (bh.valid_to is null or v_local_date <= bh.valid_to)
      and v_local_start >= v_local_date + bh.opens_at
        + make_interval(mins => v_service.buffer_before_minutes)
      and v_local_start + make_interval(
        mins => v_service.duration_minutes + v_service.buffer_after_minutes
      ) <= v_local_date + bh.closes_at
  ) then
    return false;
  end if;

  if exists (
    select 1
    from public.schedule_blocks block
    where (block.professional_id is null or block.professional_id = v_professional.id)
      and tstzrange(block.starts_at, block.ends_at, '[)')
        && tstzrange(
          p_starts_at - make_interval(mins => v_service.buffer_before_minutes),
          p_starts_at + make_interval(
            mins => v_service.duration_minutes + v_service.buffer_after_minutes
          ),
          '[)'
        )
  ) then
    return false;
  end if;

  if exists (
    select 1
    from public.appointments appointment
    join public.services booked_service
      on booked_service.id = appointment.service_id
    where appointment.professional_id = v_professional.id
      and appointment.status in ('pending', 'confirmed')
      and (
        p_exclude_appointment_id is null
        or appointment.id <> p_exclude_appointment_id
      )
      and tstzrange(
        appointment.starts_at
          - make_interval(mins => booked_service.buffer_before_minutes),
        appointment.ends_at,
        '[)'
      ) && tstzrange(
        p_starts_at - make_interval(mins => v_service.buffer_before_minutes),
        p_starts_at + make_interval(
          mins => v_service.duration_minutes + v_service.buffer_after_minutes
        ),
        '[)'
      )
  ) then
    return false;
  end if;

  return true;
end;
$$;

create or replace function public.admin_reschedule_appointment(
  p_appointment_id uuid,
  p_starts_at timestamptz
)
returns table (
  appointment_id uuid,
  status text,
  starts_at timestamptz,
  ends_at timestamptz,
  confirmed_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_appointment public.appointments%rowtype;
  v_previous_start timestamptz;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN' using errcode = '42501';
  end if;

  if p_starts_at is null then
    raise exception 'INVALID_SLOT' using errcode = 'PT422';
  end if;

  select * into v_appointment
  from public.appointments
  where id = p_appointment_id
  for update;

  if not found then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'PT404';
  end if;

  if v_appointment.status in ('completed', 'cancelled', 'no_show') then
    raise exception 'INVALID_STATUS_TRANSITION' using errcode = 'PT409';
  end if;

  if v_appointment.starts_at <> p_starts_at then
    if not public.admin_slot_is_available(
      v_appointment.service_id,
      v_appointment.professional_id,
      p_starts_at,
      v_appointment.id
    ) then
      raise exception 'SLOT_UNAVAILABLE' using errcode = 'PT409';
    end if;

    v_previous_start := v_appointment.starts_at;

    begin
      update public.appointments
      set starts_at = p_starts_at
      where id = p_appointment_id
      returning * into v_appointment;
    exception
      when exclusion_violation then
        raise exception 'SLOT_UNAVAILABLE' using errcode = 'PT409';
    end;

    insert into public.audit_log (
      actor_user_id,
      action,
      entity,
      entity_id,
      metadata
    )
    values (
      auth.uid(),
      'appointment_rescheduled',
      'appointment',
      v_appointment.id::text,
      jsonb_build_object(
        'from', v_previous_start,
        'to', v_appointment.starts_at
      )
    );
  end if;

  return query
  select
    v_appointment.id,
    v_appointment.status::text,
    v_appointment.starts_at,
    v_appointment.ends_at,
    v_appointment.confirmed_at,
    v_appointment.completed_at,
    v_appointment.cancelled_at,
    v_appointment.cancellation_reason;
end;
$$;

create or replace function public.admin_create_appointment(
  p_service_id uuid,
  p_professional_id uuid,
  p_starts_at timestamptz,
  p_full_name text,
  p_phone text,
  p_email text default null,
  p_notes text default null,
  p_admin_notes text default null,
  p_status text default 'confirmed'
)
returns table (
  appointment_id uuid,
  confirmation_code text,
  status text,
  starts_at timestamptz,
  ends_at timestamptz,
  service_name text,
  professional_name text,
  client_name text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_service public.services%rowtype;
  v_professional public.professionals%rowtype;
  v_client public.clients%rowtype;
  v_appointment public.appointments%rowtype;
  v_client_id uuid;
  v_name text;
  v_phone text;
  v_email extensions.citext;
  v_notes text;
  v_admin_notes text;
  v_email_taken boolean := false;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN' using errcode = '42501';
  end if;

  if p_starts_at is null then
    raise exception 'INVALID_SLOT' using errcode = 'PT422';
  end if;

  if p_status is null or p_status not in ('pending', 'confirmed') then
    raise exception 'INVALID_STATUS' using errcode = 'PT422';
  end if;

  v_name := btrim(coalesce(p_full_name, ''));
  if length(v_name) < 2 or length(v_name) > 120 then
    raise exception 'INVALID_NAME' using errcode = 'PT422';
  end if;

  v_phone := public.normalize_phone(p_phone);
  if v_phone is null then
    raise exception 'INVALID_PHONE' using errcode = 'PT422';
  end if;

  v_email := nullif(btrim(coalesce(p_email, '')), '')::extensions.citext;
  if v_email is not null
    and v_email::text !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'INVALID_EMAIL' using errcode = 'PT422';
  end if;

  v_notes := nullif(btrim(coalesce(p_notes, '')), '');
  if v_notes is not null and length(v_notes) > 2000 then
    raise exception 'INVALID_NOTES' using errcode = 'PT422';
  end if;

  v_admin_notes := nullif(btrim(coalesce(p_admin_notes, '')), '');
  if v_admin_notes is not null and length(v_admin_notes) > 2000 then
    raise exception 'INVALID_NOTES' using errcode = 'PT422';
  end if;

  select * into v_service
  from public.services
  where id = p_service_id
    and active = true;

  if not found then
    raise exception 'SERVICE_NOT_AVAILABLE' using errcode = 'PT422';
  end if;

  select * into v_professional
  from public.professionals
  where id = p_professional_id
    and active = true;

  if not found then
    raise exception 'PROFESSIONAL_NOT_AVAILABLE' using errcode = 'PT422';
  end if;

  if not public.admin_slot_is_available(
    v_service.id,
    v_professional.id,
    p_starts_at,
    null
  ) then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'PT409';
  end if;

  select * into v_client
  from public.clients
  where public.normalize_phone(phone) = v_phone
  for update;

  if found then
    v_client_id := v_client.id;

    if v_email is not null and v_client.email is distinct from v_email then
      select exists (
        select 1
        from public.clients
        where email = v_email
          and id <> v_client_id
      ) into v_email_taken;

      if v_email_taken then
        raise exception 'EMAIL_IN_USE' using errcode = 'PT409';
      end if;
    end if;

    begin
      update public.clients
      set full_name = v_name,
          email = coalesce(v_email, email)
      where id = v_client_id;
    exception
      when unique_violation then
        raise exception 'EMAIL_IN_USE' using errcode = 'PT409';
    end;
  else
    if v_email is not null then
      select exists (
        select 1
        from public.clients
        where email = v_email
      ) into v_email_taken;

      if v_email_taken then
        raise exception 'EMAIL_IN_USE' using errcode = 'PT409';
      end if;
    end if;

    begin
      insert into public.clients (full_name, phone, email)
      values (v_name, v_phone, v_email)
      returning id into v_client_id;
    exception
      when unique_violation then
        raise exception 'EMAIL_IN_USE' using errcode = 'PT409';
    end;
  end if;

  begin
    insert into public.appointments (
      professional_id,
      service_id,
      client_id,
      starts_at,
      status,
      source,
      notes,
      admin_notes,
      confirmed_at,
      created_by
    )
    values (
      v_professional.id,
      v_service.id,
      v_client_id,
      p_starts_at,
      p_status::public.appointment_status,
      'admin',
      v_notes,
      v_admin_notes,
      case when p_status = 'confirmed' then now() else null end,
      auth.uid()
    )
    returning * into v_appointment;
  exception
    when exclusion_violation then
      raise exception 'SLOT_UNAVAILABLE' using errcode = 'PT409';
  end;

  update public.clients
  set last_booking_at = greatest(
    coalesce(last_booking_at, p_starts_at),
    p_starts_at
  )
  where id = v_client_id;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    'appointment_created',
    'appointment',
    v_appointment.id::text,
    jsonb_build_object(
      'source', 'admin',
      'confirmation_code', v_appointment.confirmation_code,
      'service_id', v_service.id,
      'professional_id', v_professional.id
    )
  );

  return query
  select
    v_appointment.id,
    v_appointment.confirmation_code,
    v_appointment.status::text,
    v_appointment.starts_at,
    v_appointment.ends_at,
    v_service.name,
    v_professional.full_name,
    v_name;
end;
$$;

create or replace function public.admin_update_appointment_notes(
  p_appointment_id uuid,
  p_admin_notes text
)
returns table (
  appointment_id uuid,
  admin_notes text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_notes text;
  v_appointment_id uuid;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN' using errcode = '42501';
  end if;

  v_notes := nullif(btrim(coalesce(p_admin_notes, '')), '');
  if v_notes is not null and length(v_notes) > 2000 then
    raise exception 'INVALID_NOTES' using errcode = 'PT422';
  end if;

  update public.appointments as appointment
  set admin_notes = v_notes
  where appointment.id = p_appointment_id
  returning appointment.id, appointment.admin_notes
  into v_appointment_id, v_notes;

  if not found then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'PT404';
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
    'appointment_notes_updated',
    'appointment',
    v_appointment_id::text,
    jsonb_build_object('has_notes', v_notes is not null)
  );

  return query
  select v_appointment_id, v_notes;
end;
$$;

create or replace function public.admin_create_schedule_block(
  p_professional_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_reason text default null
)
returns table (
  block_id uuid,
  starts_at timestamptz,
  ends_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_block public.schedule_blocks%rowtype;
  v_reason text;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN' using errcode = '42501';
  end if;

  if p_starts_at is null or p_ends_at is null or p_ends_at <= p_starts_at then
    raise exception 'INVALID_DATE_RANGE' using errcode = 'PT422';
  end if;

  v_reason := nullif(btrim(coalesce(p_reason, '')), '');
  if v_reason is not null and length(v_reason) > 500 then
    raise exception 'INVALID_REASON' using errcode = 'PT422';
  end if;

  if p_professional_id is not null then
    if not exists (
      select 1
      from public.professionals
      where id = p_professional_id
        and active = true
    ) then
      raise exception 'PROFESSIONAL_NOT_AVAILABLE' using errcode = 'PT422';
    end if;
  end if;

  if exists (
    select 1
    from public.appointments appointment
    join public.services booked_service
      on booked_service.id = appointment.service_id
    where appointment.status in ('pending', 'confirmed')
      and (
        p_professional_id is null
        or appointment.professional_id = p_professional_id
      )
      and tstzrange(
        appointment.starts_at
          - make_interval(mins => booked_service.buffer_before_minutes),
        appointment.ends_at,
        '[)'
      ) && tstzrange(p_starts_at, p_ends_at, '[)')
  ) then
    raise exception 'BLOCK_OVERLAPS_APPOINTMENT' using errcode = 'PT409';
  end if;

  insert into public.schedule_blocks (
    professional_id,
    starts_at,
    ends_at,
    reason,
    created_by
  )
  values (
    p_professional_id,
    p_starts_at,
    p_ends_at,
    v_reason,
    auth.uid()
  )
  returning * into v_block;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    'schedule_block_created',
    'schedule_block',
    v_block.id::text,
    jsonb_build_object(
      'professional_id', v_block.professional_id,
      'starts_at', v_block.starts_at,
      'ends_at', v_block.ends_at
    )
  );

  return query
  select v_block.id, v_block.starts_at, v_block.ends_at;
end;
$$;

create or replace function public.admin_delete_schedule_block(
  p_block_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_block public.schedule_blocks%rowtype;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN' using errcode = '42501';
  end if;

  delete from public.schedule_blocks
  where id = p_block_id
  returning * into v_block;

  if not found then
    raise exception 'BLOCK_NOT_FOUND' using errcode = 'PT404';
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
    'schedule_block_deleted',
    'schedule_block',
    v_block.id::text,
    jsonb_build_object(
      'professional_id', v_block.professional_id,
      'starts_at', v_block.starts_at,
      'ends_at', v_block.ends_at
    )
  );
end;
$$;

create or replace function public.admin_list_admin_users()
returns table (
  user_id uuid,
  email extensions.citext,
  display_name text,
  active boolean,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN' using errcode = '42501';
  end if;

  return query
  select
    au.user_id,
    au.email,
    au.display_name,
    au.active,
    au.created_at
  from public.admin_users au
  order by au.active desc, au.created_at;
end;
$$;

create or replace function public.admin_upsert_admin_user(
  p_email text,
  p_display_name text default null,
  p_active boolean default true
)
returns table (
  user_id uuid,
  email extensions.citext,
  display_name text,
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
  v_admin public.admin_users%rowtype;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN' using errcode = '42501';
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

  select users.id into v_user_id
  from auth.users users
  where lower(users.email) = lower(v_email::text)
  limit 1;

  if v_user_id is null then
    raise exception 'AUTH_USER_NOT_FOUND' using errcode = 'PT404';
  end if;

  if v_user_id = auth.uid() and p_active is not true then
    raise exception 'CANNOT_DEACTIVATE_SELF' using errcode = 'PT409';
  end if;

  insert into public.admin_users (
    user_id,
    email,
    display_name,
    active
  )
  values (
    v_user_id,
    v_email,
    v_display_name,
    coalesce(p_active, true)
  )
  on conflict on constraint admin_users_pkey do update
  set email = excluded.email,
      display_name = excluded.display_name,
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
      'active', v_admin.active
    )
  );

  return query
  select
    v_admin.user_id,
    v_admin.email,
    v_admin.display_name,
    v_admin.active;
end;
$$;

revoke all on function public.admin_slot_is_available(uuid, uuid, timestamptz, uuid) from public;
revoke all on function public.admin_reschedule_appointment(uuid, timestamptz) from public;
revoke all on function public.admin_create_appointment(
  uuid,
  uuid,
  timestamptz,
  text,
  text,
  text,
  text,
  text,
  text
) from public;
revoke all on function public.admin_update_appointment_notes(uuid, text) from public;
revoke all on function public.admin_create_schedule_block(uuid, timestamptz, timestamptz, text) from public;
revoke all on function public.admin_delete_schedule_block(uuid) from public;
revoke all on function public.admin_list_admin_users() from public;
revoke all on function public.admin_upsert_admin_user(text, text, boolean) from public;

grant execute on function public.admin_reschedule_appointment(uuid, timestamptz) to authenticated;
grant execute on function public.admin_create_appointment(
  uuid,
  uuid,
  timestamptz,
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;
grant execute on function public.admin_update_appointment_notes(uuid, text) to authenticated;
grant execute on function public.admin_create_schedule_block(uuid, timestamptz, timestamptz, text) to authenticated;
grant execute on function public.admin_delete_schedule_block(uuid) to authenticated;
grant execute on function public.admin_list_admin_users() to authenticated;
grant execute on function public.admin_upsert_admin_user(text, text, boolean) to authenticated;
