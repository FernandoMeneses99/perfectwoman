revoke execute on function public.admin_create_schedule_block(uuid, timestamptz, timestamptz, text) from public, anon;
revoke execute on function public.admin_delete_schedule_block(uuid) from public, anon;

grant execute on function public.admin_create_schedule_block(uuid, timestamptz, timestamptz, text) to authenticated;
grant execute on function public.admin_delete_schedule_block(uuid) to authenticated;

drop policy if exists "admin_users_select_self" on public.admin_users;

create policy "admin_users_select_self"
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));
