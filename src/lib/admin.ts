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

export type AdminCreatedAppointment = {
  appointment_id: string
  confirmation_code: string
  status: AppointmentStatus
  starts_at: string
  ends_at: string
  service_name: string
  professional_name: string
  client_name: string
}

export type AdminRescheduledAppointment = AppointmentStatusResult & {
  starts_at: string
  ends_at: string
}

export type CreateAdminAppointmentInput = {
  serviceId: string
  professionalId: string
  startsAt: string
  fullName: string
  phone: string
  email: string | null
  notes: string | null
  adminNotes: string | null
  status: 'pending' | 'confirmed'
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

export async function createAdminAppointment(
  input: CreateAdminAppointmentInput,
): Promise<AdminCreatedAppointment> {
  const { data, error } = await supabase.rpc('admin_create_appointment', {
    p_service_id: input.serviceId,
    p_professional_id: input.professionalId,
    p_starts_at: input.startsAt,
    p_full_name: input.fullName,
    p_phone: input.phone,
    p_email: input.email,
    p_notes: input.notes,
    p_admin_notes: input.adminNotes,
    p_status: input.status,
  })

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as AdminCreatedAppointment[]

  if (!rows[0]) {
    throw new Error('APPOINTMENT_EMPTY_RESPONSE')
  }

  return rows[0]
}

export async function rescheduleAdminAppointment(
  appointmentId: string,
  startsAt: string,
): Promise<AdminRescheduledAppointment> {
  const { data, error } = await supabase.rpc('admin_reschedule_appointment', {
    p_appointment_id: appointmentId,
    p_starts_at: startsAt,
  })

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as AdminRescheduledAppointment[]

  if (!rows[0]) {
    throw new Error('APPOINTMENT_EMPTY_RESPONSE')
  }

  return rows[0]
}

export async function updateAppointmentNotes(
  appointmentId: string,
  adminNotes: string | null,
): Promise<string | null> {
  const { data, error } = await supabase.rpc('admin_update_appointment_notes', {
    p_appointment_id: appointmentId,
    p_admin_notes: adminNotes,
  })

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as Array<{ admin_notes: string | null }>

  return rows[0]?.admin_notes ?? null
}

export function mapAdminError(error: unknown): string {
  const message = error instanceof Error ? error.message : ''

  switch (message) {
    case 'NOT_ADMIN':
      return 'Tu usuario no tiene permisos de administración.'
    case 'APPOINTMENT_NOT_FOUND':
      return 'La cita ya no existe. Actualiza la lista.'
    case 'BLOCK_NOT_FOUND':
      return 'El bloqueo ya no existe. Actualiza la lista.'
    case 'INVALID_STATUS':
    case 'INVALID_STATUS_TRANSITION':
      return 'La cita ya está cerrada o el cambio de estado no es válido.'
    case 'CANCELLATION_REASON_REQUIRED':
      return 'Escribe el motivo de la cancelación.'
    case 'SLOT_UNAVAILABLE':
      return 'Ese horario no está disponible. Elige otro.'
    case 'INVALID_SLOT':
      return 'Selecciona una fecha y hora válidas.'
    case 'INVALID_NAME':
      return 'Escribe un nombre válido.'
    case 'INVALID_PHONE':
      return 'Escribe un teléfono válido.'
    case 'INVALID_EMAIL':
      return 'Escribe un correo válido.'
    case 'INVALID_NOTES':
      return 'Las notas son demasiado largas.'
    case 'INVALID_DATE_RANGE':
      return 'La fecha final debe ser posterior a la inicial.'
    case 'INVALID_REASON':
      return 'El motivo es demasiado largo.'
    case 'EMAIL_IN_USE':
      return 'Ese correo ya está asociado a otra clienta.'
    case 'AUTH_USER_NOT_FOUND':
      return 'Ese correo no existe en Supabase Auth. Crea primero el usuario.'
    case 'CANNOT_DEACTIVATE_SELF':
      return 'No puedes desactivar tu propia cuenta.'
    case 'BLOCK_OVERLAPS_APPOINTMENT':
      return 'El bloqueo se cruza con una cita activa. Reprograma o cancela primero.'
    case 'SERVICE_NOT_AVAILABLE':
      return 'El servicio no está disponible.'
    case 'PROFESSIONAL_NOT_AVAILABLE':
      return 'La especialista no está disponible.'
    default:
      if (message.toLowerCase().includes('jwt')) {
        return 'Tu sesión expiró. Vuelve a iniciar sesión.'
      }

      if (message.includes('duplicate key') || message.includes('unique')) {
        return 'Ya existe un registro con ese slug, correo o teléfono.'
      }

      if (message.includes('violates check constraint')) {
        return 'Revisa los valores del formulario.'
      }

      return 'No pudimos guardar los cambios. Intenta de nuevo.'
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
