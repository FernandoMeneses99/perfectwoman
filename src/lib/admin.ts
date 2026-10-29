import { supabase } from './supabase'

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export type AdminProfile = {
  user_id: string
  email: string
  display_name: string | null
}

export type AdminAppointment = {
  id: string
  confirmation_code: string
  status: AppointmentStatus
  starts_at: string
  ends_at: string
  source: 'public' | 'admin'
  notes: string | null
  admin_notes: string | null
  cancellation_reason: string | null
  confirmed_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  created_at: string
  service: { name: string; duration_minutes: number } | null
  professional: { full_name: string } | null
  client: { full_name: string; phone: string; email: string | null } | null
}

export type AppointmentStatusResult = {
  appointment_id: string
  status: AppointmentStatus
  confirmed_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
}

export async function signInAdmin(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    throw new Error(error.message)
  }
}

export async function signOutAdmin(): Promise<void> {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

export async function fetchAdminProfile(userId: string): Promise<AdminProfile | null> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id, email, display_name')
    .eq('user_id', userId)
    .eq('active', true)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? null) as AdminProfile | null
}

export async function fetchAdminAppointments(): Promise<AdminAppointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select(
      `
        id,
        confirmation_code,
        status,
        starts_at,
        ends_at,
        source,
        notes,
        admin_notes,
        cancellation_reason,
        confirmed_at,
        completed_at,
        cancelled_at,
        created_at,
        service:services(name, duration_minutes),
        professional:professionals(full_name),
        client:clients(full_name, phone, email)
      `,
    )
    .order('starts_at', { ascending: false })
    .limit(300)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as unknown as AdminAppointment[]
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: Exclude<AppointmentStatus, 'pending'>,
  reason: string | null = null,
): Promise<AppointmentStatusResult> {
  const { data, error } = await supabase.rpc('admin_set_appointment_status', {
    p_appointment_id: appointmentId,
    p_status: status,
    p_reason: reason,
  })

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as AppointmentStatusResult[]

  if (!rows[0]) {
    throw new Error('APPOINTMENT_EMPTY_RESPONSE')
  }

  return rows[0]
}

export function mapAdminError(error: unknown): string {
  const message = error instanceof Error ? error.message : ''

  switch (message) {
    case 'NOT_ADMIN':
      return 'Tu usuario no tiene permisos de administración.'
    case 'APPOINTMENT_NOT_FOUND':
      return 'La cita ya no existe. Actualiza la lista.'
    case 'INVALID_STATUS':
    case 'INVALID_STATUS_TRANSITION':
      return 'La cita ya está cerrada o el cambio de estado no es válido.'
    case 'CANCELLATION_REASON_REQUIRED':
      return 'Escribe el motivo de la cancelación.'
    case 'INVALID_REASON':
      return 'El motivo de cancelación es demasiado largo.'
    default:
      if (message.toLowerCase().includes('jwt')) {
        return 'Tu sesión expiró. Vuelve a iniciar sesión.'
      }

      return 'No pudimos actualizar la cita. Intenta de nuevo.'
  }
}

export function mapAccessError(error: unknown): string {
  const message = error instanceof Error ? error.message : ''

  if (message.toLowerCase().includes('jwt')) {
    return 'Tu sesión expiró. Vuelve a iniciar sesión.'
  }

  if (message.toLowerCase().includes('permission denied')) {
    return 'Tu usuario no tiene permisos de administración.'
  }

  return 'No pudimos verificar tu acceso. Revisa tu conexión e intenta de nuevo.'
}

export function mapAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : ''

  if (message.includes('Invalid login credentials')) {
    return 'Correo o contraseña incorrectos.'
  }

  if (message.includes('Email not confirmed')) {
    return 'El correo de este usuario aún no está confirmado en Supabase.'
  }

  if (message.toLowerCase().includes('too many requests')) {
    return 'Demasiados intentos. Espera unos minutos e intenta de nuevo.'
  }

  return 'No pudimos iniciar sesión. Intenta de nuevo.'
}
