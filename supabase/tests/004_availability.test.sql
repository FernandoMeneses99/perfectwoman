begin;

select plan(8);

select is(
  (
    select count(*)::int
    from (
      select
        s.id as service_id,
        p.id as professional_id,
        (
          select d::date
          from generate_series(
            current_date + 7,
            current_date + 13,
            interval '1 day'
          ) as d
          where extract(dow from d) between 1 and 6
          order by d
          limit 1
        ) as test_day
      from public.services s
      join public.professionals p on p.slug = 'tathiana'
      where s.slug = 'diseno-laminado-cejas'
    ) params
    cross join lateral public.get_public_availability(
      params.service_id,
      params.professional_id,
      params.test_day,
      params.test_day
    )
  ),
  19,
  'a full working day yields 19 slots for a 40 minute service'
);

select is(
  (
    select min(slot_start)
    from (
      select
        s.id as service_id,
        p.id as professional_id,
        (
          select d::date
          from generate_series(
            current_date + 7,
            current_date + 13,
            interval '1 day'
          ) as d
          where extract(dow from d) between 1 and 6
          order by d
          limit 1
        ) as test_day
      from public.services s
      join public.professionals p on p.slug = 'tathiana'
      where s.slug = 'diseno-laminado-cejas'
    ) params
    cross join lateral public.get_public_availability(
      params.service_id,
      params.professional_id,
      params.test_day,
      params.test_day
    )
  ),
  (
    select (params.test_day + time '09:00') at time zone 'America/Bogota'
    from (
      select (
        select d::date
        from generate_series(
          current_date + 7,
          current_date + 13,
          interval '1 day'
        ) as d
        where extract(dow from d) between 1 and 6
        order by d
        limit 1
      ) as test_day
    ) params
  ),
  'the first slot starts at 09:00 in Bogota'
);

insert into public.clients (full_name, phone)
values ('Cliente Disponibilidad', '3005550001');

with params as (
  select
    s.id as service_id,
    p.id as professional_id,
    (
      select d::date
      from generate_series(
        current_date + 7,
        current_date + 13,
        interval '1 day'
      ) as d
      where extract(dow from d) between 1 and 6
      order by d
      limit 1
    ) as test_day
  from public.services s
  join public.professionals p on p.slug = 'tathiana'
  where s.slug = 'diseno-laminado-cejas'
)
insert into public.appointments (
  professional_id,
  service_id,
  client_id,
  starts_at,
  status
)
select
  params.professional_id,
  params.service_id,
  c.id,
  (params.test_day + time '10:00') at time zone 'America/Bogota',
  'pending'
from params
cross join public.clients c
where c.phone = '3005550001';

select is(
  (
    select count(*)::int
    from (
      select
        s.id as service_id,
        p.id as professional_id,
        (
          select d::date
          from generate_series(
            current_date + 7,
            current_date + 13,
            interval '1 day'
          ) as d
          where extract(dow from d) between 1 and 6
          order by d
          limit 1
        ) as test_day
      from public.services s
      join public.professionals p on p.slug = 'tathiana'
      where s.slug = 'diseno-laminado-cejas'
    ) params
    cross join lateral public.get_public_availability(
      params.service_id,
      params.professional_id,
      params.test_day,
      params.test_day
    )
    where slot_start = (params.test_day + time '10:00') at time zone 'America/Bogota'
  ),
  0,
  'a pending appointment blocks its slot'
);

with params as (
  select
    p.id as professional_id,
    (
      select d::date
      from generate_series(
        current_date + 7,
        current_date + 13,
        interval '1 day'
      ) as d
      where extract(dow from d) between 1 and 6
      order by d
      limit 1
    ) as test_day
  from public.professionals p
  where p.slug = 'tathiana'
)
insert into public.schedule_blocks (
  professional_id,
  starts_at,
  ends_at,
  reason
)
select
  params.professional_id,
  (params.test_day + time '15:00') at time zone 'America/Bogota',
  (params.test_day + time '16:00') at time zone 'America/Bogota',
  'Prueba de disponibilidad'
from params;

select is(
  (
    select count(*)::int
    from (
      select
        s.id as service_id,
        p.id as professional_id,
        (
          select d::date
          from generate_series(
            current_date + 7,
            current_date + 13,
            interval '1 day'
          ) as d
          where extract(dow from d) between 1 and 6
          order by d
          limit 1
        ) as test_day
      from public.services s
      join public.professionals p on p.slug = 'tathiana'
      where s.slug = 'diseno-laminado-cejas'
    ) params
    cross join lateral public.get_public_availability(
      params.service_id,
      params.professional_id,
      params.test_day,
      params.test_day
    )
    where slot_start = (params.test_day + time '15:00') at time zone 'America/Bogota'
  ),
  0,
  'a schedule block removes the affected slot'
);

with params as (
  select
    s.id as service_id,
    p.id as professional_id,
    (
      select d::date
      from generate_series(
        current_date + 7,
        current_date + 13,
        interval '1 day'
      ) as d
      where extract(dow from d) between 1 and 6
      order by d
      limit 1
    ) as test_day
  from public.services s
  join public.professionals p on p.slug = 'tathiana'
  where s.slug = 'diseno-laminado-cejas'
)
insert into public.appointments (
  professional_id,
  service_id,
  client_id,
  starts_at,
  status,
  cancelled_at
)
select
  params.professional_id,
  params.service_id,
  c.id,
  (params.test_day + time '11:00') at time zone 'America/Bogota',
  'cancelled',
  now()
from params
cross join public.clients c
where c.phone = '3005550001';

select is(
  (
    select count(*)::int
    from (
      select
        s.id as service_id,
        p.id as professional_id,
        (
          select d::date
          from generate_series(
            current_date + 7,
            current_date + 13,
            interval '1 day'
          ) as d
          where extract(dow from d) between 1 and 6
          order by d
          limit 1
        ) as test_day
      from public.services s
      join public.professionals p on p.slug = 'tathiana'
      where s.slug = 'diseno-laminado-cejas'
    ) params
    cross join lateral public.get_public_availability(
      params.service_id,
      params.professional_id,
      params.test_day,
      params.test_day
    )
    where slot_start = (params.test_day + time '11:00') at time zone 'America/Bogota'
  ),
  1,
  'a cancelled appointment does not block its slot'
);

select throws_ok(
  $$select * from public.get_public_availability(
      gen_random_uuid(),
      null,
      current_date + 7,
      current_date + 8
    )$$,
  'PT422',
  'SERVICE_NOT_AVAILABLE',
  'an unknown service is rejected'
);

select throws_ok(
  $$select * from public.get_public_availability(
      (select id from public.services where slug = 'diseno-laminado-cejas'),
      null,
      current_date,
      current_date + 70
    )$$,
  'PT422',
  'DATE_RANGE_TOO_LARGE',
  'a date range longer than 62 days is rejected'
);

select is(
  pg_get_function_result(
    'public.get_public_availability(uuid,uuid,date,date)'::regprocedure
  ) ~* '(client|email|phone|full_name)',
  false,
  'the availability result exposes no personal data'
);

select * from finish();

rollback;
