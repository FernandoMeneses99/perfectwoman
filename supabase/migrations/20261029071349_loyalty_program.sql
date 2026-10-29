set search_path = public, extensions;

update public.settings
set privacy_policy_version = '2026-10-29'
where id = true and privacy_policy_version = '2026-10-28';

create table public.loyalty_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  reward_description text not null,
  stamp_goal smallint not null default 8,
  active boolean not null default true,
  starts_on date,
  ends_on date,
  consent_version text not null default 'loyalty-v1',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint loyalty_campaign_name_check check (length(btrim(name)) between 2 and 80),
  constraint loyalty_campaign_reward_check check (length(btrim(reward_description)) between 2 and 240),
  constraint loyalty_campaign_goal_check check (stamp_goal between 2 and 50),
  constraint loyalty_campaign_dates_check check (ends_on is null or starts_on is null or ends_on >= starts_on),
  constraint loyalty_campaign_consent_version_check check (length(btrim(consent_version)) between 1 and 32)
);

create index loyalty_campaigns_active_dates_idx on public.loyalty_campaigns (active, starts_on, ends_on);

create trigger loyalty_campaigns_set_updated_at
before update on public.loyalty_campaigns for each row execute function public.set_updated_at();

create table public.loyalty_cards (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  campaign_id uuid not null references public.loyalty_campaigns(id) on delete restrict,
  public_token uuid not null unique default gen_random_uuid(),
  stamps smallint not null default 0,
  rewards_redeemed integer not null default 0,
  status text not null default 'active',
  consent_version text not null,
  consented_at timestamptz not null default now(),
  consented_by uuid references auth.users(id) on delete set null,
  issued_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint loyalty_card_stamps_check check (stamps between 0 and 50),
  constraint loyalty_card_rewards_check check (rewards_redeemed >= 0),
  constraint loyalty_card_status_check check (status in ('active', 'revoked')),
  constraint loyalty_card_consent_version_check check (length(btrim(consent_version)) between 1 and 32)
);

create unique index loyalty_cards_client_campaign_active_idx
on public.loyalty_cards (client_id, campaign_id)
where status = 'active';

create index loyalty_cards_campaign_status_idx on public.loyalty_cards (campaign_id, status, issued_at desc);
create index loyalty_cards_client_issued_idx on public.loyalty_cards (client_id, issued_at desc);

create trigger loyalty_cards_set_updated_at
before update on public.loyalty_cards for each row execute function public.set_updated_at();

create table public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.loyalty_cards(id) on delete restrict,
  event_type text not null,
  stamps_after smallint not null,
  appointment_id uuid references public.appointments(id) on delete restrict,
  performed_by uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  constraint loyalty_transaction_type_check check (event_type in ('issued', 'stamp', 'redeemed', 'revoked')),
  constraint loyalty_transaction_stamps_check check (stamps_after between 0 and 50),
  constraint loyalty_transaction_note_check check (note is null or length(note) <= 300),
  constraint loyalty_transaction_appointment_event_check check (
    (event_type = 'stamp' and appointment_id is not null)
    or (event_type <> 'stamp' and appointment_id is null)
  )
);

create index loyalty_transactions_card_created_idx on public.loyalty_transactions (card_id, created_at desc);
create unique index loyalty_transactions_appointment_once_idx on public.loyalty_transactions (appointment_id) where event_type = 'stamp';

alter table public.loyalty_campaigns enable row level security;
alter table public.loyalty_cards enable row level security;
alter table public.loyalty_transactions enable row level security;

create policy "loyalty_campaigns_admin_select" on public.loyalty_campaigns for select to authenticated using (public.is_admin());
create policy "loyalty_campaigns_admin_insert" on public.loyalty_campaigns for insert to authenticated with check (public.is_admin() and created_by = auth.uid());
create policy "loyalty_campaigns_admin_update" on public.loyalty_campaigns for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "loyalty_cards_admin_select" on public.loyalty_cards for select to authenticated using (public.is_admin());
create policy "loyalty_transactions_admin_select" on public.loyalty_transactions for select to authenticated using (public.is_admin());

