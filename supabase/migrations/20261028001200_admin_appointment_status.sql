set search_path = public, extensions;

create or replace function public.admin_set_appointment_status(
  p_appointment_id uuid,
  p_status text,
  p_reason text default null
)
returns table (
  appointment_id uuid,
  status text,
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
  v_previous_status text;
  v_reason text;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN' using errcode = '42501';
  end if;

  if p_status is null or p_status not in ('confirmed', 'completed', 'cancelled', 'no_show') then
    raise exception 'INVALID_STATUS' using errcode = 'PT422';
  end if;

  v_reason := nullif(btrim(coalesce(p_reason, '')), '');
  if v_reason is not null and length(v_reason) > 500 then
    raise exception 'INVALID_REASON' using errcode = 'PT422';
  end if;

  select *
  into v_appointment
  from public.appointments
  where id = p_appointment_id
  for update;

  if not found then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'PT404';
  end if;

  v_previous_status := v_appointment.status::text;

  if v_previous_status in ('completed', 'cancelled', 'no_show')
    and p_status <> v_previous_status then
    raise exception 'INVALID_STATUS_TRANSITION' using errcode = 'PT409';
  end if;

  if p_status = 'cancelled' and v_reason is null then
    raise exception 'CANCELLATION_REASON_REQUIRED' using errcode = 'PT422';
  end if;

  update public.appointments
  set
    status = p_status::public.appointment_status,
    confirmed_at = case
      when p_status = 'confirmed' then coalesce(v_appointment.confirmed_at, now())
      else v_appointment.confirmed_at
    end,
    completed_at = case
      when p_status = 'completed' then coalesce(v_appointment.completed_at, now())
      else v_appointment.completed_at
    end,
    cancelled_at = case
      when p_status = 'cancelled' then coalesce(v_appointment.cancelled_at, now())
      else v_appointment.cancelled_at
    end,
    cancellation_reason = case
      when p_status = 'cancelled' then v_reason
      else v_appointment.cancellation_reason
    end
  where id = p_appointment_id
  returning * into v_appointment;

  insert into public.audit_log (
    actor_user_id,
    action,
    entity,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    'appointment_status_changed',
    'appointment',
    v_appointment.id::text,
    jsonb_build_object(
      'from', v_previous_status,
      'to', p_status,
      'reason', v_reason
    )
  );

  return query
  select
    v_appointment.id,
    v_appointment.status::text,
    v_appointment.confirmed_at,
    v_appointment.completed_at,
    v_appointment.cancelled_at,
    v_appointment.cancellation_reason;
end;
$$;

revoke all on function public.admin_set_appointment_status(uuid, text, text) from public;
grant execute on function public.admin_set_appointment_status(uuid, text, text) to authenticated;
