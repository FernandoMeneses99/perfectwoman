import { supabase } from './supabase'

export type PublicService = {
  id: string
  slug: string
  name: string
  category: string | null
  description: string | null
  duration_minutes: number
  price_cop: number | null
  price_verified: boolean
  sort_order: number
}

export type PublicProfessional = {
  id: string
  full_name: string
  slug: string
  sort_order: number
}

export type PublicBookingSettings = {
  studio_name: string
  timezone: string
  slot_interval_minutes: number
  min_notice_hours: number
  max_advance_days: number
  privacy_policy_version: string
}

export type AvailabilitySlot = {
  slot_date: string
  slot_start: string
  slot_end: string
}

export type PublicBookingResult = {
  appointment_id: string
  confirmation_code: string
  status: string
  starts_at: string
  service_ends_at: string
  service_name: string
  professional_name: string
}

export type CreatePublicBookingInput = {
  serviceId: string
  startsAt: string
  fullName: string
  phone: string
  email: string | null
  notes: string | null
  consent: boolean
  policyVersion: string
  professionalId: string | null
  idempotencyKey: string
}

export async function fetchPublicServices(): Promise<PublicService[]> {
  const { data, error } = await supabase.rpc('get_public_services')

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as PublicService[]
}

export async function fetchPublicProfessionals(): Promise<PublicProfessional[]> {
  const { data, error } = await supabase.rpc('get_public_professionals')

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as PublicProfessional[]
}

export async function fetchPublicBookingSettings(): Promise<PublicBookingSettings> {
  const { data, error } = await supabase.rpc('get_public_booking_settings')

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as PublicBookingSettings[]

  if (!rows[0]) {
    throw new Error('SETTINGS_NOT_CONFIGURED')
  }

  return rows[0]
}

export async function fetchAvailability(
  serviceId: string,
  professionalId: string | null,
  from: string,
  to: string,
): Promise<AvailabilitySlot[]> {
  const { data, error } = await supabase.rpc('get_public_availability', {
    p_service_id: serviceId,
    p_professional_id: professionalId,
    p_from: from,
    p_to: to,
  })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as AvailabilitySlot[]
}

export async function createPublicBooking(input: CreatePublicBookingInput): Promise<PublicBookingResult> {
  const { data, error } = await supabase.rpc('create_public_booking', {
    p_service_id: input.serviceId,
    p_starts_at: input.startsAt,
    p_full_name: input.fullName,
    p_phone: input.phone,
    p_email: input.email,
    p_notes: input.notes,
    p_consent: input.consent,
    p_policy_version: input.policyVersion,
    p_professional_id: input.professionalId,
    p_idempotency_key: input.idempotencyKey,
  })

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as PublicBookingResult[]

  if (!rows[0]) {
    throw new Error('BOOKING_EMPTY_RESPONSE')
  }

  return rows[0]
}
