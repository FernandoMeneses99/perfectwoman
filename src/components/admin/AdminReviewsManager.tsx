import { useEffect, useState } from 'react'
import { siteConfig } from '../../data/site'
import { mapAdminError } from '../../lib/admin'
import { formatDateTimeLong } from '../../lib/dates'
import {
  fetchAdminReviewInvitations,
  fetchAdminReviews,
  updateAdminReviewStatus,
} from '../../lib/reviews'
import type {
  AdminReview,
  AdminReviewInvitation,
  ReviewStatus,
} from '../../lib/reviews'
import StarRating from '../ui/StarRating'

type Filter = 'pending' | 'approved' | 'rejected' | 'all'

const filters: Array<{ id: Filter; label: string }> = [
  { id: 'pending', label: 'Pendientes' },
  { id: 'approved', label: 'Publicadas' },
  { id: 'rejected', label: 'Rechazadas' },
  { id: 'all', label: 'Todas' },
]

const statusLabels: Record<ReviewStatus, string> = {
  pending: 'Pendiente',
  approved: 'Publicada',
  rejected: 'Rechazada',
}

const statusStyles: Record<ReviewStatus, string> = {
  pending: 'bg-amber-100 text-amber-900',
  approved: 'bg-emerald-100 text-emerald-900',
  rejected: 'bg-rose-100 text-rose-900',
}

function invitationStatus(
  invitation: AdminReviewInvitation,
): { label: string; style: string } {
  if (invitation.used_at) {
    return { label: 'Usado', style: 'bg-sky-100 text-sky-900' }
  }

  if (new Date(invitation.expires_at).getTime() <= Date.now()) {
    return { label: 'Vencido', style: 'bg-zinc-200 text-zinc-700' }
  }

  return { label: 'Activo', style: 'bg-emerald-100 text-emerald-900' }
}

