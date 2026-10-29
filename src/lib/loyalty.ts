import { supabase } from './supabase'

export type LoyaltyCampaign = {
  id: string
  name: string
  reward_description: string
  stamp_goal: number
  active: boolean
  starts_on: string | null
  ends_on: string | null
  consent_version: string
  created_at: string
}

export type LoyaltyClient = {
  id: string
  full_name: string
  phone: string
}

export type LoyaltyCard = {
  id: string
  client_id: string
  campaign_id: string
  public_token: string
  stamps: number
  rewards_redeemed: number
  status: 'active' | 'revoked'
  consent_version: string
  consented_at: string
  issued_at: string
}

export type LoyaltyTransaction = {
  id: string
  card_id: string
  event_type: 'issued' | 'stamp' | 'redeemed' | 'revoked'
  stamps_after: number
  appointment_id: string | null
  created_at: string
}

export type LoyaltyAppointment = {
  id: string
  starts_at: string
}

export type LoyaltyOverview = {
  campaigns: LoyaltyCampaign[]
  clients: LoyaltyClient[]
  cards: LoyaltyCard[]
  transactions: LoyaltyTransaction[]
}

export type PublicLoyaltyCard = {
  client_first_name: string
  campaign_name: string
  reward_description: string
  stamp_goal: number
  stamps: number
  rewards_redeemed: number
  issued_at: string
}

type LoyaltyResultRow = Record<string, unknown>

export async function fetchLoyaltyOverview(): Promise<LoyaltyOverview> {
  const [campaignResult, clientResult, cardResult, transactionResult] = await Promise.all([
    supabase.from('loyalty_campaigns').select('*').order('created_at', { ascending: false }),
    supabase.from('clients').select('id, full_name, phone').order('full_name').limit(1000),
    supabase.from('loyalty_cards').select('*').order('issued_at', { ascending: false }).limit(500),
    supabase.from('loyalty_transactions').select('*').order('created_at', { ascending: false }).limit(1000),
  ])

  const error = campaignResult.error ?? clientResult.error ?? cardResult.error ?? transactionResult.error
  if (error) throw error

  return {
    campaigns: (campaignResult.data ?? []) as LoyaltyCampaign[],
    clients: (clientResult.data ?? []) as LoyaltyClient[],
    cards: (cardResult.data ?? []) as LoyaltyCard[],
    transactions: (transactionResult.data ?? []) as LoyaltyTransaction[],
  }
}

export async function createLoyaltyCampaign(input: {
  name: string
  rewardDescription: string
  stampGoal: number
  startsOn: string | null
  endsOn: string | null
}): Promise<void> {
  const { data, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError
  if (!data.user) throw new Error('ADMIN_REQUIRED')

  const { error } = await supabase.from('loyalty_campaigns').insert({
    name: input.name.trim(),
    reward_description: input.rewardDescription.trim(),
    stamp_goal: input.stampGoal,
    starts_on: input.startsOn || null,
    ends_on: input.endsOn || null,
    created_by: data.user.id,
  })
  if (error) throw error
}

export async function setLoyaltyCampaignActive(id: string, active: boolean): Promise<void> {
  const { error } = await supabase.from('loyalty_campaigns').update({ active }).eq('id', id)
  if (error) throw error
}

export async function issueLoyaltyCard(clientId: string, campaignId: string): Promise<{ token: string }> {
  const { data, error } = await supabase.rpc('admin_issue_loyalty_card', {
    p_client_id: clientId,
    p_campaign_id: campaignId,
    p_customer_consented: true,
  })
  if (error) throw error

  const row = (data as LoyaltyResultRow[] | null)?.[0]
  if (typeof row?.public_token !== 'string') throw new Error('LOYALTY_EMPTY_RESPONSE')
  return { token: row.public_token }
}

export async function fetchCompletedAppointments(clientId: string): Promise<LoyaltyAppointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, starts_at')
    .eq('client_id', clientId)
    .eq('status', 'completed')
    .lte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return (data ?? []) as LoyaltyAppointment[]
}

export async function addLoyaltyStamp(cardId: string, appointmentId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_add_loyalty_stamp', {
    p_card_id: cardId,
    p_appointment_id: appointmentId,
  })
  if (error) throw error
}

export async function redeemLoyaltyReward(cardId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_redeem_loyalty_reward', { p_card_id: cardId })
  if (error) throw error
}

export async function revokeLoyaltyCard(cardId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_revoke_loyalty_card', { p_card_id: cardId })
  if (error) throw error
}

export async function fetchPublicLoyaltyCard(token: string): Promise<PublicLoyaltyCard | null> {
  const { data, error } = await supabase.rpc('get_public_loyalty_card', { p_token: token })
  if (error) throw error
  return ((data as PublicLoyaltyCard[] | null)?.[0] ?? null)
}

export function mapLoyaltyError(error: unknown): string {
  const message = error instanceof Error
    ? error.message
    : error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message
      : String(error)
  const errorCode = error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
    ? error.code
    : ''
  if (errorCode === 'PGRST202' || errorCode === 'PGRST205') {
    return 'La fidelización aún no está activada en Supabase. Aplica la migración del proyecto y vuelve a cargar.'
  }
  const known: Record<string, string> = {
    ADMIN_REQUIRED: 'Tu sesión no tiene permiso para gestionar fidelización.',
    LOYALTY_CARD_EXISTS: 'Esta clienta ya tiene una tarjeta para esta campaña.',
    LOYALTY_CARD_INACTIVE: 'La tarjeta ya no está activa. Actualiza la lista.',
    LOYALTY_CAMPAIGN_INACTIVE: 'La campaña no está vigente. Actualiza la lista.',
    LOYALTY_CLIENT_NOT_FOUND: 'No encontramos a la clienta seleccionada.',
    LOYALTY_CONSENT_REQUIRED: 'Confirma que la clienta aceptó participar.',
    LOYALTY_APPOINTMENT_NOT_ELIGIBLE: 'Elige una cita completada de esta clienta.',
    LOYALTY_APPOINTMENT_ALREADY_REWARDED: 'Esta cita ya otorgó un sello.',
    LOYALTY_REWARD_MUST_BE_REDEEMED: 'Canjea la recompensa antes de registrar otro sello.',
    LOYALTY_REWARD_NOT_READY: 'La tarjeta aún no completa los sellos requeridos.',
    LOYALTY_EMPTY_RESPONSE: 'No se pudo crear la tarjeta. Actualiza la lista e inténtalo de nuevo.',
  }
  const key = Object.keys(known).find((candidate) => message.includes(candidate))
  return key ? known[key] : 'No se pudo completar la acción. Revisa tu conexión e inténtalo de nuevo.'
}

export function loyaltyCardUrl(token: string): string {
  return `${window.location.origin}/fidelidad/${encodeURIComponent(token)}`
}
