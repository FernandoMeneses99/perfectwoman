begin;

select plan(30);

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
    '00000000-0000-4000-8000-000000000031',
    'admin-review-test@perfectwoman.local',
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000032',
    'not-admin-review-test@perfectwoman.local',
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into public.admin_users (user_id, email, display_name)
values (
  '00000000-0000-4000-8000-000000000031',
  'admin-review-test@perfectwoman.local',
  'Admin Reseñas'
);

insert into public.clients (id, full_name, phone)
values (
  '00000000-0000-4000-8000-000000000301',
  'Clienta Reseña Test',
  '3009990101'
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
  '00000000-0000-4000-8000-000000000401',
  p.id,
  s.id,
  c.id,
  ((current_date + 21) + time '10:00') at time zone 'America/Bogota',
  'completed',
  'admin'
from public.professionals p
join public.services s on s.slug = 'diseno-laminado-cejas'
cross join public.clients c
where p.slug = 'tathiana'
  and c.id = '00000000-0000-4000-8000-000000000301';

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
  '00000000-0000-4000-8000-000000000402',
  p.id,
  s.id,
  c.id,
  ((current_date + 21) + time '11:00') at time zone 'America/Bogota',
  'pending',
  'admin'
from public.professionals p
join public.services s on s.slug = 'diseno-laminado-cejas'
cross join public.clients c
where p.slug = 'tathiana'
  and c.id = '00000000-0000-4000-8000-000000000301';

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
  '00000000-0000-4000-8000-000000000403',
  p.id,
  s.id,
  c.id,
  ((current_date + 21) + time '12:00') at time zone 'America/Bogota',
  'completed',
  'admin'
from public.professionals p
join public.services s on s.slug = 'diseno-laminado-cejas'
cross join public.clients c
where p.slug = 'tathiana'
  and c.id = '00000000-0000-4000-8000-000000000301';

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000031","role":"authenticated","email":"admin-review-test@perfectwoman.local"}',
  true
);
set local role authenticated;

create temp table review_invitation as
select *
from public.admin_create_review_invitation('00000000-0000-4000-8000-000000000401');

create temp table expired_review_invitation as
select *
from public.admin_create_review_invitation('00000000-0000-4000-8000-000000000403');

select set_config(
  'test.review_token',
  (select token from review_invitation),
  true
);

select set_config(
  'test.expired_token',
  (select token from expired_review_invitation),
  true
);

select is(
  length((select token from review_invitation)),
  64,
  'an invitation returns a 64-character token'
);

select isnt(
  (
    select token_hash
    from public.review_invitations
    where id = (select invitation_id from review_invitation)
  ),
  (select token from review_invitation),
  'only the token hash is stored'
);

select ok(
  (select expires_at > now() from review_invitation),
  'the invitation expires in the future'
);

select throws_ok(
  $$select * from public.admin_create_review_invitation('00000000-0000-4000-8000-000000000402')$$,
  'PT409',
  'APPOINTMENT_NOT_COMPLETED',
  'an invitation requires a completed appointment'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000032","role":"authenticated","email":"not-admin-review-test@perfectwoman.local"}',
  true
);

select throws_ok(
  $$select * from public.admin_create_review_invitation('00000000-0000-4000-8000-000000000401')$$,
  '42501',
  'NOT_ADMIN',
  'a non-admin cannot create review invitations'
);

reset role;

update public.review_invitations
set
  created_at = now() - interval '31 days',
  expires_at = now() - interval '1 day'
where id = (select invitation_id from expired_review_invitation);

set local role anon;

select is(
  (
    select service_name
    from public.get_public_review_invitation(current_setting('test.review_token'))
  ),
  'Diseño y Laminado de Cejas',
  'the public invitation exposes the service name'
);

select is(
  (
    select client_first_name
    from public.get_public_review_invitation(current_setting('test.review_token'))
  ),
  'Clienta',
  'the public invitation only exposes the client first name'
);

select is(
  (
    select status
    from public.submit_public_review(
      current_setting('test.review_token'),
      'Clienta R.',
      5,
      'Una experiencia maravillosa y muy profesional.',
      true
    )
  ),
  'pending',
  'a submitted review starts pending moderation'
);

