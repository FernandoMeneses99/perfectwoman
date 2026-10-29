begin;

select plan(4);

set local role anon;

select throws_ok(
  'select * from public.clients',
  '42501',
  'permission denied for table clients',
  'anon cannot read clients'
);

select throws_ok(
  'select * from public.appointments',
  '42501',
  'permission denied for table appointments',
  'anon cannot read appointments'
);

select isnt_empty(
  'select * from public.get_public_services()',
  'anon can read public services'
);

select isnt_empty(
  $$select *
    from public.get_public_availability(
      (select id from public.get_public_services() where slug = 'diseno-laminado-cejas'),
      null,
      current_date + 7,
      current_date + 13
    )$$,
  'anon can read public availability'
);

reset role;

select * from finish();

rollback;