export default function AdminReviewsManager() {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [invitations, setInvitations] = useState<AdminReviewInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('pending')

  async function loadReviews() {
    setLoading(true)
    setLoadError(null)

    try {
      const [reviewRows, invitationRows] = await Promise.all([
        fetchAdminReviews(),
        fetchAdminReviewInvitations(),
      ])
      setReviews(reviewRows)
      setInvitations(invitationRows)
    } catch (error) {
      setLoadError(mapAdminError(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadReviews()
  }, [])

  async function moderate(review: AdminReview, status: 'approved' | 'rejected') {
    setUpdatingId(review.id)
    setActionError(null)
    setActionMessage(null)

    try {
      const result = await updateAdminReviewStatus(review.id, status)

      setReviews((current) =>
        current.map((item) =>
          item.id === review.id
            ? {
                ...item,
                status: result.status,
                published_at: result.published_at,
                admin_note: result.admin_note,
              }
            : item,
        ),
      )
      setActionMessage(
        status === 'approved'
          ? 'Opinión publicada en la landing.'
          : 'Opinión retirada de la landing.',
      )
    } catch (error) {
      setActionError(mapAdminError(error))
    } finally {
      setUpdatingId(null)
    }
  }

  const pendingCount = reviews.filter((review) => review.status === 'pending').length
  const approvedReviews = reviews.filter((review) => review.status === 'approved')
  const approvedCount = approvedReviews.length
  const averageRating = approvedCount
    ? approvedReviews.reduce((total, review) => total + review.rating, 0) / approvedCount
    : null
  const activeInvitations = invitations.filter(
    (invitation) =>
      !invitation.used_at &&
      new Date(invitation.expires_at).getTime() > Date.now(),
  ).length
  const visibleReviews =
    filter === 'all' ? reviews : reviews.filter((review) => review.status === filter)

  return (
    <div className="space-y-space-lg py-space-lg md:py-space-xl">
      <div className="flex flex-col gap-space-md sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
            Reputación
          </span>
          <h1 className="mt-space-sm font-headline-lg text-headline-lg-mobile uppercase leading-tight text-primary md:text-headline-lg">
            Opiniones
          </h1>
          <p className="mt-space-sm max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Revisa las experiencias recibidas y decide cuáles se publican en la landing.
          </p>
        </div>

        <button
          className="w-fit border border-surface-container bg-surface-container-lowest px-4 py-2.5 font-label-caps text-label-caps uppercase text-primary transition-colors hover:border-secondary disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
          onClick={() => void loadReviews()}
          type="button"
        >
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-space-sm lg:grid-cols-4">
        <div className="border-l-2 border-amber-400 bg-surface-container-lowest p-space-md shadow-sm">
          <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
            Pendientes
          </p>
          <p className="mt-1 font-headline-md text-headline-md text-primary">{pendingCount}</p>
        </div>
        <div className="border-l-2 border-emerald-400 bg-surface-container-lowest p-space-md shadow-sm">
          <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
            Publicadas
          </p>
          <p className="mt-1 font-headline-md text-headline-md text-primary">{approvedCount}</p>
        </div>
        <div className="border-l-2 border-brand-pink bg-surface-container-lowest p-space-md shadow-sm">
          <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
            Promedio
          </p>
          <p className="mt-1 flex items-center gap-2 font-headline-sm text-headline-sm text-primary">
            {averageRating === null ? '—' : averageRating.toFixed(1)}
            {averageRating !== null && <StarRating rating={averageRating} size="sm" />}
          </p>
        </div>
        <div className="border-l-2 border-secondary bg-surface-container-lowest p-space-md shadow-sm">
          <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
            Enlaces activos
          </p>
          <p className="mt-1 font-headline-md text-headline-md text-primary">
            {activeInvitations}
          </p>
        </div>
      </div>

      {actionMessage && (
        <p
          className="border-l-2 border-emerald-500 bg-emerald-50 px-3 py-2 font-body-sm text-body-sm text-emerald-900"
          role="status"
        >
          {actionMessage}
        </p>
      )}

      {actionError && (
        <p
          className="border-l-2 border-error bg-error-container px-3 py-2 font-body-sm text-body-sm text-on-error-container"
          role="alert"
        >
          {actionError}
        </p>
      )}

      <div className="flex flex-wrap gap-space-sm border-y border-surface-container py-space-md">
        {filters.map((item) => {
          const count =
            item.id === 'all'
              ? reviews.length
              : reviews.filter((review) => review.status === item.id).length

          return (
            <button
              aria-pressed={filter === item.id}
              className={`px-3 py-2 font-label-caps text-[10px] uppercase tracking-wider transition-colors ${
                filter === item.id
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:text-primary'
              }`}
              key={item.id}
              onClick={() => setFilter(item.id)}
              type="button"
            >
              {item.label} ({count})
            </button>
          )
        })}
      </div>

      {loading && reviews.length === 0 && (
        <div className="space-y-space-md" aria-label="Cargando opiniones">
          {[0, 1, 2].map((item) => (
            <div
              className="h-44 animate-pulse border border-surface-container bg-surface-container-low"
              key={item}
            />
          ))}
        </div>
      )}

      {!loading && loadError && (
        <div className="border border-error/30 bg-error-container p-space-lg text-center">
          <p className="font-body-md text-body-md text-on-error-container">{loadError}</p>
          <button
            className="mt-space-md bg-primary px-4 py-2 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary"
            onClick={() => void loadReviews()}
            type="button"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !loadError && visibleReviews.length === 0 && (
        <div className="border border-surface-container bg-surface-container-lowest p-space-xl text-center">
          <p className="font-title-lg text-title-lg uppercase text-primary">
            No hay opiniones en esta vista
          </p>
          <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">
            Genera un enlace desde una cita completada para invitar a una clienta.
          </p>
        </div>
      )}

      {!loadError && visibleReviews.length > 0 && (
        <div className="space-y-space-md">
          {visibleReviews.map((review) => (
            <article
              className="border border-surface-container bg-surface-container-lowest p-space-md shadow-sm"
              key={review.id}
            >
              <div className="flex flex-col gap-space-sm sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-space-sm">
                    <span className="font-title-lg text-title-lg text-primary">
                      {review.display_name}
                    </span>
                    <span
                      className={`px-2.5 py-1 font-label-caps text-[10px] uppercase tracking-wider ${statusStyles[review.status]}`}
                    >
                      {statusLabels[review.status]}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {review.rating} de 5
                    </span>
                  </div>
                </div>
                <p className="font-body-sm text-[11px] text-on-surface-variant">
                  {formatDateTimeLong(review.created_at, siteConfig.timeZone)}
                </p>
              </div>

              <p className="mt-space-md whitespace-pre-wrap font-body-md text-body-md leading-relaxed text-primary">
                {review.message}
              </p>

              <div className="mt-space-md flex flex-wrap gap-x-space-md gap-y-1 border-t border-surface-container pt-space-sm font-body-sm text-body-sm text-on-surface-variant">
                <span>
                  {review.appointment?.service?.name ?? 'Servicio sin nombre'}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {review.appointment?.client?.full_name ?? 'Clienta sin nombre'}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Código {review.appointment?.confirmation_code ?? 'sin código'}
                </span>
              </div>

              {review.admin_note && (
                <p className="mt-space-sm border-l-2 border-outline-variant bg-surface-container-low px-3 py-2 font-body-sm text-body-sm text-on-surface-variant">
                  Nota interna: {review.admin_note}
                </p>
              )}

              <div className="mt-space-md flex flex-wrap gap-space-sm">
                {review.status !== 'approved' && (
                  <button
                    className="bg-primary px-4 py-2 font-label-caps text-[10px] uppercase tracking-wider text-on-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={updatingId === review.id}
                    onClick={() => void moderate(review, 'approved')}
                    type="button"
                  >
                    Publicar
                  </button>
                )}
                {review.status !== 'rejected' && (
                  <button
                    className="border border-error/40 px-4 py-2 font-label-caps text-[10px] uppercase tracking-wider text-error transition-colors hover:border-error hover:bg-error-container disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={updatingId === review.id}
                    onClick={() => void moderate(review, 'rejected')}
                    type="button"
                  >
                    Rechazar
                  </button>
                )}
                {updatingId === review.id && (
                  <span className="self-center font-body-sm text-body-sm text-on-surface-variant">
                    Actualizando...
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="border-t border-surface-container pt-space-lg">
        <div>
          <h2 className="font-title-lg text-title-lg uppercase text-primary">
            Enlaces de opinión
          </h2>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
            Los enlaces se generan desde una cita completada en la agenda. Por
            seguridad, el token no se puede recuperar: si se pierde, genera uno nuevo.
          </p>
        </div>

        {loading ? (
          <p className="mt-space-md font-body-sm text-body-sm text-on-surface-variant">
            Cargando enlaces...
          </p>
        ) : invitations.length === 0 ? (
          <p className="mt-space-md border border-surface-container bg-surface-container-lowest p-space-md font-body-sm text-body-sm text-on-surface-variant">
            Todavía no se han generado enlaces de opinión.
          </p>
        ) : (
          <div className="mt-space-md grid grid-cols-1 gap-space-sm lg:grid-cols-2">
            {invitations.slice(0, 12).map((invitation) => {
              const status = invitationStatus(invitation)

              return (
                <article
                  className="border border-surface-container bg-surface-container-lowest p-space-md"
                  key={invitation.id}
                >
                  <div className="flex items-start justify-between gap-space-sm">
                    <div>
                      <p className="font-body-md font-semibold text-primary">
                        {invitation.appointment?.client?.full_name ?? 'Clienta sin nombre'}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {invitation.appointment?.service?.name ?? 'Servicio sin nombre'} ·{' '}
                        {invitation.appointment?.confirmation_code ?? 'Sin código'}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-1 font-label-caps text-[10px] uppercase tracking-wider ${status.style}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-space-sm font-body-sm text-[11px] text-on-surface-variant">
                    Generado el{' '}
                    {formatDateTimeLong(invitation.created_at, siteConfig.timeZone)} ·
                    Vence el{' '}
                    {formatDateTimeLong(invitation.expires_at, siteConfig.timeZone)}
                  </p>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
