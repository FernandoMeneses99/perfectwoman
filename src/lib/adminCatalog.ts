import { supabase } from './supabase'

export type AdminService = {
  id: string
  slug: string
  name: string
  category: string | null
  description: string | null
  duration_minutes: number
  buffer_before_minutes: number
  buffer_after_minutes: number
  price_cop: number | null
  price_verified: boolean
  duration_verified: boolean
  active: boolean
  sort_order: number
}

export type AdminServiceInput = {
  id?: string
  slug: string
  name: string
  category: string | null
  description: string | null
  duration_minutes: number
  buffer_before_minutes: number
  buffer_after_minutes: number
  price_cop: number | null
  price_verified: boolean
  duration_verified: boolean
  active: boolean
  sort_order: number
}

export type AdminProfessional = {
  id: string
  full_name: string
  slug: string
  email: string | null
  phone: string | null
  active: boolean
  sort_order: number
}

export type AdminProfessionalInput = {
  id?: string
  full_name: string
  slug: string
  email: string | null
  phone: string | null
  active: boolean
  sort_order: number
}

export type AdminBusinessHour = {
  id: string
  professional_id: string
  weekday: number
  opens_at: string
  closes_at: string
  active: boolean
  valid_from: string | null
  valid_to: string | null
}

export type AdminBusinessHourInput = {
  id?: string
  professional_id: string
  weekday: number
  opens_at: string
  closes_at: string
  active: boolean
  valid_from: string | null
  valid_to: string | null
}

export type AdminScheduleBlock = {
  id: string
  professional_id: string | null
  starts_at: string
  ends_at: string
  reason: string | null
  created_at: string
  professional: { full_name: string } | null
}

export type AdminScheduleBlockInput = {
  professionalId: string | null
  startsAt: string
  endsAt: string
  reason: string | null
}

export type AdminUser = {
  user_id: string
  email: string
  display_name: string | null
  active: boolean
  created_at: string
}

export type AdminUserInput = {
  email: string
  displayName: string | null
  active: boolean
}

export async function fetchAdminServices(): Promise<AdminService[]> {
  const { data, error } = await supabase
    .from('services')
    .select(
      'id, slug, name, category, description, duration_minutes, buffer_before_minutes, buffer_after_minutes, price_cop, price_verified, duration_verified, active, sort_order',
    )
    .order('sort_order')
    .order('name')

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as AdminService[]
}

export async function saveAdminService(input: AdminServiceInput): Promise<AdminService> {
  const payload = {
    slug: input.slug,
    name: input.name,
    category: input.category,
    description: input.description,
    duration_minutes: input.duration_minutes,
    buffer_before_minutes: input.buffer_before_minutes,
    buffer_after_minutes: input.buffer_after_minutes,
    price_cop: input.price_cop,
    price_verified: input.price_verified,
    duration_verified: input.duration_verified,
    active: input.active,
    sort_order: input.sort_order,
  }

  const query = input.id
    ? supabase.from('services').update(payload).eq('id', input.id)
    : supabase.from('services').insert(payload)

  const { data, error } = await query.select().single()

  if (error) {
    throw new Error(error.message)
  }

  return data as AdminService
}

export async function fetchAdminProfessionals(): Promise<AdminProfessional[]> {
  const { data, error } = await supabase
    .from('professionals')
    .select('id, full_name, slug, email, phone, active, sort_order')
    .order('sort_order')
    .order('full_name')

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as AdminProfessional[]
}

export async function saveAdminProfessional(
  input: AdminProfessionalInput,
): Promise<AdminProfessional> {
  const payload = {
    full_name: input.full_name,
    slug: input.slug,
    email: input.email,
    phone: input.phone,
    active: input.active,
    sort_order: input.sort_order,
  }

  const query = input.id
    ? supabase.from('professionals').update(payload).eq('id', input.id)
    : supabase.from('professionals').insert(payload)

  const { data, error } = await query.select().single()

  if (error) {
    throw new Error(error.message)
  }

  return data as AdminProfessional
}

export async function fetchAdminBusinessHours(): Promise<AdminBusinessHour[]> {
  const { data, error } = await supabase
    .from('business_hours')
    .select('id, professional_id, weekday, opens_at, closes_at, active, valid_from, valid_to')
    .order('professional_id')
    .order('weekday')
    .order('opens_at')

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as AdminBusinessHour[]
}

export async function saveAdminBusinessHour(
  input: AdminBusinessHourInput,
): Promise<AdminBusinessHour> {
  const payload = {
    professional_id: input.professional_id,
    weekday: input.weekday,
    opens_at: input.opens_at,
    closes_at: input.closes_at,
    active: input.active,
    valid_from: input.valid_from,
    valid_to: input.valid_to,
  }

  const query = input.id
    ? supabase.from('business_hours').update(payload).eq('id', input.id)
    : supabase.from('business_hours').insert(payload)

  const { data, error } = await query.select().single()

  if (error) {
    throw new Error(error.message)
  }

  return data as AdminBusinessHour
}

export async function deleteAdminBusinessHour(id: string): Promise<void> {
  const { error } = await supabase.from('business_hours').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function fetchAdminScheduleBlocks(): Promise<AdminScheduleBlock[]> {
  const { data, error } = await supabase
    .from('schedule_blocks')
    .select(
      'id, professional_id, starts_at, ends_at, reason, created_at, professional:professionals(full_name)',
    )
    .gte('ends_at', new Date().toISOString())
    .order('starts_at')

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as unknown as AdminScheduleBlock[]
}

export async function createAdminScheduleBlock(input: AdminScheduleBlockInput): Promise<void> {
  const { error } = await supabase.rpc('admin_create_schedule_block', {
    p_professional_id: input.professionalId,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
    p_reason: input.reason,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function deleteAdminScheduleBlock(id: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_schedule_block', {
    p_block_id: id,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase.rpc('admin_list_admin_users')

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as AdminUser[]
}

export async function saveAdminUser(input: AdminUserInput): Promise<void> {
  const { error } = await supabase.rpc('admin_upsert_admin_user', {
    p_email: input.email,
    p_display_name: input.displayName,
    p_active: input.active,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatCOP(value: number | null): string {
  if (value === null) {
    return 'Sin precio'
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}
