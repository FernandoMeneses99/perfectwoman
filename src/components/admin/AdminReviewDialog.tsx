import { useState } from 'react'
import { FaCheck, FaCopy, FaWhatsapp } from 'react-icons/fa'
import { siteConfig } from '../../data/site'
import { formatDateTimeLong } from '../../lib/dates'
import type { ReviewInvitationLink } from '../../lib/reviews'
import AdminModal from './AdminModal'

type AdminReviewDialogProps = {
  link: ReviewInvitationLink | null
  loading: boolean
  error: string | null
  onClose: () => void
}

function whatsappHref(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const normalized = digits.startsWith('57') ? digits : `57${digits}`
  return `https://wa.me/${normalized}`
}

export default function AdminReviewDialog({
  link,
  loading,
  error,
  onClose,
}: AdminReviewDialogProps) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState<string | null>(null)

  const reviewUrl = link ? `${siteConfig.url}/opinion/${link.token}` : ''
  const firstName = link?.client_name.split(' ')[0] ?? 'Hola'
  const whatsappMessage = link
    ? `Hola ${firstName}, gracias por visitarnos. Nos encantaría conocer tu experiencia en Perfect Woman T: ${reviewUrl}`
    : ''
  const whatsappLink = link
    ? `${whatsappHref(link.client_phone)}?text=${encodeURIComponent(whatsappMessage)}`
    : ''

  async function copyLink() {
    if (!reviewUrl) {
      return
    }

    setCopyError(null)

    try {
      await navigator.clipboard.writeText(reviewUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopyError('No pudimos copiar automáticamente. Selecciona el enlace y cópialo.')
    }
  }

  return (
    <AdminModal
      busy={loading}
      eyebrow="Opiniones"
      onClose={onClose}
      title="Enlace de opinión"
    >
      {loading && (
        <p className="font-body-md text-body-md text-on-surface-variant">
          Generando un enlace seguro...
        </p>
      )}

      {!loading && error && (
        <div className="space-y-space-md">
          <p
            className="border-l-2 border-error bg-error-container px-3 py-2 font-body-sm text-body-sm text-on-error-container"
            role="alert"
          >
            {error}
          </p>
          <button
            className="border border-surface-container px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:border-secondary hover:text-primary"
            onClick={onClose}
            type="button"
          >
            Cerrar
          </button>
        </div>
      )}

      {!loading && link && (
        <div className="space-y-space-md">
          <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
            Envía este enlace a <strong className="text-primary">{link.client_name}</strong>{' '}
            después de su visita de {link.service_name}. Solo puede usarse una vez y
            vence el{' '}
            {formatDateTimeLong(link.expires_at, siteConfig.timeZone)}.
          </p>

          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Enlace para la clienta
            <input
              className="border border-surface-container bg-surface-container-low px-3 py-2.5 font-body-sm text-body-sm text-primary outline-none focus:border-secondary"
              onFocus={(event) => event.target.select()}
              readOnly
              value={reviewUrl}
            />
          </label>

          {copyError && (
            <p className="font-body-sm text-body-sm text-error" role="alert">
              {copyError}
            </p>
          )}

          <div className="flex flex-col gap-space-sm sm:flex-row">
            <button
              className="flex items-center justify-center gap-2 border border-surface-container px-4 py-2.5 font-label-caps text-label-caps uppercase text-primary transition-colors hover:border-secondary"
              onClick={() => void copyLink()}
              type="button"
            >
              {copied ? <FaCheck aria-hidden="true" /> : <FaCopy aria-hidden="true" />}
              {copied ? 'Copiado' : 'Copiar enlace'}
            </button>
            <a
              className="flex items-center justify-center gap-2 bg-primary px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary"
              href={whatsappLink}
              rel="noopener noreferrer"
              target="_blank"
            >
              <FaWhatsapp aria-hidden="true" />
              Enviar por WhatsApp
            </a>
          </div>

          <p className="font-body-sm text-[11px] leading-relaxed text-on-surface-variant">
            Si necesitas regenerar el enlace, vuelve a pulsar “Pedir opinión” en la cita.
            El enlace anterior dejará de funcionar.
          </p>
        </div>
      )}
    </AdminModal>
  )
}
