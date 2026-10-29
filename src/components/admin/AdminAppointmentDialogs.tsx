import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { siteConfig } from '../../data/site'
import {
  createAdminAppointment,
  mapAdminError,
  rescheduleAdminAppointment,
  updateAppointmentNotes,
} from '../../lib/admin'
import type { AdminAppointment } from '../../lib/admin'
import {
  fetchAdminProfessionals,
  fetchAdminServices,
} from '../../lib/adminCatalog'
import type { AdminProfessional, AdminService } from '../../lib/adminCatalog'
import {
  addDays,
  isoToLocalDateTime,
  localDateTimeToIso,
  todayInTimeZone,
} from '../../lib/dates'
import AdminModal from './AdminModal'

type CreateDialogProps = {
  onClose: () => void
  onSaved: (message: string) => void
}

export function AdminCreateAppointmentDialog({ onClose, onSaved }: CreateDialogProps) {
  const [services, setServices] = useState<AdminService[]>([])
  const [professionals, setProfessionals] = useState<AdminProfessional[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [serviceId, setServiceId] = useState('')
  const [professionalId, setProfessionalId] = useState('')
  const [startsAt, setStartsAt] = useState(
    `${addDays(todayInTimeZone(siteConfig.timeZone), 1)}T10:00`,
  )
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [status, setStatus] = useState<'pending' | 'confirmed'>('confirmed')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    Promise.all([fetchAdminServices(), fetchAdminProfessionals()])
      .then(([nextServices, nextProfessionals]) => {
        if (!active) {
          return
        }

        const activeServices = nextServices.filter((service) => service.active)
        const activeProfessionals = nextProfessionals.filter(
          (professional) => professional.active,
        )

        setServices(activeServices)
        setProfessionals(activeProfessionals)
        setServiceId(activeServices[0]?.id ?? '')
        setProfessionalId(activeProfessionals[0]?.id ?? '')
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(mapAdminError(loadError))
        }
      })
      .finally(() => {
        if (active) {
          setLoadingOptions(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const result = await createAdminAppointment({
        serviceId,
        professionalId,
        startsAt: localDateTimeToIso(startsAt, siteConfig.timeZone),
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        notes: notes.trim() || null,
        adminNotes: adminNotes.trim() || null,
        status,
      })

      onSaved(`Cita ${result.confirmation_code} creada.`)
    } catch (submitError) {
      setError(mapAdminError(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminModal
      busy={submitting}
      eyebrow="Agenda"
      onClose={onClose}
      title="Nueva cita"
    >
      {loadingOptions ? (
        <p className="font-body-md text-body-md text-on-surface-variant">
          Cargando servicios y especialistas…
        </p>
      ) : (
        <form className="space-y-space-md" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
            <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
              Servicio *
              <select
                className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
                onChange={(event) => setServiceId(event.target.value)}
                required
                value={serviceId}
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
              Especialista *
              <select
                className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
                onChange={(event) => setProfessionalId(event.target.value)}
                required
                value={professionalId}
              >
                {professionals.map((professional) => (
                  <option key={professional.id} value={professional.id}>
                    {professional.full_name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
            <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
              Fecha y hora *
              <input
                className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
                onChange={(event) => setStartsAt(event.target.value)}
                required
                type="datetime-local"
                value={startsAt}
              />
            </label>

            <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
              Estado inicial
              <select
                className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
                onChange={(event) =>
                  setStatus(event.target.value as 'pending' | 'confirmed')
                }
                value={status}
              >
                <option value="confirmed">Confirmada</option>
                <option value="pending">Pendiente</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
            <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
              Nombre de la clienta *
              <input
                className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
                maxLength={120}
                onChange={(event) => setFullName(event.target.value)}
                required
                value={fullName}
              />
            </label>

            <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
              Teléfono *
              <input
                className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
                inputMode="tel"
                maxLength={30}
                onChange={(event) => setPhone(event.target.value)}
                required
                value={phone}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Correo
            <input
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>

          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Notas de la clienta
            <textarea
              className="min-h-20 resize-y border border-surface-container bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              maxLength={2000}
              onChange={(event) => setNotes(event.target.value)}
              value={notes}
            />
          </label>

          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Notas internas
            <textarea
              className="min-h-20 resize-y border border-surface-container bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              maxLength={2000}
              onChange={(event) => setAdminNotes(event.target.value)}
              value={adminNotes}
            />
          </label>

          {error && (
            <p
              className="border-l-2 border-error bg-error-container px-3 py-2 font-body-sm text-body-sm text-on-error-container"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col gap-space-sm pt-space-sm sm:flex-row sm:justify-end">
            <button
              className="border border-surface-container px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:border-secondary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={submitting}
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="bg-primary px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={submitting || !serviceId || !professionalId}
              type="submit"
            >
              {submitting ? 'Creando…' : 'Crear cita'}
            </button>
          </div>
        </form>
      )}
    </AdminModal>
  )
}

type RescheduleDialogProps = {
  appointment: AdminAppointment
  onClose: () => void
  onSaved: (message: string) => void
}

export function AdminRescheduleDialog({
  appointment,
  onClose,
  onSaved,
}: RescheduleDialogProps) {
  const [startsAt, setStartsAt] = useState(
    isoToLocalDateTime(appointment.starts_at, siteConfig.timeZone),
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await rescheduleAdminAppointment(
        appointment.id,
        localDateTimeToIso(startsAt, siteConfig.timeZone),
      )
      onSaved('Cita reprogramada.')
    } catch (submitError) {
      setError(mapAdminError(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminModal
      busy={submitting}
      eyebrow="Agenda"
      onClose={onClose}
      title="Reprogramar cita"
    >
      <form className="space-y-space-md" onSubmit={handleSubmit}>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {appointment.client?.full_name ?? 'Clienta'} ·{' '}
          {appointment.service?.name ?? 'Servicio'}. Se validan horarios,
          bloqueos y cruces con otras citas.
        </p>

        <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
          Nueva fecha y hora *
          <input
            className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
            onChange={(event) => setStartsAt(event.target.value)}
            required
            type="datetime-local"
            value={startsAt}
          />
        </label>

        {error && (
          <p
            className="border-l-2 border-error bg-error-container px-3 py-2 font-body-sm text-body-sm text-on-error-container"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col gap-space-sm pt-space-sm sm:flex-row sm:justify-end">
          <button
            className="border border-surface-container px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:border-secondary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={submitting}
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="bg-primary px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Guardando…' : 'Guardar cambio'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}

type NotesDialogProps = {
  appointment: AdminAppointment
  onClose: () => void
  onSaved: (message: string) => void
}

export function AdminNotesDialog({ appointment, onClose, onSaved }: NotesDialogProps) {
  const [notes, setNotes] = useState(appointment.admin_notes ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await updateAppointmentNotes(appointment.id, notes.trim() || null)
      onSaved('Notas internas actualizadas.')
    } catch (submitError) {
      setError(mapAdminError(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminModal
      busy={submitting}
      eyebrow="Agenda"
      onClose={onClose}
      title="Notas internas"
    >
      <form className="space-y-space-md" onSubmit={handleSubmit}>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {appointment.client?.full_name ?? 'Clienta'} ·{' '}
          {appointment.service?.name ?? 'Servicio'}
        </p>

        <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
          Notas visibles solo para administración
          <textarea
            autoFocus
            className="min-h-32 resize-y border border-surface-container bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-primary outline-none focus:border-secondary"
            maxLength={2000}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Ej. Llega con acompañante, alergias, preferencias…"
            value={notes}
          />
        </label>

        {error && (
          <p
            className="border-l-2 border-error bg-error-container px-3 py-2 font-body-sm text-body-sm text-on-error-container"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col gap-space-sm pt-space-sm sm:flex-row sm:justify-end">
          <button
            className="border border-surface-container px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:border-secondary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={submitting}
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="bg-primary px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Guardando…' : 'Guardar notas'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
