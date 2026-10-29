begin;

select plan(1);

select ok(
  exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'appointments'
  ),
  'appointments is published to supabase_realtime'
);

select * from finish();

rollback;
