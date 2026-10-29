set search_path = public, extensions;

alter table public.admin_users enable row level security;
alter table public.professionals enable row level security;
alter table public.services enable row level security;
alter table public.business_hours enable row level security;
alter table public.schedule_blocks enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;
alter table public.client_consents enable row level security;
alter table public.settings enable row level security;
alter table public.audit_log enable row level security;
alter table public.rate_limits enable row level security;

create policy "admin_users_select_self"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

create policy "professionals_admin_all"
on public.professionals
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "services_admin_all"
on public.services
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "business_hours_admin_all"
on public.business_hours
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "schedule_blocks_admin_all"
on public.schedule_blocks
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "clients_admin_all"
on public.clients
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "appointments_admin_all"
on public.appointments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "client_consents_admin_all"
on public.client_consents
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "settings_admin_all"
on public.settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "audit_log_admin_select"
on public.audit_log
for select
to authenticated
using (public.is_admin());

revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.professionals from anon, authenticated;
revoke all on table public.services from anon, authenticated;
revoke all on table public.business_hours from anon, authenticated;
revoke all on table public.schedule_blocks from anon, authenticated;
revoke all on table public.clients from anon, authenticated;
revoke all on table public.appointments from anon, authenticated;
revoke all on table public.client_consents from anon, authenticated;
revoke all on table public.settings from anon, authenticated;
revoke all on table public.audit_log from anon, authenticated;
revoke all on table public.rate_limits from anon, authenticated;

grant select on table public.admin_users to authenticated;
grant select, insert, update, delete on table public.professionals to authenticated;
grant select, insert, update, delete on table public.services to authenticated;
grant select, insert, update, delete on table public.business_hours to authenticated;
grant select, insert, update, delete on table public.schedule_blocks to authenticated;
grant select, insert, update, delete on table public.clients to authenticated;
grant select, insert, update, delete on table public.appointments to authenticated;
grant select, insert, update, delete on table public.client_consents to authenticated;
grant select, insert, update, delete on table public.settings to authenticated;
grant select on table public.audit_log to authenticated;

revoke all on function public.is_admin() from public;
revoke all on function public.get_public_services() from public;
revoke all on function public.normalize_phone(text) from public;
revoke all on function public.set_updated_at() from public;
revoke all on function public.set_appointment_ends_at() from public;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.get_public_services() to anon, authenticated;
grant execute on function public.normalize_phone(text) to authenticated;
grant execute on function public.set_updated_at() to authenticated;
grant execute on function public.set_appointment_ends_at() to authenticated;
