set search_path = public, extensions;

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
  select campaign.stamp_goal into v_goal from public.loyalty_campaigns as campaign
    where campaign.id = v_card.campaign_id and campaign.active = true
    and (campaign.starts_on is null or campaign.starts_on <= v_today)
    and (campaign.ends_on is null or campaign.ends_on >= v_today);
  if not found then raise exception using errcode = '22023', message = 'LOYALTY_CAMPAIGN_INACTIVE'; end if;
  select * into v_appointment from public.appointments where id = p_appointment_id;
  if not found or v_appointment.client_id <> v_card.client_id or v_appointment.status <> 'completed' or v_appointment.starts_at > now() then
    raise exception using errcode = '22023', message = 'LOYALTY_APPOINTMENT_NOT_ELIGIBLE';
  end if;
  if v_card.stamps >= v_goal then raise exception using errcode = '22023', message = 'LOYALTY_REWARD_MUST_BE_REDEEMED'; end if;
  update public.loyalty_cards as card
  set stamps = card.stamps + 1
  where card.id = v_card.id
  returning * into v_card;
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
  select campaign.stamp_goal into v_goal from public.loyalty_campaigns as campaign where campaign.id = v_card.campaign_id;
  if v_card.stamps < v_goal then raise exception using errcode = '22023', message = 'LOYALTY_REWARD_NOT_READY'; end if;
  update public.loyalty_cards as card
  set stamps = 0, rewards_redeemed = card.rewards_redeemed + 1
  where card.id = v_card.id
  returning * into v_card;
  insert into public.loyalty_transactions (card_id, event_type, stamps_after, performed_by) values (v_card.id, 'redeemed', 0, auth.uid());
  return query select v_card.id, v_card.stamps, v_card.rewards_redeemed;
end;
$$;
