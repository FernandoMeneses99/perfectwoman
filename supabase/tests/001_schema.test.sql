begin;

select plan(12);

select has_table('public', 'professionals', 'professionals table exists');
select has_table('public', 'services', 'services table exists');
select has_table('public', 'business_hours', 'business_hours table exists');
select has_table('public', 'schedule_blocks', 'schedule_blocks table exists');
select has_table('public', 'clients', 'clients table exists');
select has_table('public', 'appointments', 'appointments table exists');
select has_table('public', 'settings', 'settings table exists');
select has_table('public', 'admin_users', 'admin_users table exists');
select has_function('public', 'is_admin', 'is_admin function exists');
select has_function('public', 'get_public_services', 'get_public_services function exists');
select col_is_pk('public', 'clients', 'id', 'clients id is primary key');
select col_is_pk('public', 'appointments', 'id', 'appointments id is primary key');

select * from finish();

rollback;