revoke all on table public.loyalty_campaigns from anon, authenticated;
revoke all on table public.loyalty_cards from anon, authenticated;
revoke all on table public.loyalty_transactions from anon, authenticated;
grant select, insert, update on table public.loyalty_campaigns to authenticated;
grant select on table public.loyalty_cards to authenticated;
grant select on table public.loyalty_transactions to authenticated;

create or replace function public.admin_issue_loyalty_card(p_client_id uuid, p_campaign_id uuid, p_customer_consented boolean)
returns table (card_id uuid, public_token uuid, stamps smallint, stamp_goal smallint)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_campaign public.loyalty_campaigns%rowtype; v_card public.loyalty_cards%rowtype;
  v_today date;
begin
  if auth.uid() is null or not public.is_admin() then raise exception using errcode = '42501', message = 'ADMIN_REQUIRED'; end if;
  if p_customer_consented is distinct from true then raise exception using errcode = '22023', message = 'LOYALTY_CONSENT_REQUIRED'; end if;
  select (now() at time zone timezone)::date into v_today from public.settings where id = true;
  v_today := coalesce(v_today, current_date);
  select * into v_campaign from public.loyalty_campaigns where id = p_campaign_id and active = true
    and (starts_on is null or starts_on <= v_today) and (ends_on is null or ends_on >= v_today);
  if not found then raise exception using errcode = '22023', message = 'LOYALTY_CAMPAIGN_INACTIVE'; end if;
  if not exists (select 1 from public.clients where id = p_client_id) then raise exception using errcode = '22023', message = 'LOYALTY_CLIENT_NOT_FOUND'; end if;
  insert into public.loyalty_cards (client_id, campaign_id, consent_version, consented_by)
  values (p_client_id, p_campaign_id, v_campaign.consent_version, auth.uid()) returning * into v_card;
  insert into public.loyalty_transactions (card_id, event_type, stamps_after, performed_by) values (v_card.id, 'issued', 0, auth.uid());
  return query select v_card.id, v_card.public_token, v_card.stamps, v_campaign.stamp_goal;
exception when unique_violation then raise exception using errcode = '23505', message = 'LOYALTY_CARD_EXISTS';
end;
$$;

create or replace function public.admin_add_loyalty_stamp(p_card_id uuid, p_appointment_id uuid)
returns table (card_id uuid, stamps smallint, stamp_goal smallint, reward_ready boolean)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_card public.loyalty_cards%rowtype; v_goal smallint; v_appointment public.appointments%rowtype; v_today date;
begin
  if auth.uid() is null or not public.is_admin() then raise exception using errcode = '42501', message = 'ADMIN_REQUIRED'; end if;
  select * into v_card from public.loyalty_cards where id = p_card_id for update;
  if not found or v_card.status <> 'active' then raise exception using errcode = '22023', message = 'LOYALTY_CARD_INACTIVE'; end if;
  select (now() at time zone timezone)::date into v_today from public.settings where id = true;
  v_today := coalesce(v_today, current_date);
  select stamp_goal into v_goal from public.loyalty_campaigns where id = v_card.campaign_id and active = true
    and (starts_on is null or starts_on <= v_today) and (ends_on is null or ends_on >= v_today);
  if not found then raise exception using errcode = '22023', message = 'LOYALTY_CAMPAIGN_INACTIVE'; end if;
  select * into v_appointment from public.appointments where id = p_appointment_id;
  if not found or v_appointment.client_id <> v_card.client_id or v_appointment.status <> 'completed' or v_appointment.starts_at > now() then
    raise exception using errcode = '22023', message = 'LOYALTY_APPOINTMENT_NOT_ELIGIBLE';
  end if;
  if v_card.stamps >= v_goal then raise exception using errcode = '22023', message = 'LOYALTY_REWARD_MUST_BE_REDEEMED'; end if;
  update public.loyalty_cards set stamps = stamps + 1 where id = v_card.id returning * into v_card;
  insert into public.loyalty_transactions (card_id, event_type, stamps_after, appointment_id, performed_by)
  values (v_card.id, 'stamp', v_card.stamps, p_appointment_id, auth.uid());
  return query select v_card.id, v_card.stamps, v_goal, v_card.stamps >= v_goal;
