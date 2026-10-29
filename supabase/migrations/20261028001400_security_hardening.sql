alter function public.normalize_phone(text) set search_path = public, pg_temp;
alter function public.set_updated_at() set search_path = public, pg_temp;
alter function public.set_appointment_ends_at() set search_path = public, pg_temp;

revoke execute on function public.normalize_phone(text) from public, anon;
revoke execute on function public.set_updated_at() from public, anon;
revoke execute on function public.set_appointment_ends_at() from public, anon;

grant execute on function public.normalize_phone(text) to authenticated;
grant execute on function public.set_updated_at() to authenticated;
grant execute on function public.set_appointment_ends_at() to authenticated;

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

revoke execute on function public.hash_request_ip() from public, anon, authenticated;
revoke execute on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;

revoke execute on function public.admin_slot_is_available(uuid, uuid, timestamptz, uuid) from public, anon, authenticated;

revoke execute on function public.admin_set_appointment_status(uuid, text, text) from public, anon;
revoke execute on function public.admin_create_appointment(uuid, uuid, timestamptz, text, text, text, text, text, text) from public, anon;
revoke execute on function public.admin_reschedule_appointment(uuid, timestamptz) from public, anon;
revoke execute on function public.admin_update_appointment_notes(uuid, text) from public, anon;
revoke execute on function public.admin_list_admin_users() from public, anon;
revoke execute on function public.admin_upsert_admin_user(text, text, boolean) from public, anon;

grant execute on function public.admin_set_appointment_status(uuid, text, text) to authenticated;
grant execute on function public.admin_create_appointment(uuid, uuid, timestamptz, text, text, text, text, text, text) to authenticated;
grant execute on function public.admin_reschedule_appointment(uuid, timestamptz) to authenticated;
grant execute on function public.admin_update_appointment_notes(uuid, text) to authenticated;
grant execute on function public.admin_list_admin_users() to authenticated;
grant execute on function public.admin_upsert_admin_user(text, text, boolean) to authenticated;
