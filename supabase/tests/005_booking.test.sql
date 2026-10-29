begin;

select plan(26);

create temp table booking_params as
select
  s.id as service_id,
  p.id as professional_id,
  d.test_day,
  (d.test_day + time '09:00') at time zone 'America/Bogota' as slot_09,
  (d.test_day + time '10:00') at time zone 'America/Bogota' as slot_10,
  (d.test_day + time '11:00') at time zone 'America/Bogota' as slot_11,
  (d.test_day + time '12:00') at time zone 'America/Bogota' as slot_12,
  (d.test_day + time '13:00') at time zone 'America/Bogota' as slot_13,
  (d.test_day + time '14:00') at time zone 'America/Bogota' as slot_14,
  (d.test_day + time '15:00') at time zone 'America/Bogota' as slot_15,
  (d.test_day + time '09:07') at time zone 'America/Bogota' as slot_0907,
  (d.test_day + time '20:00') at time zone 'America/Bogota' as slot_20
from public.services s
join public.professionals p on p.slug = 'tathiana'
cross join (
  select g::date as test_day
  from generate_series(current_date + 7, current_date + 13, interval '1 day') g
  where extract(dow from g) between 1 and 6
  order by g
  limit 1
) d
where s.slug = 'diseno-laminado-cejas';

set local "request.headers" = '{"x-real-ip":"203.0.113.10"}';

select is(
  (select count(*)::int from public.get_public_booking_settings()),
  1,
  'public booking settings returns one row'
);

select is(
  pg_get_function_result(
    'public.get_public_booking_settings()'::regprocedure
  ) ~* '(contact_email|contact_phone|auto_confirm)',
  false,
  'public booking settings exposes no private settings'
);

select is(
  (select count(*)::int from public.get_public_professionals()),
  1,
  'only active professionals are public'
);

select is(
  (select full_name from public.get_public_professionals() limit 1),
  'Tathiana',
  'the active professional is Tathiana'
);

set local role anon;
select isnt_empty(
  'select * from public.get_public_booking_settings()',
  'anon can read public booking settings'
);
reset role;

select is(
  pg_get_function_result(
    'public.create_public_booking(uuid,timestamptz,text,text,text,text,boolean,text,uuid,uuid)'::regprocedure
  ) ~* '(client_email|client_phone|client_name|full_name)',
  false,
  'booking result exposes no client personal data'
);

delete from public.rate_limits;
select throws_ok(
  $$
  select * from public.create_public_booking(
    p_service_id => (select service_id from booking_params),
    p_starts_at => (select slot_12 from booking_params),
    p_full_name => 'Cliente Sin Consentimiento',
    p_phone => '3005550100',
    p_consent => false,
    p_policy_version => (select privacy_policy_version from public.get_public_booking_settings())
  )
  $$,
  'PT422',
  'CONSENT_REQUIRED',
  'booking without consent is rejected'
);

delete from public.rate_limits;
select throws_ok(
  $$
  select * from public.create_public_booking(
    p_service_id => (select service_id from booking_params),
    p_starts_at => (select slot_12 from booking_params),
    p_full_name => 'Cliente Politica Vencida',
    p_phone => '3005550100',
    p_consent => true,
    p_policy_version => '2025-01-01'
  )
  $$,
  'PT422',
  'POLICY_VERSION_MISMATCH',
  'a stale privacy policy version is rejected'
);

select throws_ok(
  $$
  select * from public.create_public_booking(
    p_service_id => (select service_id from booking_params),
    p_starts_at => (select slot_12 from booking_params),
    p_full_name => 'Cliente Telefono Invalido',
    p_phone => 'abc',
    p_consent => true,
    p_policy_version => (select privacy_policy_version from public.get_public_booking_settings())
  )
  $$,
  'PT422',
  'INVALID_PHONE',
  'an invalid phone is rejected'
);