exception when unique_violation then raise exception using errcode = '23505', message = 'LOYALTY_APPOINTMENT_ALREADY_REWARDED';
end;
$$;

create or replace function public.admin_redeem_loyalty_reward(p_card_id uuid)
returns table (card_id uuid, stamps smallint, rewards_redeemed integer)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_card public.loyalty_cards%rowtype; v_goal smallint;
begin
  if auth.uid() is null or not public.is_admin() then raise exception using errcode = '42501', message = 'ADMIN_REQUIRED'; end if;
  select * into v_card from public.loyalty_cards where id = p_card_id for update;
  if not found or v_card.status <> 'active' then raise exception using errcode = '22023', message = 'LOYALTY_CARD_INACTIVE'; end if;
  select stamp_goal into v_goal from public.loyalty_campaigns where id = v_card.campaign_id;
  if v_card.stamps < v_goal then raise exception using errcode = '22023', message = 'LOYALTY_REWARD_NOT_READY'; end if;
  update public.loyalty_cards set stamps = 0, rewards_redeemed = rewards_redeemed + 1 where id = v_card.id returning * into v_card;
  insert into public.loyalty_transactions (card_id, event_type, stamps_after, performed_by) values (v_card.id, 'redeemed', 0, auth.uid());
  return query select v_card.id, v_card.stamps, v_card.rewards_redeemed;
end;
$$;

create or replace function public.admin_revoke_loyalty_card(p_card_id uuid)
returns uuid language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_card public.loyalty_cards%rowtype;
begin
  if auth.uid() is null or not public.is_admin() then raise exception using errcode = '42501', message = 'ADMIN_REQUIRED'; end if;
  update public.loyalty_cards set status = 'revoked' where id = p_card_id and status = 'active' returning * into v_card;
  if not found then raise exception using errcode = '22023', message = 'LOYALTY_CARD_INACTIVE'; end if;
  insert into public.loyalty_transactions (card_id, event_type, stamps_after, performed_by) values (v_card.id, 'revoked', v_card.stamps, auth.uid());
  return v_card.id;
end;
$$;

create or replace function public.get_public_loyalty_card(p_token uuid)
returns table (client_first_name text, campaign_name text, reward_description text, stamp_goal smallint, stamps smallint, rewards_redeemed integer, issued_at timestamptz)
language sql stable security definer set search_path = public, pg_temp
as $$
  select split_part(c.full_name, ' ', 1), campaign.name, campaign.reward_description,
    campaign.stamp_goal, card.stamps, card.rewards_redeemed, card.issued_at
  from public.loyalty_cards card join public.clients c on c.id = card.client_id
  join public.loyalty_campaigns campaign on campaign.id = card.campaign_id
  where p_token is not null and card.public_token = p_token and card.status = 'active';
$$;

revoke all on function public.admin_issue_loyalty_card(uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.admin_add_loyalty_stamp(uuid, uuid) from public, anon, authenticated;
revoke all on function public.admin_redeem_loyalty_reward(uuid) from public, anon, authenticated;
revoke all on function public.admin_revoke_loyalty_card(uuid) from public, anon, authenticated;
revoke all on function public.get_public_loyalty_card(uuid) from public, anon, authenticated;
grant execute on function public.admin_issue_loyalty_card(uuid, uuid, boolean) to authenticated;
grant execute on function public.admin_add_loyalty_stamp(uuid, uuid) to authenticated;
grant execute on function public.admin_redeem_loyalty_reward(uuid) to authenticated;
grant execute on function public.admin_revoke_loyalty_card(uuid) to authenticated;
grant execute on function public.get_public_loyalty_card(uuid) to anon, authenticated;
