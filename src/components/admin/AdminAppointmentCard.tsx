import { useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { siteConfig } from '../../data/site'
import { dateInTimeZone, formatDateLong, formatDateTimeLong, formatTime } from '../../lib/dates'
import type { AdminAppointment, AppointmentStatus } from '../../lib/admin'

type AdminAppointmentCardProps = {
  appointment: AdminAppointment
  updating: boolean
  onStatus: (appointment: AdminAppointment, status: 'confirmed' | 'completed' | 'no_show') => void
  onCancel: (appointment: AdminAppointment) => void
  onReschedule: (appointment: AdminAppointment) => void
  onNotes: (appointment: AdminAppointment) => void
  onRequestReview?: (appointment: AdminAppointment) => void
  requestingReview?: boolean
}

const statusLabels: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistió',
}

const statusStyles: Record<AppointmentStatus, string> = {
  pending: 'bg-amber-100 text-amber-900',
  confirmed: 'bg-emerald-100 text-emerald-900',
  completed: 'bg-sky-100 text-sky-900',
  cancelled: 'bg-rose-100 text-rose-900',
  no_show: 'bg-zinc-200 text-zinc-700',
}

function whatsappHref(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const normalized = digits.startsWith('57') ? digits : `57${digits}`
  return `https://wa.me/${normalized}`
}