delete from public.rate_limits;
create temp table created_booking as
select * from public.create_public_booking(
  p_service_id => (select service_id from booking_params),
  p_starts_at => (select slot_09 from booking_params),
  p_full_name => 'Cliente Prueba',
  p_phone => '3005550101',
  p_notes => 'Nota de prueba',
  p_consent => true,
  p_policy_version => (select privacy_policy_version from public.get_public_booking_settings())
);

select is(
  (select status from created_booking),
  'pending',
  'a public booking starts as pending'
);

select is(
  (select length(confirmation_code) from created_booking),
  8,
  'a confirmation code is generated'
);

select is(
  (select service_ends_at - starts_at from created_booking),
  interval '40 minutes',
  'the service end excludes the after buffer'
);

select is(
  (
    select count(*)::int
    from public.client_consents cc
    join public.clients c on c.id = cc.client_id
    where c.phone = '+573005550101'
      and cc.policy_version = (
        select privacy_policy_version from public.get_public_booking_settings()
      )
  ),
  1,
  'the consent is recorded'
);

select is(
  (
    select count(*)::int
    from public.audit_log
    where action = 'booking_created'
      and entity_id = (select appointment_id::text from created_booking)
  ),
  1,
  'the booking is audited'
);

select is(
  (
    select c.phone
    from public.clients c
    join public.appointments a on a.client_id = c.id
    where a.id = (select appointment_id from created_booking)
  ),
  '+573005550101',
  'the client phone is stored normalized'
);

delete from public.rate_limits;
create temp table idem_1 as
select * from public.create_public_booking(
  p_service_id => (select service_id from booking_params),
  p_starts_at => (select slot_10 from booking_params),
  p_full_name => 'Cliente Prueba',
  p_phone => '3005550101',
  p_consent => true,
  p_policy_version => (select privacy_policy_version from public.get_public_booking_settings()),
  p_idempotency_key => '11111111-1111-1111-1111-111111111111'
);

create temp table idem_2 as
select * from public.create_public_booking(
  p_service_id => (select service_id from booking_params),
  p_starts_at => (select slot_10 from booking_params),
  p_full_name => 'Cliente Prueba',
  p_phone => '3005550101',
  p_consent => true,
  p_policy_version => (select privacy_policy_version from public.get_public_booking_settings()),
  p_idempotency_key => '11111111-1111-1111-1111-111111111111'
);

select is(
  (select appointment_id from idem_2),
  (select appointment_id from idem_1),
  'an idempotent retry returns the same appointment'
);

select throws_ok(
  $$
  select * from public.create_public_booking(
    p_service_id => (select service_id from booking_params),
    p_starts_at => (select slot_10 from booking_params),
    p_full_name => 'Otra Cliente',
    p_phone => '3005550199',
    p_consent => true,
    p_policy_version => (select privacy_policy_version from public.get_public_booking_settings()),
    p_idempotency_key => '11111111-1111-1111-1111-111111111111'
  )
  $$,
  'PT409',
  'IDEMPOTENCY_CONFLICT',
  'an idempotency key cannot be reused by another phone'
);

select throws_ok(
  $$
  select * from public.create_public_booking(
    p_service_id => (select service_id from booking_params),
    p_starts_at => (select slot_11 from booking_params),
    p_full_name => 'Cliente Prueba',
    p_phone => '3005550101',
    p_consent => true,
    p_policy_version => (select privacy_policy_version from public.get_public_booking_settings()),
    p_idempotency_key => '11111111-1111-1111-1111-111111111111'
  )
  $$,
  'PT409',
  'IDEMPOTENCY_CONFLICT',
  'an idempotency key cannot be reused for another slot'
);

delete from public.rate_limits;
select throws_ok(
  $$
  select * from public.create_public_booking(
    p_service_id => (select service_id from booking_params),
    p_starts_at => (select slot_09 from booking_params),
    p_full_name => 'Cliente Prueba',
    p_phone => '3005550101',
    p_consent => true,
    p_policy_version => (select privacy_policy_version from public.get_public_booking_settings())
  )
  $$,
  'PT409',
  'SLOT_UNAVAILABLE',
  'an already booked slot is rejected'
);

