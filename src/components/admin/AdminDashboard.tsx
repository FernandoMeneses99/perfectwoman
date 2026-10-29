import { useCallback, useEffect, useState } from 'react'
import { ADMIN_APPOINTMENT_CREATED_EVENT } from './AdminNotifications'
import AdminAppointmentCard from './AdminAppointmentCard'
import {
  AdminCreateAppointmentDialog,
  AdminNotesDialog,
  AdminRescheduleDialog,
} from './AdminAppointmentDialogs'
import { siteConfig } from '../../data/site'
import { addDays, dateInTimeZone, formatDateLong, formatTime, todayInTimeZone } from '../../lib/dates'
import {
  fetchAdminAppointments,
  mapAdminError,
  updateAppointmentStatus,
} from '../../lib/admin'
import type {
  AdminAppointment,
  AppointmentStatusResult,
} from '../../lib/admin'

type Filter = 'week' | 'today' | 'pending' | 'all'

const filters: Array<{ id: Filter; label: string }> = [
  { id: 'week', label: 'Próximos 7 días' },
  { id: 'today', label: 'Hoy' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'all', label: 'Todas' },
]

const statusMessages: Record<'confirmed' | 'completed' | 'no_show', string> = {
  confirmed: 'Cita confirmada.',
  completed: 'Cita marcada como completada.',
  no_show: 'Cita marcada como no asistida.',
}

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('week')
  const [search, setSearch] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<AdminAppointment | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [rescheduleTarget, setRescheduleTarget] = useState<AdminAppointment | null>(null)
  const [notesTarget, setNotesTarget] = useState<AdminAppointment | null>(null)

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    setLoadError(null)

    try {
      setAppointments(await fetchAdminAppointments())
    } catch (error) {
      setLoadError(mapAdminError(error))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAppointments()
  }, [loadAppointments])

  useEffect(() => {
    function handleNewAppointment() {
      void loadAppointments()
    }

    window.addEventListener(ADMIN_APPOINTMENT_CREATED_EVENT, handleNewAppointment)

    return () => {
      window.removeEventListener(ADMIN_APPOINTMENT_CREATED_EVENT, handleNewAppointment)
    }
  }, [loadAppointments])

  useEffect(() => {
    if (!cancelTarget) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !cancelling) {
        setCancelTarget(null)
        setCancelError(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [cancelTarget, cancelling])

  const today = todayInTimeZone(siteConfig.timeZone)
  const weekEnd = addDays(today, 7)
  const normalizedSearch = search.trim().toLowerCase()

  const visibleAppointments = appointments
    .filter((appointment) => {
      const appointmentDate = dateInTimeZone(appointment.starts_at, siteConfig.timeZone)

      switch (filter) {
        case 'today':
          return appointmentDate === today
        case 'week':
          return appointmentDate >= today && appointmentDate < weekEnd
        case 'pending':
          return appointment.status === 'pending'
        default:
          return true
      }
    })
    .filter((appointment) => {
      if (!normalizedSearch) {
        return true
      }

      const haystack = [
        appointment.confirmation_code,
        appointment.client?.full_name,
        appointment.client?.phone,
        appointment.client?.email,
        appointment.service?.name,
        appointment.professional?.full_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
    .sort((left, right) =>
      filter === 'all'
        ? right.starts_at.localeCompare(left.starts_at)
        : left.starts_at.localeCompare(right.starts_at),
    )

  const pendingCount = appointments.filter((appointment) => appointment.status === 'pending').length
  const confirmedCount = appointments.filter((appointment) => appointment.status === 'confirmed').length
  const todayCount = appointments.filter(
    (appointment) =>
      dateInTimeZone(appointment.starts_at, siteConfig.timeZone) === today &&
      appointment.status !== 'cancelled',
  ).length

  function applyResult(appointmentId: string, result: AppointmentStatusResult) {
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === appointmentId
          ? {
              ...appointment,
              status: result.status,
              confirmed_at: result.confirmed_at,
              completed_at: result.completed_at,
              cancelled_at: result.cancelled_at,
              cancellation_reason: result.cancellation_reason,
            }
          : appointment,
      ),
    )
  }

  async function changeStatus(
    appointment: AdminAppointment,
    status: 'confirmed' | 'completed' | 'no_show',
  ) {
    setUpdatingId(appointment.id)
    setActionError(null)
    setActionMessage(null)

    try {
      const result = await updateAppointmentStatus(appointment.id, status)
      applyResult(appointment.id, result)
      setActionMessage(statusMessages[status])
    } catch (error) {
      setActionError(mapAdminError(error))
    } finally {
      setUpdatingId(null)
    }
  }

  function openCancel(appointment: AdminAppointment) {
    setCancelTarget(appointment)
    setCancelReason('')
    setCancelError(null)
  }

  async function handleCancel() {
    if (!cancelTarget) {
      return
    }

    const reason = cancelReason.trim()

    if (!reason) {
      setCancelError('Escribe el motivo de la cancelación.')
      return
    }

    setCancelling(true)
    setCancelError(null)

    try {
      const result = await updateAppointmentStatus(cancelTarget.id, 'cancelled', reason)
      applyResult(cancelTarget.id, result)
      setActionMessage('Cita cancelada.')
      setCancelTarget(null)
      setCancelReason('')
    } catch (error) {
      setCancelError(mapAdminError(error))
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="py-space-lg md:py-space-xl">
      <div className="flex flex-col gap-space-md sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">Agenda del estudio</span>
          <h1 className="mt-space-sm font-headline-lg text-headline-lg-mobile uppercase leading-tight text-primary md:text-headline-lg">
            Panel de citas
          </h1>
          <p className="mt-space-sm max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Revisa las reservas, confirma la asistencia y mantén actualizada la agenda.
          </p>
        </div>

        <div className="flex flex-wrap gap-space-sm">
          <button
            className="w-fit bg-primary px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
            onClick={() => setShowCreate(true)}
            type="button"
          >
            Nueva cita
          </button>
          <button
            className="w-fit border border-surface-container bg-surface-container-lowest px-4 py-2.5 font-label-caps text-label-caps uppercase text-primary transition-colors hover:border-secondary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
            onClick={() => void loadAppointments()}
            type="button"
          >
            {loading ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>
      </div>

      <div className="mt-space-lg grid grid-cols-1 gap-space-sm sm:grid-cols-3">
        <div className="border-l-2 border-amber-400 bg-surface-container-lowest p-space-md shadow-sm">
          <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">Pendientes</p>
          <p className="mt-1 font-headline-md text-headline-md text-primary">{pendingCount}</p>
        </div>
        <div className="border-l-2 border-emerald-400 bg-surface-container-lowest p-space-md shadow-sm">
          <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">Confirmadas</p>
          <p className="mt-1 font-headline-md text-headline-md text-primary">{confirmedCount}</p>
        </div>
        <div className="border-l-2 border-secondary bg-surface-container-lowest p-space-md shadow-sm">
          <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">Hoy</p>
          <p className="mt-1 font-headline-md text-headline-md text-primary">{todayCount}</p>
        </div>
      </div>

      <div className="mt-space-lg flex flex-col gap-space-md border-y border-surface-container py-space-md lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-space-sm" role="group" aria-label="Filtrar citas">
          {filters.map((item) => (
            <button
              key={item.id}
              aria-pressed={filter === item.id}
              className={`px-3 py-2 font-label-caps text-[10px] uppercase tracking-wider transition-colors ${
                filter === item.id
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:text-primary'
              }`}
              onClick={() => setFilter(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="flex w-full flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant lg:max-w-xs">
          Buscar
          <input
            className="border border-surface-container bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-primary outline-none transition-colors focus:border-secondary"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nombre, teléfono o código"
            type="search"
            value={search}
          />
        </label>
      </div>

      {actionMessage && (
        <p className="mt-space-md border-l-2 border-emerald-500 bg-emerald-50 px-3 py-2 font-body-sm text-body-sm text-emerald-900" role="status">
          {actionMessage}
        </p>
      )}

      {actionError && (
        <p className="mt-space-md border-l-2 border-error bg-error-container px-3 py-2 font-body-sm text-body-sm text-on-error-container" role="alert">
          {actionError}
        </p>
      )}

      <div className="mt-space-lg space-y-space-md">
        {loading && appointments.length === 0 && (
          <div className="space-y-space-md" aria-label="Cargando citas">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-36 animate-pulse border border-surface-container bg-surface-container-low" />
            ))}
          </div>
        )}

        {!loading && loadError && (
          <div className="border border-error/30 bg-error-container p-space-lg text-center">
            <p className="font-body-md text-body-md text-on-error-container">{loadError}</p>
            <button
              className="mt-space-md bg-primary px-4 py-2 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary"
              onClick={() => void loadAppointments()}
              type="button"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !loadError && visibleAppointments.length === 0 && (
          <div className="border border-surface-container bg-surface-container-lowest p-space-xl text-center">
            <p className="font-title-lg text-title-lg uppercase text-primary">No hay citas en esta vista</p>
            <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">
              {appointments.length === 0
                ? 'Todavía no se han registrado reservas.'
                : 'Prueba con otro filtro o limpia la búsqueda.'}
            </p>
          </div>
        )}

        {visibleAppointments.map((appointment) => (
          <AdminAppointmentCard
            key={appointment.id}
            appointment={appointment}
            onCancel={openCancel}
            onNotes={setNotesTarget}
            onReschedule={setRescheduleTarget}
            onStatus={(target, status) => void changeStatus(target, status)}
            updating={updatingId === appointment.id}
          />
        ))}
      </div>

      {showCreate && (
        <AdminCreateAppointmentDialog
          onClose={() => setShowCreate(false)}
          onSaved={(message) => {
            setShowCreate(false)
            setActionMessage(message)
            void loadAppointments()
          }}
        />
      )}

      {rescheduleTarget && (
        <AdminRescheduleDialog
          appointment={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onSaved={(message) => {
            setRescheduleTarget(null)
            setActionMessage(message)
            void loadAppointments()
          }}
        />
      )}

      {notesTarget && (
        <AdminNotesDialog
          appointment={notesTarget}
          onClose={() => setNotesTarget(null)}
          onSaved={(message) => {
            setNotesTarget(null)
            setActionMessage(message)
            void loadAppointments()
          }}
        />
      )}

      {cancelTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-primary/60 px-margin"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !cancelling) {
              setCancelTarget(null)
              setCancelError(null)
            }
          }}
          role="presentation"
        >
          <div
            aria-labelledby="cancel-title"
            aria-modal="true"
            className="w-full max-w-lg border border-surface-container bg-surface-container-lowest p-space-lg shadow-xl sm:p-space-xl"
            role="dialog"
          >
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-error">Confirmar cancelación</span>
            <h2 className="mt-space-sm font-headline-sm text-headline-sm uppercase text-primary" id="cancel-title">
              Cancelar cita
            </h2>
            <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">
              {cancelTarget.client?.full_name ?? 'Clienta'} · {cancelTarget.service?.name ?? 'Servicio'} ·{' '}
              {formatDateLong(dateInTimeZone(cancelTarget.starts_at, siteConfig.timeZone), siteConfig.timeZone)} a las{' '}
              {formatTime(cancelTarget.starts_at, siteConfig.timeZone)}
            </p>

            <label className="mt-space-md flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
              Motivo de la cancelación *
              <textarea
                autoFocus
                className="min-h-24 resize-y border border-surface-container bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-primary outline-none transition-colors focus:border-secondary"
                maxLength={500}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Ej. La clienta necesita reprogramar."
                value={cancelReason}
              />
            </label>

            {cancelError && (
              <p className="mt-space-md border-l-2 border-error bg-error-container px-3 py-2 font-body-sm text-body-sm text-on-error-container" role="alert">
                {cancelError}
              </p>
            )}

            <div className="mt-space-lg flex flex-col gap-space-sm sm:flex-row sm:justify-end">
              <button
                className="border border-surface-container px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:border-secondary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                disabled={cancelling}
                onClick={() => {
                  setCancelTarget(null)
                  setCancelError(null)
                }}
                type="button"
              >
                Volver
              </button>
              <button
                className="bg-error px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-error transition-colors hover:bg-error/90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={cancelling}
                onClick={() => void handleCancel()}
                type="button"
              >
                {cancelling ? 'Cancelando…' : 'Confirmar cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