select is(
  (select count(*)::int from public.get_public_reviews(12)),
  0,
  'pending reviews are not public'
);

select is(
  (select review_count from public.get_public_review_summary()),
  0,
  'pending reviews do not affect the public summary'
);

select throws_ok(
  $$select * from public.submit_public_review(
    current_setting('test.review_token'),
    'Clienta R.',
    5,
    'Una experiencia maravillosa y muy profesional.',
    true
  )$$,
  'PT409',
  'REVIEW_ALREADY_SUBMITTED',
  'an invitation cannot be used twice'
);

select throws_ok(
  $$select * from public.get_public_review_invitation(current_setting('test.review_token'))$$,
  'PT409',
  'REVIEW_ALREADY_SUBMITTED',
  'a used invitation cannot be opened again'
);

select throws_ok(
  $$select * from public.get_public_review_invitation(current_setting('test.expired_token'))$$,
  'PT410',
  'INVITATION_EXPIRED',
  'expired invitations are rejected'
);

select throws_ok(
  'select * from public.reviews',
  '42501',
  null,
  'anon cannot read reviews directly'
);

select throws_ok(
  'select * from public.review_invitations',
  '42501',
  null,
  'anon cannot read review invitations directly'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.admin_create_review_invitation(uuid)',
    'execute'
  ),
  'anon cannot execute the invitation RPC'
);

reset role;

select is(
  (select status::text from public.reviews where appointment_id = '00000000-0000-4000-8000-000000000401'),
  'pending',
  'the submitted review is stored as pending'
);

select is(
  (
    select rating::int
    from public.reviews
    where appointment_id = '00000000-0000-4000-8000-000000000401'
  ),
  5,
  'the review stores the client rating'
);

select set_config(
  'test.review_id',
  (
    select id::text
    from public.reviews
    where appointment_id = '00000000-0000-4000-8000-000000000401'
  ),
  true
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000032","role":"authenticated","email":"not-admin-review-test@perfectwoman.local"}',
  true
);
set local role authenticated;

select throws_ok(
  $$select * from public.admin_set_review_status(current_setting('test.review_id')::uuid, 'approved', null)$$,
  '42501',
  'NOT_ADMIN',
  'a non-admin cannot moderate reviews'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000031","role":"authenticated","email":"admin-review-test@perfectwoman.local"}',
  true
);

select is(
  (
    select status
    from public.admin_set_review_status(
      current_setting('test.review_id')::uuid,
      'approved',
      'Opinión verificada'
    )
  ),
  'approved',
  'an admin can approve a review'
);

select ok(
  (
    select published_at is not null
    from public.reviews
    where id = current_setting('test.review_id')::uuid
  ),
  'approving publishes the review'
);

reset role;
set local role anon;

select is(
  (select count(*)::int from public.get_public_reviews(12)),
  1,
  'approved reviews are public'
);

select is(
  (select rating::int from public.get_public_reviews(12)),
  5,
  'the public review includes its rating'
);

select is(
  (select review_count from public.get_public_review_summary()),
  1,
  'the public summary counts approved reviews'
);

select is(
  (select average_rating from public.get_public_review_summary()),
  5.0::numeric,
  'the public summary averages approved ratings'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000031","role":"authenticated","email":"admin-review-test@perfectwoman.local"}',
  true
);
set local role authenticated;

select is(
  (
    select status
    from public.admin_set_review_status(
      current_setting('test.review_id')::uuid,
      'rejected',
      'No cumple las normas de publicación'
    )
  ),
  'rejected',
  'an admin can reject a review'
);

select ok(
  (
    select published_at is null
    from public.reviews
    where id = current_setting('test.review_id')::uuid
  ),
  'rejecting removes the publication date'
);

reset role;
set local role anon;

select is(
  (select count(*)::int from public.get_public_reviews(12)),
  0,
  'rejected reviews are removed from the public list'
);

select is(
  (select review_count from public.get_public_review_summary()),
  0,
  'rejected reviews do not affect the public summary'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000031","role":"authenticated","email":"admin-review-test@perfectwoman.local"}',
  true
);
set local role authenticated;

select is(
  (select count(*)::int from public.reviews),
  1,
  'an admin can still see rejected reviews in the panel'
);

reset role;

select * from finish();

rollback;
