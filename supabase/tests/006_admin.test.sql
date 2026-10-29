begin;

select plan(12);

insert into auth.users (
  id,
  email,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  '00000000-0000-4000-8000-000000000001',
  'admin-test@perfectwoman.local',
  '{}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

insert into auth.users (
  id,
  email,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  '00000000-0000-4000-8000-000000000002',
  'not-admin-test@perfectwoman.local',
  '{}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

insert into public.admin_users (user_id, email, display_name)
values (
  '00000000-0000-4000-8000-000000000001',
  'admin-test@perfectwoman.local',
  'Admin de prueba'
);

insert into public.clients (id, full_name, phone)
values (
  '00000000-0000-4000-8000-000000000201',
  'Cliente Admin Test',
  '3009990001'
);

insert into public.appointments (
  id,
  professional_id,
  service_id,
  client_id,
  starts_at,
  status,
  source
)
select
  '00000000-0000-4000-8000-000000000101',
  p.id,
  s.id,
  c.id,
  ((current_date + 14) + time '15:00') at time zone 'America/Bogota',
  'pending',
  'admin'
from public.professionals p
join public.services s on s.slug = 'diseno-laminado-cejas'
cross join public.clients c
where p.slug = 'tathiana'
  and c.id = '00000000-0000-4000-8000-000000000201';

insert into public.appointments (
  id,
  professional_id,
  service_id,
  client_id,
  starts_at,
  status,
  source
)
select
  '00000000-0000-4000-8000-000000000102',
  p.id,
  s.id,
  c.id,
  ((current_date + 14) + time '16:00') at time zone 'America/Bogota',
  'pending',
  'admin'
from public.professionals p
join public.services s on s.slug = 'diseno-laminado-cejas'
cross join public.clients c
where p.slug = 'tathiana'
  and c.id = '00000000-0000-4000-8000-000000000201';

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","email":"admin-test@perfectwoman.local"}',
  true
);
set local role authenticated;

select is(public.is_admin(), true, 'the test user is an admin');

select is(
  (
    select status
    from public.admin_set_appointment_status(
      '00000000-0000-4000-8000-000000000101',
      'confirmed'
    )
  ),
  'confirmed',
  'an admin can confirm a pending appointment'
);

select ok(
  (
    select confirmed_at is not null
    from public.appointments
    where id = '00000000-0000-4000-8000-000000000101'
  ),
  'confirming sets confirmed_at'
);

select is(
  (
    select count(*)::int
    from public.audit_log
    where entity_id = '00000000-0000-4000-8000-000000000101'
      and action = 'appointment_status_changed'
      and metadata->>'to' = 'confirmed'
  ),
  1,
  'status changes are audited'
);

select throws_ok(
  $$select * from public.admin_set_appointment_status(
    '00000000-0000-4000-8000-000000000101',
    'pending'
  )$$,
  'PT422',
  'INVALID_STATUS',
  'pending is not a valid admin status transition'
);

select is(
  (
    select status
    from public.admin_set_appointment_status(
      '00000000-0000-4000-8000-000000000101',
      'completed'
    )
  ),
  'completed',
  'an admin can complete a confirmed appointment'
);

select throws_ok(
  $$select * from public.admin_set_appointment_status(
    '00000000-0000-4000-8000-000000000101',
    'confirmed'
  )$$,
  'PT409',
  'INVALID_STATUS_TRANSITION',
  'a completed appointment cannot be reopened'
);

select throws_ok(
  $$select * from public.admin_set_appointment_status(
    '00000000-0000-4000-8000-000000000102',
    'cancelled'
  )$$,
  'PT422',
  'CANCELLATION_REASON_REQUIRED',
  'cancelling requires a reason'
);

select is(
  (
    select status
    from public.admin_set_appointment_status(
      '00000000-0000-4000-8000-000000000102',
      'cancelled',
      'La clienta necesita reprogramar'
    )
  ),
  'cancelled',
  'an admin can cancel an appointment with a reason'
);

select is(
  (
    select cancellation_reason
    from public.appointments
    where id = '00000000-0000-4000-8000-000000000102'
  ),
  'La clienta necesita reprogramar',
  'the cancellation reason is stored'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated","email":"not-admin-test@perfectwoman.local"}',
  true
);

select throws_ok(
  $$select * from public.admin_set_appointment_status(
    '00000000-0000-4000-8000-000000000101',
    'confirmed'
  )$$,
  '42501',
  'NOT_ADMIN',
  'a non-admin authenticated user is rejected'
);

reset role;
set local role anon;

select throws_ok(
  $$select * from public.admin_set_appointment_status(
    '00000000-0000-4000-8000-000000000101',
    'confirmed'
  )$$,
  '42501',
  null,
  'anon cannot execute the admin status function'
);

reset role;

select * from finish();

rollback;
