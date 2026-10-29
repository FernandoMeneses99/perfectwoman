begin;

select plan(4);

select is(
  public.normalize_phone('302 409 0623'),
  '+573024090623',
  'phone numbers are normalized to E.164'
);

select is(
  (select count(*)::int from public.get_public_services()),
  4,
  'four public services are available'
);

select is(
  (select auto_confirm from public.settings where id),
  false,
  'bookings require admin confirmation'
);

insert into public.clients (full_name, phone)
values ('Cliente Prueba', '3001234567');

insert into public.appointments (
  professional_id,
  service_id,
  client_id,
  starts_at,
  status
)
select
  p.id,
  s.id,
  c.id,
  timestamptz '2026-11-02 10:00:00-05',
  'pending'
from public.professionals p
cross join public.services s
cross join public.clients c
where p.slug = 'tathiana'
  and s.slug = 'diseno-laminado-cejas'
  and c.phone = '3001234567';

select throws_ok(
  $$insert into public.appointments (
      professional_id,
      service_id,
      client_id,
      starts_at,
      status
    )
    select
      p.id,
      s.id,
      c.id,
      timestamptz '2026-11-02 10:30:00-05',
      'pending'
    from public.professionals p
    cross join public.services s
    cross join public.clients c
    where p.slug = 'tathiana'
      and s.slug = 'diseno-laminado-cejas'
      and c.phone = '3001234567'$$,
  '23P01',
  'conflicting key value violates exclusion constraint "appointments_no_overlap"',
  'overlapping appointments are rejected'
);

select * from finish();

rollback;