delete from public.rate_limits;
select throws_ok(
  $$
  select * from public.create_public_booking(
    p_service_id => (select service_id from booking_params),
    p_starts_at => (select slot_0907 from booking_params),
    p_full_name => 'Cliente Fuera De Grilla',
    p_phone => '3005550188',
    p_consent => true,
    p_policy_version => (select privacy_policy_version from public.get_public_booking_settings())
  )
  $$,
  'PT409',
  'SLOT_UNAVAILABLE',
  'a slot outside the grid is rejected'
);

delete from public.rate_limits;
select throws_ok(
  $$
  select * from public.create_public_booking(
    p_service_id => (select service_id from booking_params),
    p_starts_at => (select slot_20 from booking_params),
    p_full_name => 'Cliente Fuera De Horario',
    p_phone => '3005550189',
    p_consent => true,
    p_policy_version => (select privacy_policy_version from public.get_public_booking_settings())
  )
  $$,
  'PT409',
  'SLOT_UNAVAILABLE',
  'a slot outside business hours is rejected'
);

insert into public.clients (full_name, phone, email)
values
  ('Clienta A', '+573005550200', 'a@example.com'),
  ('Clienta B', '+573005550201', 'b@example.com');

delete from public.rate_limits;
create temp table priority_booking as
select * from public.create_public_booking(
  p_service_id => (select service_id from booking_params),
  p_starts_at => (select slot_11 from booking_params),
  p_full_name => 'Clienta A',
  p_phone => '3005550200',
  p_email => 'b@example.com',
  p_consent => true,
  p_policy_version => (select privacy_policy_version from public.get_public_booking_settings())
);

select is(
  (
    select a.client_id
    from public.appointments a
    where a.id = (select appointment_id from priority_booking)
  ),
  (select id from public.clients where phone = '+573005550200'),
  'the phone takes priority when resolving the client'
);

select is(
  (
    select count(*)::int
    from public.clients
    where email = 'b@example.com'
  ),
  1,
  'a conflicting email is not reassigned'
);

select is(
  (
    select count(*)::int
    from public.audit_log
    where action = 'client_email_conflict'
      and entity_id = (select id::text from public.clients where phone = '+573005550200')
  ),
  1,
  'an email conflict is audited'
);

delete from public.rate_limits;
select * from public.create_public_booking(
  p_service_id => (select service_id from booking_params),
  p_starts_at => (select slot_12 from booking_params),
  p_full_name => 'Clienta Rate Limit',
  p_phone => '3005550300',
  p_consent => true,
  p_policy_version => (select privacy_policy_version from public.get_public_booking_settings())
);
select * from public.create_public_booking(
  p_service_id => (select service_id from booking_params),
  p_starts_at => (select slot_13 from booking_params),
  p_full_name => 'Clienta Rate Limit',
  p_phone => '3005550300',
  p_consent => true,
  p_policy_version => (select privacy_policy_version from public.get_public_booking_settings())
);
select * from public.create_public_booking(
  p_service_id => (select service_id from booking_params),
  p_starts_at => (select slot_14 from booking_params),
  p_full_name => 'Clienta Rate Limit',
  p_phone => '3005550300',
  p_consent => true,
  p_policy_version => (select privacy_policy_version from public.get_public_booking_settings())
);

select is(
  (
    select count(*)::int
    from public.appointments a
    join public.clients c on c.id = a.client_id
    where c.phone = '+573005550300'
  ),
  3,
  'three bookings are allowed in the rate limit window'
);

select throws_ok(
  $$
  select * from public.create_public_booking(
    p_service_id => (select service_id from booking_params),
    p_starts_at => (select slot_15 from booking_params),
    p_full_name => 'Clienta Rate Limit',
    p_phone => '3005550300',
    p_consent => true,
    p_policy_version => (select privacy_policy_version from public.get_public_booking_settings())
  )
  $$,
  'PT429',
  'RATE_LIMITED',
  'the fourth booking in the window is rate limited'
);

select * from finish();

rollback;
