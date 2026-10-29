begin;

select plan(17);

insert into auth.users (
  id,
  email,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-4000-8000-000000000011',
    'admin-manager-test@perfectwoman.local',
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000012',
    'not-admin-manager-test@perfectwoman.local',
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000013',
    'new-admin-manager-test@perfectwoman.local',
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into public.admin_users (user_id, email, display_name)
values (
  '00000000-0000-4000-8000-000000000011',
  'admin-manager-test@perfectwoman.local',
  'Admin Manager'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000011","role":"authenticated","email":"admin-manager-test@perfectwoman.local"}',
  true
);
set local role authenticated;

create temp table phase5_created as
select *
from public.admin_create_appointment(
  (select id from public.services where slug = 'diseno-laminado-cejas'),
  (select id from public.professionals where slug = 'tathiana'),
  ((date_trunc('week', current_date)::date + 14) + time '10:00') at time zone 'America/Bogota',
  'Clienta Fase Cinco',
  '300 999 0001',
  'clienta-fase5@perfectwoman.local',
  'Prefiere contacto por WhatsApp',
  'Cita creada desde el panel',
  'confirmed'
);

select is(
  (select status from phase5_created),
  'confirmed',
  'an admin can create a confirmed appointment'
);

select ok(
  (
    select confirmed_at is not null
    from public.appointments
    where id = (select appointment_id from phase5_created)
  ),
  'creating a confirmed appointment sets confirmed_at'
);

select is(
  (
    select public.normalize_phone(phone)
    from public.clients
    where id = (
      select client_id
      from public.appointments
      where id = (select appointment_id from phase5_created)
    )
  ),
  '+573009990001',
  'the client phone is normalized'
);

select is(
  (
    select status
    from public.admin_reschedule_appointment(
      (select appointment_id from phase5_created),
      ((date_trunc('week', current_date)::date + 14) + time '11:00') at time zone 'America/Bogota'
    )
  ),
  'confirmed',
  'an admin can reschedule a pending or confirmed appointment'
);

select is(
  (
    select starts_at
    from public.appointments
    where id = (select appointment_id from phase5_created)
  ),
  ((date_trunc('week', current_date)::date + 14) + time '11:00') at time zone 'America/Bogota',
  'rescheduling updates the appointment start'
);

select is(
  (
    select count(*)::int
    from public.audit_log
    where entity_id = (select appointment_id::text from phase5_created)
      and action = 'appointment_rescheduled'
  ),
  1,
  'rescheduling is audited'
);

select is(
  (
    select admin_notes
    from public.admin_update_appointment_notes(
      (select appointment_id from phase5_created),
      'Llamar antes de confirmar'
    )
  ),
  'Llamar antes de confirmar',
  'an admin can update internal notes'
);

select throws_ok(
  $$select *
    from public.admin_create_schedule_block(
      (select id from public.professionals where slug = 'tathiana'),
      ((date_trunc('week', current_date)::date + 14) + time '10:30') at time zone 'America/Bogota',
      ((date_trunc('week', current_date)::date + 14) + time '11:30') at time zone 'America/Bogota',
      'Bloqueo de prueba'
    )$$,
  'PT409',
  'BLOCK_OVERLAPS_APPOINTMENT',
  'a block that overlaps an active appointment is rejected'
);

create temp table phase5_block as
select *
from public.admin_create_schedule_block(
  (select id from public.professionals where slug = 'tathiana'),
  ((date_trunc('week', current_date)::date + 14) + time '14:00') at time zone 'America/Bogota',
  ((date_trunc('week', current_date)::date + 14) + time '15:00') at time zone 'America/Bogota',
  'Bloqueo sin citas'
);

select isnt_empty(
  'select * from phase5_block',
  'an admin can create a schedule block without appointments'
);

select lives_ok(
  $$select public.admin_delete_schedule_block((select block_id from phase5_block))$$,
  'an admin can delete a schedule block'
);

select is_empty(
  'select * from public.schedule_blocks where id = (select block_id from phase5_block)',
  'the deleted block no longer exists'
);

select throws_ok(
  $$select *
    from public.admin_create_appointment(
      (select id from public.services where slug = 'diseno-laminado-cejas'),
      (select id from public.professionals where slug = 'tathiana'),
      ((date_trunc('week', current_date)::date + 14) + time '08:00') at time zone 'America/Bogota',
      'Clienta Fuera de Horario',
      '3009990002',
      null,
      null,
      null,
      'confirmed'
    )$$,
  'PT409',
  'SLOT_UNAVAILABLE',
  'an appointment outside business hours is rejected'
);

select is(
  (
    select active
    from public.admin_upsert_admin_user(
      'new-admin-manager-test@perfectwoman.local',
      'Nueva Admin',
      true
    )
  ),
  true,
  'an admin can promote an existing auth user'
);

select is(
  (select count(*)::int from public.admin_list_admin_users()),
  2,
  'the admin list includes both active administrators'
);

select throws_ok(
  $$select *
    from public.admin_upsert_admin_user(
      'admin-manager-test@perfectwoman.local',
      'Admin Manager',
      false
    )$$,
  'PT409',
  'CANNOT_DEACTIVATE_SELF',
  'an admin cannot deactivate their own account'
);

select is(
  (
    select active
    from public.admin_upsert_admin_user(
      'new-admin-manager-test@perfectwoman.local',
      'Nueva Admin',
      false
    )
  ),
  false,
  'an admin can deactivate another administrator'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000012","role":"authenticated","email":"not-admin-manager-test@perfectwoman.local"}',
  true
);

select throws_ok(
  $$select *
    from public.admin_create_appointment(
      (select id from public.services where slug = 'diseno-laminado-cejas'),
      (select id from public.professionals where slug = 'tathiana'),
      ((date_trunc('week', current_date)::date + 14) + time '08:00') at time zone 'America/Bogota',
      'Clienta No Admin',
      '3009990002',
      null,
      null,
      null,
      'confirmed'
    )$$,
  '42501',
  'NOT_ADMIN',
  'a non-admin cannot use admin appointment creation'
);

reset role;

select * from finish();

rollback;
