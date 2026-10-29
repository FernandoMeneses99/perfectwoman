import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { mapAdminError } from '../../lib/admin'
import {
  createAdminScheduleBlock,
  deleteAdminBusinessHour,
  deleteAdminScheduleBlock,
  fetchAdminBusinessHours,
  fetchAdminProfessionals,
  fetchAdminScheduleBlocks,
  saveAdminBusinessHour,
} from '../../lib/adminCatalog'
import type {
  AdminBusinessHour,
  AdminProfessional,
  AdminScheduleBlock,
} from '../../lib/adminCatalog'
import {
  addDays,
  dateInTimeZone,
  formatDateLong,
  formatTime,
  formatWeekday,
  localDateTimeToIso,
  todayInTimeZone,
} from '../../lib/dates'
import { siteConfig } from '../../data/site'
import AdminModal from './AdminModal'

type ScheduleMode = 'hours' | 'blocks'

type HoursFormProps = {
  hour: AdminBusinessHour | null
  professionals: AdminProfessional[]
  onClose: () => void
  onSaved: () => void
}

function HoursForm({ hour, professionals, onClose, onSaved }: HoursFormProps) {
  const [professionalId, setProfessionalId] = useState(
    hour?.professional_id ?? professionals[0]?.id ?? '',
  )
  const [weekday, setWeekday] = useState(String(hour?.weekday ?? 1))
  const [opensAt, setOpensAt] = useState(hour?.opens_at.slice(0, 5) ?? '09:00')
  const [closesAt, setClosesAt] = useState(hour?.closes_at.slice(0, 5) ?? '19:00')
  const [active, setActive] = useState(hour?.active ?? true)
  const [validFrom, setValidFrom] = useState(hour?.valid_from ?? '')
  const [validTo, setValidTo] = useState(hour?.valid_to ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await saveAdminBusinessHour({
        id: hour?.id,
        professional_id: professionalId,
        weekday: Number(weekday),
        opens_at: opensAt,
        closes_at: closesAt,
        active,
        valid_from: validFrom || null,
        valid_to: validTo || null,
      })
      onSaved()
    } catch (submitError) {
      setError(mapAdminError(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminModal
      busy={submitting}
      eyebrow="Horarios"
      onClose={onClose}
      title={hour ? 'Editar horario' : 'Nuevo horario'}
    >
      <form className="space-y-space-md" onSubmit={handleSubmit}>
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

        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-3">
          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Día *
            <select
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              onChange={(event) => setWeekday(event.target.value)}
              value={weekday}
            >
              {[1, 2, 3, 4, 5, 6, 0].map((value) => (
                <option key={value} value={value}>
                  {formatWeekday(value)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Abre *
            <input
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              onChange={(event) => setOpensAt(event.target.value)}
              required
              type="time"
              value={opensAt}
            />
          </label>

          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Cierra *
            <input
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              onChange={(event) => setClosesAt(event.target.value)}
              required
              type="time"
              value={closesAt}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Válido desde
            <input
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              onChange={(event) => setValidFrom(event.target.value)}
              type="date"
              value={validFrom}
            />
          </label>

          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Válido hasta
            <input
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              onChange={(event) => setValidTo(event.target.value)}
              type="date"
              value={validTo}
            />
          </label>
        </div>

        <label className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
          <input
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            type="checkbox"
          />
          Horario activo
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
            {submitting ? 'Guardando…' : 'Guardar horario'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}

type BlockFormProps = {
  professionals: AdminProfessional[]
  onClose: () => void
  onSaved: () => void
}

function BlockForm({ professionals, onClose, onSaved }: BlockFormProps) {
  const [professionalId, setProfessionalId] = useState('')
  const [startsAt, setStartsAt] = useState(
    `${addDays(todayInTimeZone(siteConfig.timeZone), 1)}T09:00`,
  )
  const [endsAt, setEndsAt] = useState(
    `${addDays(todayInTimeZone(siteConfig.timeZone), 1)}T10:00`,
  )
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await createAdminScheduleBlock({
        professionalId: professionalId || null,
        startsAt: localDateTimeToIso(startsAt, siteConfig.timeZone),
        endsAt: localDateTimeToIso(endsAt, siteConfig.timeZone),
        reason: reason.trim() || null,
      })
      onSaved()
    } catch (submitError) {
      setError(mapAdminError(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminModal
      busy={submitting}
      eyebrow="Bloqueos"
      onClose={onClose}
      title="Nuevo bloqueo"
    >
      <form className="space-y-space-md" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
          Aplica a
          <select
            className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
            onChange={(event) => setProfessionalId(event.target.value)}
            value={professionalId}
          >
            <option value="">Todo el estudio</option>
            {professionals.map((professional) => (
              <option key={professional.id} value={professional.id}>
                {professional.full_name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Desde *
            <input
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              onChange={(event) => setStartsAt(event.target.value)}
              required
              type="datetime-local"
              value={startsAt}
            />
          </label>

          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Hasta *
            <input
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              onChange={(event) => setEndsAt(event.target.value)}
              required
              type="datetime-local"
              value={endsAt}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
          Motivo
          <input
            className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
            maxLength={500}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Ej. Vacaciones, cita médica…"
            value={reason}
          />
        </label>

        <p className="font-body-sm text-body-sm text-on-surface-variant">
          No se puede bloquear un rango que se cruce con una cita pendiente o confirmada.
        </p>

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
            {submitting ? 'Guardando…' : 'Crear bloqueo'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}

export default function AdminScheduleManager() {
  const [mode, setMode] = useState<ScheduleMode>('hours')
  const [professionals, setProfessionals] = useState<AdminProfessional[]>([])
  const [hours, setHours] = useState<AdminBusinessHour[]>([])
  const [blocks, setBlocks] = useState<AdminScheduleBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoursFormOpen, setHoursFormOpen] = useState(false)
  const [editingHour, setEditingHour] = useState<AdminBusinessHour | null>(null)
  const [blockFormOpen, setBlockFormOpen] = useState(false)

  async function loadSchedule() {
    setLoading(true)
    setError(null)

    try {
      const [nextProfessionals, nextHours, nextBlocks] = await Promise.all([
        fetchAdminProfessionals(),
        fetchAdminBusinessHours(),
        fetchAdminScheduleBlocks(),
      ])

      setProfessionals(nextProfessionals)
      setHours(nextHours)
      setBlocks(nextBlocks)
    } catch (loadError) {
      setError(mapAdminError(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSchedule()
  }, [])

  async function handleDeleteHour(id: string) {
    setError(null)

    try {
      await deleteAdminBusinessHour(id)
      await loadSchedule()
    } catch (deleteError) {
      setError(mapAdminError(deleteError))
    }
  }

  async function handleDeleteBlock(id: string) {
    setError(null)

    try {
      await deleteAdminScheduleBlock(id)
      await loadSchedule()
    } catch (deleteError) {
      setError(mapAdminError(deleteError))
    }
  }

  function professionalName(id: string | null): string {
    if (!id) {
      return 'Todo el estudio'
    }

    return professionals.find((professional) => professional.id === id)?.full_name ?? 'Especialista'
  }

  return (
    <div className="space-y-space-lg py-space-lg md:py-space-xl">
      <div className="flex flex-col gap-space-md sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
            Operación
          </span>
          <h1 className="mt-space-sm font-headline-lg text-headline-lg-mobile uppercase leading-tight text-primary md:text-headline-lg">
            Horarios y bloqueos
          </h1>
          <p className="mt-space-sm max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Define la disponibilidad semanal y bloquea vacaciones o imprevistos.
          </p>
        </div>

        <button
          className="w-fit bg-primary px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary"
          onClick={() => {
            if (mode === 'hours') {
              setEditingHour(null)
              setHoursFormOpen(true)
            } else {
              setBlockFormOpen(true)
            }
          }}
          type="button"
        >
          {mode === 'hours' ? 'Nuevo horario' : 'Nuevo bloqueo'}
        </button>
      </div>

      <div className="flex gap-space-sm" role="group" aria-label="Tipo de configuración">
        <button
          aria-pressed={mode === 'hours'}
          className={`px-3 py-2 font-label-caps text-[10px] uppercase tracking-wider transition-colors ${
            mode === 'hours'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container text-on-surface-variant hover:text-primary'
          }`}
          onClick={() => setMode('hours')}
          type="button"
        >
          Horarios semanales
        </button>
        <button
          aria-pressed={mode === 'blocks'}
          className={`px-3 py-2 font-label-caps text-[10px] uppercase tracking-wider transition-colors ${
            mode === 'blocks'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container text-on-surface-variant hover:text-primary'
          }`}
          onClick={() => setMode('blocks')}
          type="button"
        >
          Bloqueos
        </button>
      </div>

      {error && (
        <p
          className="border-l-2 border-error bg-error-container px-3 py-2 font-body-sm text-body-sm text-on-error-container"
          role="alert"
        >
          {error}
        </p>
      )}

      {loading ? (
        <p className="font-body-md text-body-md text-on-surface-variant">Cargando horarios…</p>
      ) : mode === 'hours' ? (
        <div className="space-y-space-md">
          {professionals.map((professional) => {
            const professionalHours = hours.filter(
              (hour) => hour.professional_id === professional.id,
            )

            return (
              <section
                className="border border-surface-container bg-surface-container-lowest p-space-md shadow-sm"
                key={professional.id}
              >
                <div className="flex items-center justify-between gap-space-md">
                  <h2 className="font-title-lg text-title-lg uppercase text-primary">
                    {professional.full_name}
                  </h2>
                  <span className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
                    {professionalHours.length} rangos
                  </span>
                </div>

                {professionalHours.length === 0 ? (
                  <p className="mt-space-sm font-body-sm text-body-sm text-on-surface-variant">
                    Sin horarios configurados. No aparecerá disponibilidad.
                  </p>
                ) : (
                  <div className="mt-space-sm space-y-2">
                    {professionalHours.map((hour) => (
                      <div
                        className="flex flex-col gap-2 border-t border-surface-container pt-2 sm:flex-row sm:items-center sm:justify-between"
                        key={hour.id}
                      >
                        <p className="font-body-sm text-body-sm text-primary">
                          {formatWeekday(hour.weekday)} · {hour.opens_at.slice(0, 5)}–
                          {hour.closes_at.slice(0, 5)}
                          {hour.valid_from || hour.valid_to
                            ? ` · ${hour.valid_from ?? 'siempre'} a ${hour.valid_to ?? 'siempre'}`
                            : ''}
                          {!hour.active ? ' · inactivo' : ''}
                        </p>
                        <div className="flex gap-space-sm">
                          <button
                            className="font-label-caps text-[10px] uppercase tracking-wider text-secondary underline decoration-secondary/40 underline-offset-4 hover:text-primary"
                            onClick={() => {
                              setEditingHour(hour)
                              setHoursFormOpen(true)
                            }}
                            type="button"
                          >
                            Editar
                          </button>
                          <button
                            className="font-label-caps text-[10px] uppercase tracking-wider text-error underline decoration-error/40 underline-offset-4 hover:text-primary"
                            onClick={() => void handleDeleteHour(hour.id)}
                            type="button"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      ) : (
        <div className="space-y-space-md">
          {blocks.length === 0 ? (
            <div className="border border-surface-container bg-surface-container-lowest p-space-xl text-center">
              <p className="font-title-lg text-title-lg uppercase text-primary">
                No hay bloqueos próximos
              </p>
              <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">
                Crea uno para vacaciones, diligencias o mantenimiento.
              </p>
            </div>
          ) : (
            blocks.map((block) => (
              <article
                className="border border-surface-container bg-surface-container-lowest p-space-md shadow-sm"
                key={block.id}
              >
                <div className="flex flex-col gap-space-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-title-lg text-title-lg uppercase text-primary">
                      {professionalName(block.professional_id)}
                    </p>
                    <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                      {formatDateLong(
                        dateInTimeZone(block.starts_at, siteConfig.timeZone),
                        siteConfig.timeZone,
                      )}{' '}
                      · {formatTime(block.starts_at, siteConfig.timeZone)}–
                      {formatTime(block.ends_at, siteConfig.timeZone)}
                    </p>
                    {block.reason && (
                      <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                        {block.reason}
                      </p>
                    )}
                  </div>
                  <button
                    className="w-fit border border-error/40 px-4 py-2 font-label-caps text-[10px] uppercase tracking-wider text-error transition-colors hover:border-error hover:bg-error-container"
                    onClick={() => void handleDeleteBlock(block.id)}
                    type="button"
                  >
                    Eliminar bloqueo
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {hoursFormOpen && (
        <HoursForm
          hour={editingHour}
          onClose={() => setHoursFormOpen(false)}
          onSaved={() => {
            setHoursFormOpen(false)
            void loadSchedule()
          }}
          professionals={professionals}
        />
      )}

      {blockFormOpen && (
        <BlockForm
          onClose={() => setBlockFormOpen(false)}
          onSaved={() => {
            setBlockFormOpen(false)
            void loadSchedule()
          }}
          professionals={professionals}
        />
      )}
    </div>
  )
}
