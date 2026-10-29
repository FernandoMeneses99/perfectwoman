set search_path = public, extensions;

create or replace function public.get_public_availability(
  p_service_id uuid,
  p_professional_id uuid default null,
  p_from date default null,
  p_to date default null
)
returns table (
  slot_date date,
  slot_start timestamptz,
  slot_end timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_service public.services%rowtype;
  v_settings public.settings%rowtype;
  v_professional_id uuid;
begin
  if p_from is null or p_to is null then
    raise exception 'INVALID_DATE_RANGE' using errcode = 'PT422';
  end if;

  if p_to < p_from then
    raise exception 'INVALID_DATE_RANGE' using errcode = 'PT422';
  end if;

  if p_to - p_from > 62 then
    raise exception 'DATE_RANGE_TOO_LARGE' using errcode = 'PT422';
  end if;

  select * into v_settings
  from public.settings
  where id = true;

  if not found then
    raise exception 'SETTINGS_NOT_CONFIGURED' using errcode = 'PT500';
  end if;

  select * into v_service
  from public.services
  where id = p_service_id
    and active = true;

  if not found then
    raise exception 'SERVICE_NOT_AVAILABLE' using errcode = 'PT422';
  end if;

  if p_professional_id is not null then
    select pr.id into v_professional_id
    from public.professionals pr
    where pr.id = p_professional_id
      and pr.active = true;

    if v_professional_id is null then
      raise exception 'PROFESSIONAL_NOT_AVAILABLE' using errcode = 'PT422';
    end if;
  else
    select pr.id into v_professional_id
    from public.professionals pr
    where pr.active = true
    order by pr.sort_order, pr.created_at
    limit 1;
  end if;

  if v_professional_id is null then
    return;
  end if;

  return query
  with days as (
    select d::date as day
    from generate_series(
      p_from::timestamp,
      p_to::timestamp,
      interval '1 day'
    ) as d
  ),
  open_ranges as (
    select
      days.day,
      days.day + bh.opens_at as local_opens,
      days.day + bh.closes_at as local_closes
    from days
    join public.business_hours bh
      on bh.professional_id = v_professional_id
     and bh.active = true
     and bh.weekday = extract(dow from days.day)
     and (bh.valid_from is null or days.day >= bh.valid_from)
     and (bh.valid_to is null or days.day <= bh.valid_to)
  ),
  candidates as (
    select
      open_ranges.day,
      candidate as local_start
    from open_ranges
    cross join lateral generate_series(
      open_ranges.local_opens + make_interval(mins => v_service.buffer_before_minutes),
      open_ranges.local_closes - make_interval(
        mins => v_service.duration_minutes + v_service.buffer_after_minutes
      ),
      make_interval(mins => v_settings.slot_interval_minutes)
    ) as candidate
  ),
  resolved as (
    select
      candidates.day,
      candidates.local_start at time zone v_settings.timezone as slot_start,
      (candidates.local_start at time zone v_settings.timezone)
        + make_interval(mins => v_service.duration_minutes) as slot_end,
      (candidates.local_start at time zone v_settings.timezone)
        - make_interval(mins => v_service.buffer_before_minutes) as block_start,
      (candidates.local_start at time zone v_settings.timezone)
        + make_interval(
          mins => v_service.duration_minutes + v_service.buffer_after_minutes
        ) as block_end
    from candidates
  )
  select distinct
    resolved.day,
    resolved.slot_start,
    resolved.slot_end
  from resolved
  where resolved.slot_start >= now() + make_interval(hours => v_settings.min_notice_hours)
    and resolved.slot_start <= now() + make_interval(days => v_settings.max_advance_days)
    and not exists (
      select 1
      from public.schedule_blocks block
      where (block.professional_id is null or block.professional_id = v_professional_id)
        and tstzrange(block.starts_at, block.ends_at, '[)')
          && tstzrange(resolved.block_start, resolved.block_end, '[)')
    )
    and not exists (
      select 1
      from public.appointments appointment
      join public.services booked_service
        on booked_service.id = appointment.service_id
      where appointment.professional_id = v_professional_id
        and appointment.status in ('pending', 'confirmed')
        and tstzrange(
          appointment.starts_at
            - make_interval(mins => booked_service.buffer_before_minutes),
          appointment.ends_at,
          '[)'
        ) && tstzrange(resolved.block_start, resolved.block_end, '[)')
    )
  order by resolved.slot_start;
end;
$$;

revoke all on function public.get_public_availability(uuid, uuid, date, date) from public;
grant execute on function public.get_public_availability(uuid, uuid, date, date) to anon, authenticated;
