import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { FaRegStar, FaStar, FaWhatsapp } from 'react-icons/fa'
import { Link, useParams } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import StarRating from '../components/ui/StarRating'
import { siteConfig } from '../data/site'
import { formatDateTimeLong } from '../lib/dates'
import {
  fetchReviewInvitation,
  mapReviewError,
  submitPublicReview,
} from '../lib/reviews'
import type { ReviewInvitationDetails } from '../lib/reviews'
import { usePageMeta } from '../lib/seo'

const ratingLabels = ['', 'Muy mala', 'Mala', 'Regular', 'Muy buena', 'Excelente']

export default function ReviewPage() {
  usePageMeta({
    title: 'Comparte tu experiencia | Perfect Woman T',
    description: 'Cuéntanos cómo fue tu experiencia en Perfect Woman T.',
    path: '/opinion',
    noIndex: true,
  })

  const { token = '' } = useParams<{ token: string }>()
  const [invitation, setInvitation] = useState<ReviewInvitationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError(null)
    setAlreadySubmitted(false)

    fetchReviewInvitation(token)
      .then((details) => {
        if (active) {
          setInvitation(details)
          setDisplayName((current) => current || details.client_first_name)
        }
      })
      .catch((error: unknown) => {
        if (!active) {
          return
        }

        const message = error instanceof Error ? error.message : ''

        if (message === 'REVIEW_ALREADY_SUBMITTED') {
          setAlreadySubmitted(true)
          return
        }

        setLoadError(mapReviewError(error))
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [token])

  useEffect(() => {
    if (submitted) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [submitted])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (rating === 0) {
      setSubmitError('Selecciona una calificación de 1 a 5 estrellas.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      await submitPublicReview({
        token,
        displayName: displayName.trim(),
        rating,
        message: message.trim(),
        consent,
      })
      setSubmitted(true)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ''

      if (errorMessage === 'REVIEW_ALREADY_SUBMITTED') {
        setAlreadySubmitted(true)
        return
      }

      setSubmitError(mapReviewError(error))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageShell>
        <div className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center px-margin py-space-3xl text-center">
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Cargando tu invitación...
          </p>
        </div>
      </PageShell>
    )
  }

  if (alreadySubmitted || submitted) {
    return (
      <PageShell>
        <section className="mx-auto w-full max-w-2xl px-margin py-space-3xl text-center md:px-margin-tablet">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
            Gracias por tu confianza
          </span>
          <h1 className="mt-space-sm font-headline-lg text-headline-lg-mobile uppercase leading-tight text-primary md:text-headline-lg">
            {submitted ? 'Tu opinión fue enviada' : 'Ya recibimos tu opinión'}
          </h1>
          <p className="mt-space-md font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
            Revisaremos tu experiencia antes de publicarla. Tu nombre y tu opinión
            nos ayudan a seguir cuidando cada detalle.
          </p>
          {rating > 0 && (
            <div className="mt-space-lg flex justify-center">
              <StarRating rating={rating} size="lg" />
            </div>
          )}
          <Link
            className="mt-space-xl inline-block bg-primary px-6 py-3 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary"
            to="/"
          >
            Volver al inicio
          </Link>
        </section>
      </PageShell>
    )
  }

  if (loadError || !invitation) {
    return (
      <PageShell>
        <section className="mx-auto w-full max-w-2xl px-margin py-space-3xl text-center md:px-margin-tablet">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
            Enlace de opinión
          </span>
          <h1 className="mt-space-sm font-headline-lg text-headline-lg-mobile uppercase leading-tight text-primary md:text-headline-lg">
            No pudimos abrir esta invitación
          </h1>
          <p className="mt-space-md font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
            {loadError ?? 'Este enlace no es válido.'}
          </p>
          <a
            className="mt-space-xl inline-flex items-center gap-2 bg-primary px-5 py-3 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary"
            href={siteConfig.whatsapp}
            rel="noopener noreferrer"
            target="_blank"
          >
            <FaWhatsapp aria-hidden="true" />
            Solicitar un enlace nuevo
          </a>
        </section>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <section className="mx-auto w-full max-w-4xl px-margin py-space-3xl md:px-margin-tablet lg:px-margin-desktop">
        <div className="grid grid-cols-1 gap-space-2xl lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
              Tu experiencia
            </span>
            <h1 className="mt-space-sm font-headline-lg text-headline-lg-mobile uppercase leading-tight tracking-tight text-primary md:text-headline-lg">
              Cuéntanos cómo te sentiste
            </h1>
            <p className="mt-space-md font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
              Tu opinión se publicará con tu autorización después de una revisión
              del estudio.
            </p>

            <dl className="mt-space-xl space-y-space-sm border-t border-surface-container pt-space-md font-body-sm text-body-sm">
              <div>
                <dt className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
                  Servicio
                </dt>
                <dd className="mt-1 font-title-lg text-title-lg text-primary">
                  {invitation.service_name}
                </dd>
              </div>
              <div>
                <dt className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
                  Especialista
                </dt>
                <dd className="mt-1 text-primary">{invitation.professional_name}</dd>
              </div>
              <div>
                <dt className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
                  Visita
                </dt>
                <dd className="mt-1 text-primary">
                  {formatDateTimeLong(invitation.appointment_starts_at, siteConfig.timeZone)}
                </dd>
              </div>
            </dl>
          </div>

          <form
            className="space-y-space-lg border border-surface-container bg-surface-container-lowest p-space-lg shadow-sm sm:p-space-xl lg:col-span-7"
            onSubmit={handleSubmit}
          >
            <fieldset>
              <legend className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
                Calificación *
              </legend>
              <div className="mt-space-sm flex flex-wrap items-center gap-space-sm">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const Icon = star <= rating ? FaStar : FaRegStar

                    return (
                      <button
                        key={star}
                        aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
                        aria-pressed={star <= rating}
                        className="p-1 text-2xl text-brand-pink transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2"
                        onClick={() => {
                          setRating(star)
                          setSubmitError(null)
                        }}
                        type="button"
                      >
                        <Icon aria-hidden="true" />
                      </button>
                    )
                  })}
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {rating > 0 ? `${rating} de 5 · ${ratingLabels[rating]}` : 'Elige de 1 a 5 estrellas'}
                </span>
              </div>
            </fieldset>

            <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
              Nombre que verás publicado *
              <input
                className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
                maxLength={60}
                onChange={(event) => setDisplayName(event.target.value)}
                required
                value={displayName}
              />
            </label>

            <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
              Tu opinión *
              <textarea
                className="min-h-36 resize-y border border-surface-container bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-primary outline-none focus:border-secondary"
                maxLength={600}
                minLength={10}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Cuéntanos qué te gustó, cómo fue la atención y cómo te sentiste con el resultado."
                required
                value={message}
              />
              <span className="self-end font-body-sm text-[11px] text-on-surface-variant">
                {message.trim().length}/600
              </span>
            </label>

            <label className="flex items-start gap-2 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
              <input
                checked={consent}
                className="mt-0.5"
                onChange={(event) => setConsent(event.target.checked)}
                required
                type="checkbox"
              />
              <span>
                Autorizo publicar mi nombre y esta opinión en el sitio del estudio.
                Puedes consultar la{' '}
                <Link
                  className="underline decoration-secondary/40 underline-offset-2 hover:text-primary"
                  to={siteConfig.privacyPath}
                >
                  política de privacidad
                </Link>
                .
              </span>
            </label>

            {submitError && (
              <p
                className="border-l-2 border-error bg-error-container px-3 py-2 font-body-sm text-body-sm text-on-error-container"
                role="alert"
              >
                {submitError}
              </p>
            )}

            <button
              className="w-full bg-primary px-5 py-3 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={submitting || !consent}
              type="submit"
            >
              {submitting ? 'Enviando...' : 'Enviar opinión'}
            </button>

            <p className="font-body-sm text-[11px] leading-relaxed text-on-surface-variant">
              Este enlace es personal, puede usarse una sola vez y vence el{' '}
              {formatDateTimeLong(invitation.expires_at, siteConfig.timeZone)}.
            </p>
          </form>
        </div>
      </section>
    </PageShell>
  )
}
