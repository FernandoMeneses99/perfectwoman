set search_path = public, extensions;

create or replace function public.set_appointment_ends_at()
returns trigger
language plpgsql
as $$
declare
  v_minutes integer;
begin
  select s.duration_minutes + s.buffer_after_minutes
  into v_minutes
  from public.services s
  where s.id = new.service_id;

  if v_minutes is null then
    raise exception 'SERVICE_NOT_FOUND' using errcode = '23503';
  end if;

  new.ends_at := new.starts_at + make_interval(mins => v_minutes);
  return new;
end;
$$;

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  confirmation_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  professional_id uuid not null references public.professionals(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  client_id uuid not null references public.clients(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'pending',
  source public.appointment_source not null default 'public',
  idempotency_key uuid,
  notes text,
  admin_notes text,
  cancellation_reason text,
  cancelled_at timestamptz,
  confirmed_at timestamptz,
  completed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_range_check check (ends_at > starts_at),
  constraint appointments_notes_check check (notes is null or length(notes) <= 2000),
  constraint appointments_admin_notes_check check (admin_notes is null or length(admin_notes) <= 2000),
  constraint appointments_cancellation_reason_check check (
    cancellation_reason is null or length(cancellation_reason) <= 500
  ),
  constraint appointments_cancelled_check check (
    status <> 'cancelled' or cancelled_at is not null
  )
);

alter table public.appointments
add constraint appointments_no_overlap
exclude using gist (
  professional_id with =,
  tstzrange(starts_at, ends_at, '[)') with &&
)
where (status in ('pending', 'confirmed'));

create unique index appointments_idempotency_key_uidx
on public.appointments (idempotency_key)
where idempotency_key is not null;

create index appointments_professional_start_idx
on public.appointments (professional_id, starts_at);

create index appointments_client_start_idx
on public.appointments (client_id, starts_at desc);

create index appointments_status_start_idx
on public.appointments (status, starts_at);

create trigger appointments_set_ends_at
before insert or update of starts_at, service_id on public.appointments
for each row execute function public.set_appointment_ends_at();

create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();
