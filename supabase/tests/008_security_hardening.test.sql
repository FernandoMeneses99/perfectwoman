begin;

select plan(14);

select ok(
  (
    select bool_and(not has_function_privilege('anon', p.oid, 'execute'))
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = any (array[
        'admin_create_appointment',
        'admin_create_schedule_block',
        'admin_delete_schedule_block',
        'admin_reschedule_appointment',
        'admin_set_appointment_status',
        'admin_update_appointment_notes',
        'admin_list_admin_users',
        'admin_upsert_admin_user'
      ])
  ),
  'anon cannot execute admin RPCs'
);

select ok(
  (
    select bool_and(has_function_privilege('authenticated', p.oid, 'execute'))
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = any (array[
        'admin_create_appointment',
        'admin_create_schedule_block',
        'admin_delete_schedule_block',
        'admin_reschedule_appointment',
        'admin_set_appointment_status',
        'admin_update_appointment_notes',
        'admin_list_admin_users',
        'admin_upsert_admin_user'
      ])
  ),
  'authenticated can execute admin RPCs'
);

select ok(
  (
    select bool_and(not has_function_privilege('anon', p.oid, 'execute'))
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = any (array[
        'hash_request_ip',
        'consume_rate_limit',
        'admin_slot_is_available'
      ])
  ),
  'anon cannot execute internal helpers'
);

select ok(
  (
    select bool_and(not has_function_privilege('authenticated', p.oid, 'execute'))
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = any (array[
        'hash_request_ip',
        'consume_rate_limit',
        'admin_slot_is_available'
      ])
  ),
  'authenticated cannot execute internal helpers'
);

select ok(
  (
    select bool_and(not has_function_privilege('anon', p.oid, 'execute'))
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = any (array[
        'normalize_phone',
        'set_updated_at',
        'set_appointment_ends_at'
      ])
  ),
  'anon cannot execute trigger and normalization functions'
);

select ok(
  (
    select bool_and(has_function_privilege('authenticated', p.oid, 'execute'))
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = any (array[
        'normalize_phone',
        'set_updated_at',
        'set_appointment_ends_at'
      ])
  ),
  'authenticated can execute trigger and normalization functions'
);

select ok(
  to_regprocedure('public.rls_auto_enable()') is null
  or not exists (
    select 1
    from pg_proc p
    cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'rls_auto_enable'
      and a.grantee = 0
      and a.privilege_type = 'EXECUTE'
  ),
  'PUBLIC cannot execute rls_auto_enable'
);

select ok(
  to_regprocedure('public.rls_auto_enable()') is null
  or not has_function_privilege('anon', 'public.rls_auto_enable()', 'execute'),
  'anon cannot execute rls_auto_enable'
);

select ok(
  to_regprocedure('public.rls_auto_enable()') is null
  or not has_function_privilege('authenticated', 'public.rls_auto_enable()', 'execute'),
  'authenticated cannot execute rls_auto_enable'
);

select ok(
  not has_function_privilege('anon', 'public.is_admin()', 'execute'),
  'anon cannot execute is_admin'
);

select ok(
  has_function_privilege('authenticated', 'public.is_admin()', 'execute'),
  'authenticated can execute is_admin'
);

select ok(
  (
    select array_to_string(p.proconfig, ',') like '%search_path=%public%pg_temp%'
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'normalize_phone'
  ),
  'normalize_phone has a fixed search_path'
);

select ok(
  (
    select array_to_string(p.proconfig, ',') like '%search_path=%public%pg_temp%'
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'set_updated_at'
  ),
  'set_updated_at has a fixed search_path'
);

select ok(
  (
    select array_to_string(p.proconfig, ',') like '%search_path=%public%pg_temp%'
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'set_appointment_ends_at'
  ),
  'set_appointment_ends_at has a fixed search_path'
);

select * from finish();

rollback;
