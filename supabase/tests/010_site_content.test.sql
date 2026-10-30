begin;

select plan(15);

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
    '00000000-0000-4000-8000-000000000021',
    'admin-content-test@perfectwoman.local',
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000022',
    'not-admin-content-test@perfectwoman.local',
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into public.admin_users (user_id, email, display_name)
values (
  '00000000-0000-4000-8000-000000000021',
  'admin-content-test@perfectwoman.local',
  'Admin Contenido'
);

select is(
  (select count(*)::int from public.site_content),
  1,
  'site content has a single seeded row'
);

select is(
  (select jsonb_typeof(content) from public.site_content where id = true),
  'object',
  'site content is stored as a JSON object'
);

select is(
  (select content->'brand'->>'name' from public.site_content where id = true),
  'PERFECT WOMAN T',
  'the current brand is seeded'
);

select is(
  (select count(*)::int from public.gallery_items),
  5,
  'the current gallery is seeded'
);

select is(
  (select public from storage.buckets where id = 'site-media'),
  true,
  'the site media bucket is public for reads'
);

select is(
  (
    select count(*)::int
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname like 'site_media_%'
  ),
  4,
  'site media has read and admin write policies'
);

select ok(
  has_function_privilege('anon', 'public.get_public_site_content()', 'execute'),
  'anon can read public site content'
);

select ok(
  has_function_privilege('anon', 'public.get_public_gallery()', 'execute'),
  'anon can read the public gallery'
);

set local role anon;

select throws_ok(
  'select * from public.site_content',
  '42501',
  null,
  'anon cannot read the site content table directly'
);

select throws_ok(
  'select * from public.gallery_items',
  '42501',
  null,
  'anon cannot read gallery rows directly'
);

reset role;

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000021","role":"authenticated","email":"admin-content-test@perfectwoman.local"}',
  true
);
set local role authenticated;

update public.site_content
set content = jsonb_set(content, '{hero,title}', '"Hero actualizado"')
where id = true;

select is(
  (select version from public.site_content where id = true),
  2,
  'editing content increments its version'
);

select is(
  (select content->'hero'->>'title' from public.site_content where id = true),
  'Hero actualizado',
  'an admin can update site content'
);

reset role;

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000022","role":"authenticated","email":"not-admin-content-test@perfectwoman.local"}',
  true
);
set local role authenticated;

with updated as (
  update public.site_content
  set content = jsonb_set(content, '{hero,title}', '"No permitido"')
  where id = true
  returning 1
)
select is(
  (select count(*)::int from updated),
  0,
  'a non-admin cannot update site content'
);

reset role;
set local role anon;

select is(
  (select content->'hero'->>'title' from public.get_public_site_content()),
  'Hero actualizado',
  'anon receives the updated content through the public RPC'
);

select is(
  (select count(*)::int from public.get_public_gallery()),
  5,
  'anon receives active gallery items through the public RPC'
);

reset role;

select * from finish();

rollback;