export default function AdminAppointmentCard({
  appointment,
  updating,
  onStatus,
  onCancel,
  onReschedule,
  onNotes,
  onRequestReview,
  requestingReview = false,
}: AdminAppointmentCardProps) {
  const [expanded, setExpanded] = useState(false)
  const appointmentDate = dateInTimeZone(appointment.starts_at, siteConfig.timeZone)
  const isTerminal = ['completed', 'cancelled', 'no_show'].includes(appointment.status)

  return (
    <article className="border border-surface-container bg-surface-container-lowest shadow-sm">
      <div className="flex flex-col gap-space-md p-space-md sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-space-md">
          <div className="min-w-24 border-l-2 border-brand-pink pl-3">
            <p className="font-label-caps text-[10px] uppercase tracking-wider text-secondary">
              {formatDateLong(appointmentDate, siteConfig.timeZone)}
            </p>
            <p className="mt-1 font-headline-sm text-headline-sm text-primary">
              {formatTime(appointment.starts_at, siteConfig.timeZone)}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              hasta {formatTime(appointment.ends_at, siteConfig.timeZone)}
            </p>
          </div>

          <div className="min-w-0">
            <h3 className="font-title-lg text-title-lg uppercase text-primary">
              {appointment.service?.name ?? 'Servicio sin nombre'}
            </h3>
            <p className="mt-1 font-body-md text-body-md font-semibold text-primary">
              {appointment.client?.full_name ?? 'Clienta sin nombre'}
            </p>
            <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
              {appointment.client?.phone ?? 'Sin teléfono'} · {appointment.professional?.full_name ?? 'Sin especialista'}
            </p>
            <p className="mt-1 font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
              Código {appointment.confirmation_code}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-space-sm sm:items-end">
          <span className={`px-2.5 py-1 font-label-caps text-[10px] uppercase tracking-wider ${statusStyles[appointment.status]}`}>
            {statusLabels[appointment.status]}
          </span>
          <button
            className="font-label-caps text-[10px] uppercase tracking-wider text-secondary underline decoration-secondary/40 underline-offset-4 transition-colors hover:text-primary"
            onClick={() => setExpanded((value) => !value)}
            type="button"
          >
            {expanded ? 'Ocultar detalle' : 'Ver detalle'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-surface-container bg-surface-container-low px-space-md py-space-md">
          <dl className="grid grid-cols-1 gap-space-sm font-body-sm text-body-sm sm:grid-cols-2">
            <div>
              <dt className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">Correo</dt>
              <dd className="mt-0.5 text-primary">{appointment.client?.email ?? 'No registrado'}</dd>
            </div>
            <div>
              <dt className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">Origen</dt>
              <dd className="mt-0.5 text-primary">
                {appointment.source === 'public' ? 'Reserva pública' : 'Creada por administración'}
              </dd>
            </div>
            <div>
              <dt className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">Creada</dt>
              <dd className="mt-0.5 text-primary">
                {formatDateTimeLong(appointment.created_at, siteConfig.timeZone)}
              </dd>
            </div>
            <div>
              <dt className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">Duración</dt>
              <dd className="mt-0.5 text-primary">{appointment.service?.duration_minutes ?? 0} min</dd>
            </div>
          </dl>

          {appointment.notes && (
            <div className="mt-space-md">
              <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">Notas de la clienta</p>
              <p className="mt-1 whitespace-pre-wrap font-body-sm text-body-sm text-primary">{appointment.notes}</p>
            </div>
          )}

          {appointment.admin_notes && (
            <div className="mt-space-md">
              <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">Notas internas</p>
              <p className="mt-1 whitespace-pre-wrap font-body-sm text-body-sm text-primary">{appointment.admin_notes}</p>
            </div>
          )}

          {appointment.cancellation_reason && (
            <div className="mt-space-md">
              <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">Motivo de cancelación</p>
              <p className="mt-1 whitespace-pre-wrap font-body-sm text-body-sm text-primary">{appointment.cancellation_reason}</p>
            </div>
          )}

          <div className="mt-space-md flex flex-wrap gap-space-sm">
            {appointment.client?.phone && (
              <>
                <a
                  className="flex items-center gap-2 border border-surface-container bg-surface-container-lowest px-3 py-2 font-label-caps text-[10px] uppercase tracking-wider text-primary transition-colors hover:border-secondary"
                  href={`tel:${appointment.client.phone}`}
                >
                  Llamar
                </a>
                <a
                  className="flex items-center gap-2 border border-surface-container bg-surface-container-lowest px-3 py-2 font-label-caps text-[10px] uppercase tracking-wider text-primary transition-colors hover:border-secondary"
                  href={whatsappHref(appointment.client.phone)}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <FaWhatsapp aria-hidden="true" className="text-secondary" />
                  WhatsApp
                </a>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-space-sm border-t border-surface-container px-space-md py-space-md sm:flex-row sm:items-center sm:justify-between">
        {isTerminal ? (
          <div className="flex w-full flex-col gap-space-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="font-body-sm text-body-sm text-on-surface-variant">Esta cita ya está cerrada.</p>
            {appointment.status === 'completed' && onRequestReview && (
              <button
                className="w-fit border border-surface-container px-4 py-2 font-label-caps text-[10px] uppercase tracking-wider text-primary transition-colors hover:border-secondary disabled:cursor-not-allowed disabled:opacity-50"
                disabled={requestingReview}
                onClick={() => onRequestReview(appointment)}
                type="button"
              >
                {requestingReview ? 'Generando...' : 'Pedir opinión'}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-space-sm">
            {appointment.status === 'pending' && (
              <button
                className="bg-primary px-4 py-2 font-label-caps text-[10px] uppercase tracking-wider text-on-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                disabled={updating}
                onClick={() => onStatus(appointment, 'confirmed')}
                type="button"
              >
                Confirmar
              </button>
            )}

            {appointment.status === 'confirmed' && (
              <>
                <button
                  className="bg-primary px-4 py-2 font-label-caps text-[10px] uppercase tracking-wider text-on-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={updating}
                  onClick={() => onStatus(appointment, 'completed')}
                  type="button"
                >
                  Completar
                </button>
                <button
                  className="border border-surface-container px-4 py-2 font-label-caps text-[10px] uppercase tracking-wider text-primary transition-colors hover:border-secondary disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={updating}
                  onClick={() => onStatus(appointment, 'no_show')}
                  type="button"
                >
                  No asistió
                </button>
              </>
            )}

            <button
              className="border border-surface-container px-4 py-2 font-label-caps text-[10px] uppercase tracking-wider text-primary transition-colors hover:border-secondary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={updating}
              onClick={() => onReschedule(appointment)}
              type="button"
            >
              Reprogramar
            </button>

            <button
              className="border border-surface-container px-4 py-2 font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant transition-colors hover:border-secondary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={updating}
              onClick={() => onNotes(appointment)}
              type="button"
            >
              Notas
            </button>

            <button
              className="border border-error/40 px-4 py-2 font-label-caps text-[10px] uppercase tracking-wider text-error transition-colors hover:border-error hover:bg-error-container disabled:cursor-not-allowed disabled:opacity-50"
              disabled={updating}
              onClick={() => onCancel(appointment)}
              type="button"
            >
              Cancelar
            </button>
          </div>
        )}

        {updating && (
          <span className="font-body-sm text-body-sm text-on-surface-variant">Actualizando…</span>
        )}
      </div>
    </article>
  )
}
