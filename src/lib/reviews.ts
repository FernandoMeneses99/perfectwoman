import { supabase } from './supabase'

export type PublicReview = {
  id: string
  display_name: string
  rating: number
  message: string
  created_at: string
}

export type PublicReviewSummary = {
  reviewCount: number
  averageRating: number | null
}

export type ReviewInvitationDetails = {
  invitation_id: string
  service_name: string
  professional_name: string
  appointment_starts_at: string
  client_first_name: string
  expires_at: string
}

export type SubmitReviewInput = {
  token: string
  displayName: string
  rating: number
  message: string
  consent: boolean
}

export type SubmittedReview = {
  review_id: string
  status: string
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export type AdminReview = {
  id: string
  display_name: string
  rating: number
  message: string
  status: ReviewStatus
  admin_note: string | null
  published_at: string | null
  created_at: string
  appointment: {
    confirmation_code: string
    starts_at: string
    client: { full_name: string; phone: string } | null
    service: { name: string } | null
  } | null
}

export type AdminReviewInvitation = {
  id: string
  appointment_id: string
  expires_at: string
  used_at: string | null
  created_at: string
  appointment: {
    confirmation_code: string
    starts_at: string
    status: string
    client: { full_name: string; phone: string } | null
    service: { name: string } | null
  } | null
}

export type ReviewInvitationLink = {
  invitation_id: string
  token: string
  expires_at: string
  appointment_id: string
  client_name: string
  client_phone: string
  service_name: string
  appointment_starts_at: string
}

const adminReviewSelect = `
  id,
  display_name,
  rating,
  message,
  status,
  admin_note,
  published_at,
  created_at,
  appointment:appointments(
    confirmation_code,
    starts_at,
    client:clients(full_name, phone),
    service:services(name)
  )
`

const adminInvitationSelect = `
  id,
  appointment_id,
  expires_at,
  used_at,
  created_at,
  appointment:appointments(
    confirmation_code,
    starts_at,
    status,
    client:clients(full_name, phone),
    service:services(name)
  )
`

export async function fetchPublicReviews(limit = 9): Promise<PublicReview[]> {
  const { data, error } = await supabase.rpc('get_public_reviews', {
    p_limit: limit,
  })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as PublicReview[]
}

export async function fetchPublicReviewSummary(): Promise<PublicReviewSummary> {
  const { data, error } = await supabase.rpc('get_public_review_summary')

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as Array<{
    review_count: number
    average_rating: number | string | null
  }>
  const row = rows[0]

  return {
    reviewCount: row?.review_count ?? 0,
    averageRating:
      row?.average_rating === null || row?.average_rating === undefined
        ? null
        : Number(row.average_rating),
  }
}

export async function fetchReviewInvitation(
  token: string,
): Promise<ReviewInvitationDetails> {
  const { data, error } = await supabase.rpc('get_public_review_invitation', {
    p_token: token,
  })

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as ReviewInvitationDetails[]

  if (!rows[0]) {
    throw new Error('INVITATION_NOT_FOUND')
  }

  return rows[0]
}

export async function submitPublicReview(
  input: SubmitReviewInput,
): Promise<SubmittedReview> {
  const { data, error } = await supabase.rpc('submit_public_review', {
    p_token: input.token,
    p_display_name: input.displayName,
    p_rating: input.rating,
    p_message: input.message,
    p_consent: input.consent,
  })

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as SubmittedReview[]

  if (!rows[0]) {
    throw new Error('REVIEW_EMPTY_RESPONSE')
  }

  return rows[0]
}

export async function fetchAdminReviews(): Promise<AdminReview[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(adminReviewSelect)
    .order('created_at', { ascending: false })
    .limit(300)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as unknown as AdminReview[]
}

export async function fetchAdminReviewInvitations(): Promise<
  AdminReviewInvitation[]
> {
  const { data, error } = await supabase
    .from('review_invitations')
    .select(adminInvitationSelect)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as unknown as AdminReviewInvitation[]
}

export async function createAdminReviewInvitation(
  appointmentId: string,
): Promise<ReviewInvitationLink> {
  const { data, error } = await supabase.rpc(
    'admin_create_review_invitation',
    {
      p_appointment_id: appointmentId,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as ReviewInvitationLink[]

  if (!rows[0]) {
    throw new Error('INVITATION_EMPTY_RESPONSE')
  }

  return rows[0]
}

export async function updateAdminReviewStatus(
  reviewId: string,
  status: 'approved' | 'rejected',
  note: string | null = null,
): Promise<{
  review_id: string
  status: ReviewStatus
  published_at: string | null
  admin_note: string | null
}> {
  const { data, error } = await supabase.rpc('admin_set_review_status', {
    p_review_id: reviewId,
    p_status: status,
    p_note: note,
  })

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as Array<{
    review_id: string
    status: ReviewStatus
    published_at: string | null
    admin_note: string | null
  }>

  if (!rows[0]) {
    throw new Error('REVIEW_EMPTY_RESPONSE')
  }

  return rows[0]
}

export function mapReviewError(error: unknown): string {
  const message = error instanceof Error ? error.message : ''

  switch (message) {
    case 'INVITATION_NOT_FOUND':
      return 'Este enlace de opinión no es válido. Solicita uno nuevo al estudio.'
    case 'INVITATION_EXPIRED':
      return 'Este enlace de opinión venció. Escríbenos para recibir uno nuevo.'
    case 'REVIEW_ALREADY_SUBMITTED':
      return 'Ya recibimos tu opinión. Gracias por compartir tu experiencia.'
    case 'CONSENT_REQUIRED':
      return 'Autoriza la publicación de tu nombre y opinión para continuar.'
    case 'INVALID_REVIEW_NAME':
      return 'Escribe el nombre que quieres que aparezca publicado.'
    case 'INVALID_REVIEW_RATING':
      return 'Selecciona una calificación de 1 a 5 estrellas.'
    case 'INVALID_REVIEW_MESSAGE':
      return 'La opinión debe tener entre 10 y 600 caracteres.'
    case 'RATE_LIMITED':
      return 'Recibimos varios intentos. Espera unos minutos e intenta de nuevo.'
    default:
      return 'No pudimos enviar tu opinión. Intenta de nuevo en unos minutos.'
  }
}
