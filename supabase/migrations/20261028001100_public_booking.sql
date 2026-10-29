set search_path = public, extensions;

create or replace function public.get_public_booking_settings()
returns table (
  studio_name text,
  timezone text,
  slot_interval_minutes integer,
  min_notice_hours integer,
  max_advance_days integer,
  privacy_policy_version text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    s.studio_name,
    s.timezone,
    s.slot_interval_minutes,
    s.min_notice_hours,
    s.max_advance_days,
    s.privacy_policy_version
  from public.settings s
  where s.id = true;
$$;

create or replace function public.get_public_professionals()
returns table (
  id uuid,
  full_name text,
  slug text,
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
    p.sort_order
  from public.professionals p
  where p.active = true
  order by p.sort_order, p.created_at;
$$;

create or replace function public.create_public_booking(
  p_service_id uuid,
  p_starts_at timestamptz,
  p_full_name text,
  p_phone text,
  p_email text default null,
  p_notes text default null,
  p_consent boolean default false,
  p_policy_version text default null,
  p_professional_id uuid default null,
  p_idempotency_key uuid default null
)
returns table (
  appointment_id uuid,
  confirmation_code text,
  status text,
  starts_at timestamptz,
  service_ends_at timestamptz,
  service_name text,
  professional_name text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_settings public.settings%rowtype;
  v_service public.services%rowtype;
  v_professional public.professionals%rowtype;
  v_client public.clients%rowtype;
  v_existing public.appointments%rowtype;
  v_appointment public.appointments%rowtype;
  v_client_id uuid;
  v_key uuid;
  v_name text;
  v_phone text;
  v_email extensions.citext;
  v_notes text;
  v_ip_hash text;
  v_local_date date;
  v_slot_available boolean;
  v_email_taken boolean := false;
  v_email_conflict boolean := false;
  v_existing_phone text;
  v_existing_service_name text;
  v_existing_professional_name text;
  v_existing_duration integer;
  v_constraint text;
begin
  select * into v_settings
  from public.settings
  where id = true;

  if not found then
    raise exception 'SETTINGS_NOT_CONFIGURED' using errcode = 'PT500';
  end if;

  if p_starts_at is null then
    raise exception 'INVALID_SLOT' using errcode = 'PT422';
  end if;

  v_name := btrim(coalesce(p_full_name, ''));
  if length(v_name) < 2 or length(v_name) > 120 then
    raise exception 'INVALID_NAME' using errcode = 'PT422';
  end if;

  v_phone := public.normalize_phone(p_phone);
  if v_phone is null then
    raise exception 'INVALID_PHONE' using errcode = 'PT422';
  end if;

  if p_idempotency_key is not null then
    select * into v_existing
    from public.appointments
    where idempotency_key = p_idempotency_key;

    if found then
      select
        public.normalize_phone(c.phone),
        s.name,
        pr.full_name,
        s.duration_minutes
      into
        v_existing_phone,
        v_existing_service_name,
        v_existing_professional_name,
        v_existing_duration
      from public.appointments a
      join public.clients c on c.id = a.client_id
      join public.services s on s.id = a.service_id
      join public.professionals pr on pr.id = a.professional_id
      where a.id = v_existing.id;

      if v_existing_phone is distinct from v_phone
        or v_existing.service_id <> p_service_id
        or v_existing.starts_at <> p_starts_at then
        raise exception 'IDEMPOTENCY_CONFLICT' using errcode = 'PT409';
      end if;

      return query
      select
        v_existing.id,
        v_existing.confirmation_code,
        v_existing.status::text,
        v_existing.starts_at,
        v_existing.starts_at + make_interval(mins => v_existing_duration),
        v_existing_service_name,
        v_existing_professional_name;

      return;
    end if;
  end if;

  v_ip_hash := public.hash_request_ip();

  if not public.consume_rate_limit('booking:' || v_ip_hash, 3, 600) then
    raise exception 'RATE_LIMITED' using errcode = 'PT429';
  end if;

  if p_consent is not true then
    raise exception 'CONSENT_REQUIRED' using errcode = 'PT422';
  end if;

  if btrim(coalesce(p_policy_version, '')) <> v_settings.privacy_policy_version then
    raise exception 'POLICY_VERSION_MISMATCH' using errcode = 'PT422';
  end if;

  v_email := nullif(btrim(coalesce(p_email, '')), '')::extensions.citext;
  if v_email is not null and v_email::text !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'INVALID_EMAIL' using errcode = 'PT422';
  end if;

  v_notes := nullif(btrim(coalesce(p_notes, '')), '');
  if v_notes is not null and length(v_notes) > 2000 then
    raise exception 'INVALID_NOTES' using errcode = 'PT422';
  end if;

  select * into v_service
  from public.services
  where id = p_service_id
    and active = true;

  if not found then
    raise exception 'SERVICE_NOT_AVAILABLE' using errcode = 'PT422';
  end if;

  if p_professional_id is not null then
    select * into v_professional
    from public.professionals
    where id = p_professional_id
      and active = true;

    if not found then
      raise exception 'PROFESSIONAL_NOT_AVAILABLE' using errcode = 'PT422';
    end if;
  else
    select * into v_professional
    from public.professionals
    where active = true
    order by sort_order, created_at
    limit 1;

    if not found then
      raise exception 'PROFESSIONAL_NOT_AVAILABLE' using errcode = 'PT422';
    end if;
  end if;

  v_local_date := (p_starts_at at time zone v_settings.timezone)::date;

  select exists (
    select 1
    from public.get_public_availability(
      v_service.id,
      v_professional.id,
      v_local_date,
      v_local_date
    ) slot
    where slot.slot_start = p_starts_at
  ) into v_slot_available;

  if not v_slot_available then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'PT409';
  end if;

  select * into v_client
  from public.clients
  where public.normalize_phone(phone) = v_phone
  limit 1;

  if found then
    v_client_id := v_client.id;

    if v_email is not null then
      if v_client.email is null then
        select exists (
          select 1
          from public.clients
          where email = v_email
            and id <> v_client_id
        ) into v_email_taken;

        if not v_email_taken then
          begin
            update public.clients
            set email = v_email
            where id = v_client_id
              and email is null;
          exception
            when unique_violation then
              v_email_taken := true;
          end;
        end if;

        if v_email_taken then
          v_email_conflict := true;
        end if;
      elsif v_client.email <> v_email then
        select exists (
          select 1
          from public.clients
          where email = v_email
            and id <> v_client_id
        ) into v_email_taken;

        if v_email_taken then
          v_email_conflict := true;
        end if;
      end if;
    end if;
  else
    if v_email is not null then
      select exists (
        select 1
        from public.clients
        where email = v_email
      ) into v_email_taken;

      if v_email_taken then
        v_email := null;
        v_email_conflict := true;
      end if;
    end if;

    begin
      insert into public.clients (full_name, phone, email)
      values (v_name, v_phone, v_email)
      on conflict do nothing
      returning id into v_client_id;
    exception
      when unique_violation then
        v_client_id := null;
    end;

    if v_client_id is null then
      select id into v_client_id
      from public.clients
      where public.normalize_phone(phone) = v_phone;
    end if;

    if v_client_id is null and v_email is not null then
      begin
        insert into public.clients (full_name, phone, email)
        values (v_name, v_phone, null)
        on conflict do nothing
        returning id into v_client_id;
      exception
        when unique_violation then
          v_client_id := null;
      end;

      if v_client_id is null then
        select id into v_client_id
        from public.clients
        where public.normalize_phone(phone) = v_phone;
      end if;

      if v_client_id is not null then
        v_email_conflict := true;
      end if;
    end if;

    if v_client_id is null then
      raise exception 'CLIENT_CREATE_FAILED' using errcode = 'PT500';
    end if;
  end if;

  if v_email_conflict then
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
      'client_email_conflict',
      'client',
      v_client_id::text,
      jsonb_build_object(
        'reason', 'email_belongs_to_another_client',
        'source', 'public_booking'
      ),
      v_ip_hash
    );
  end if;

  v_key := coalesce(p_idempotency_key, gen_random_uuid());

  begin
    insert into public.appointments (
      professional_id,
      service_id,
      client_id,
      starts_at,
      status,
      source,
      idempotency_key,
      notes
    )
    values (
      v_professional.id,
      v_service.id,
      v_client_id,
      p_starts_at,
      'pending',
      'public',
      v_key,
      v_notes
    )
    returning * into v_appointment;
  exception
    when exclusion_violation then
      raise exception 'SLOT_UNAVAILABLE' using errcode = 'PT409';
    when unique_violation then
      get stacked diagnostics v_constraint = constraint_name;

      if v_constraint = 'appointments_idempotency_key_uidx' then
        select * into v_existing
        from public.appointments
        where idempotency_key = v_key;

        if found then
          select
            public.normalize_phone(c.phone),
            s.name,
            pr.full_name,
            s.duration_minutes
          into
            v_existing_phone,
            v_existing_service_name,
            v_existing_professional_name,
            v_existing_duration
          from public.appointments a
          join public.clients c on c.id = a.client_id
          join public.services s on s.id = a.service_id
          join public.professionals pr on pr.id = a.professional_id
          where a.id = v_existing.id;

          if v_existing_phone is not distinct from v_phone
            and v_existing.service_id = p_service_id
            and v_existing.starts_at = p_starts_at then
            return query
            select
              v_existing.id,
              v_existing.confirmation_code,
              v_existing.status::text,
              v_existing.starts_at,
              v_existing.starts_at + make_interval(mins => v_existing_duration),
              v_existing_service_name,
              v_existing_professional_name;

            return;
          end if;
        end if;

        raise exception 'IDEMPOTENCY_CONFLICT' using errcode = 'PT409';
      end if;

      raise exception 'SLOT_UNAVAILABLE' using errcode = 'PT409';
  end;

  insert into public.client_consents (
    client_id,
    policy_version,
    source,
    ip_hash
  )
  values (
    v_client_id,
    v_settings.privacy_policy_version,
    'public_booking',
    v_ip_hash
  )
  on conflict (client_id, policy_version) do nothing;

  update public.clients
  set last_booking_at = greatest(coalesce(last_booking_at, p_starts_at), p_starts_at)
  where id = v_client_id;

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
    'booking_created',
    'appointment',
    v_appointment.id::text,
    jsonb_build_object(
      'source', 'public',
      'confirmation_code', v_appointment.confirmation_code,
      'service_id', v_service.id,
      'professional_id', v_professional.id
    ),
    v_ip_hash
  );

  return query
  select
    v_appointment.id,
    v_appointment.confirmation_code,
    v_appointment.status::text,
    v_appointment.starts_at,
    v_appointment.starts_at + make_interval(mins => v_service.duration_minutes),
    v_service.name,
    v_professional.full_name;
end;
$$;

revoke all on function public.get_public_booking_settings() from public;
revoke all on function public.get_public_professionals() from public;
revoke all on function public.create_public_booking(
  uuid,
  timestamptz,
  text,
  text,
  text,
  text,
  boolean,
  text,
  uuid,
  uuid
) from public;

grant execute on function public.get_public_booking_settings() to anon, authenticated;
grant execute on function public.get_public_professionals() to anon, authenticated;
grant execute on function public.create_public_booking(
  uuid,
  timestamptz,
  text,
  text,
  text,
  text,
  boolean,
  text,
  uuid,
  uuid
) to anon, authenticated;
