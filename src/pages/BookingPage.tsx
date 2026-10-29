import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { Link, useSearchParams } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import { siteConfig } from '../data/site'
import { addDays, formatDateLong, formatDateTimeLong, formatTime, todayInTimeZone } from '../lib/dates'
import {
  createPublicBooking,
  fetchAvailability,
  fetchPublicBookingSettings,
  fetchPublicProfessionals,
  fetchPublicServices,
} from '../lib/booking'
import type {
  AvailabilitySlot,
  PublicBookingResult,
  PublicBookingSettings,
  PublicProfessional,
  PublicService,
} from '../lib/booking'

function mapBookingError(error: unknown): string {
  const message = error instanceof Error ? error.message : ''

  switch (message) {
    case 'RATE_LIMITED':
      return 'Demasiados intentos en poco tiempo. Espera unos minutos e intenta de nuevo.'
    case 'SLOT_UNAVAILABLE':
      return 'Ese horario acaba de ocuparse. Elige otro horario disponible.'
    case 'CONSENT_REQUIRED':
      return 'Debes aceptar la política de privacidad para continuar.'
    case 'POLICY_VERSION_MISMATCH':
      return 'La política de privacidad se actualizó. Recarga la página e intenta de nuevo.'
    case 'INVALID_PHONE':
      return 'Revisa el número de teléfono e intenta de nuevo.'
    case 'INVALID_EMAIL':
      return 'Revisa el correo electrónico e intenta de nuevo.'
    case 'INVALID_NAME':
      return 'Revisa el nombre completo e intenta de nuevo.'
    case 'INVALID_NOTES':
      return 'Las notas son demasiado largas.'
    case 'IDEMPOTENCY_CONFLICT':
      return 'Ya existe una reserva con estos datos. Escríbenos por WhatsApp para revisarla.'
    case 'SERVICE_NOT_AVAILABLE':
    case 'PROFESSIONAL_NOT_AVAILABLE':
      return 'El servicio ya no está disponible. Recarga la página e intenta de nuevo.'
    default:
      return 'No pudimos completar la reserva. Intenta de nuevo o escríbenos por WhatsApp.'
  }
}

export default function BookingPage() {
  const [searchParams] = useSearchParams()
  const requestedSlug = searchParams.get('servicio')

  const [services, setServices] = useState<PublicService[]>([])
  const [professionals, setProfessionals] = useState<PublicProfessional[]>([])
  const [settings, setSettings] = useState<PublicBookingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [serviceId, setServiceId] = useState('')
  const [professionalId, setProfessionalId] = useState('')
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsRefreshKey, setSlotsRefreshKey] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [consent, setConsent] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<PublicBookingResult | null>(null)
  const idempotencyKeyRef = useRef<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)

    Promise.all([fetchPublicServices(), fetchPublicProfessionals(), fetchPublicBookingSettings()])
      .then(([serviceRows, professionalRows, bookingSettings]) => {
        if (!active) {
          return
        }

        setServices(serviceRows)
        setProfessionals(professionalRows)
        setSettings(bookingSettings)

        const requestedService = serviceRows.find((service) => service.slug === requestedSlug)
        setServiceId(requestedService?.id ?? serviceRows[0]?.id ?? '')
        setProfessionalId(professionalRows[0]?.id ?? '')
        setDate(todayInTimeZone(bookingSettings.timezone))
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(error instanceof Error ? error.message : 'No pudimos cargar la disponibilidad.')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [requestedSlug])

  useEffect(() => {
    if (!serviceId || !date) {
      setSlots([])
      setSelectedSlot(null)
      return
    }

    let active = true
    setSlotsLoading(true)
    setSelectedSlot(null)

    fetchAvailability(serviceId, professionalId || null, date, date)
      .then((availableSlots) => {
        if (active) {
          setSlots(availableSlots)
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setSlots([])
          setSubmitError(error instanceof Error ? error.message : 'No pudimos cargar los horarios.')
        }
      })
      .finally(() => {
        if (active) {
          setSlotsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [serviceId, professionalId, date, slotsRefreshKey])

  useEffect(() => {
    idempotencyKeyRef.current = null
  }, [serviceId, professionalId, selectedSlot?.slot_start, fullName, phone, email, notes])

  useEffect(() => {
    if (result) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [result])

  const selectedService = services.find((service) => service.id === serviceId)
  const selectedProfessional = professionals.find((professional) => professional.id === professionalId)
  const minDate = settings ? todayInTimeZone(settings.timezone) : ''
  const maxDate = settings ? addDays(minDate, settings.max_advance_days) : ''
  const timezoneLabel = settings?.timezone === 'America/Bogota' ? 'Bogotá' : (settings?.timezone ?? '')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!settings || !selectedSlot || !serviceId || !consent) {
      setSubmitError('Completa el servicio, el horario y el consentimiento para continuar.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    const idempotencyKey = idempotencyKeyRef.current ?? crypto.randomUUID()
    idempotencyKeyRef.current = idempotencyKey

    try {
      const booking = await createPublicBooking({
        serviceId,
        startsAt: selectedSlot.slot_start,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        notes: notes.trim() || null,
        consent,
        policyVersion: settings.privacy_policy_version,
        professionalId: professionalId || null,
        idempotencyKey,
      })

      setResult(booking)
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      setSubmitError(mapBookingError(error))

      if (message === 'SLOT_UNAVAILABLE') {
        setSelectedSlot(null)
        setSlotsRefreshKey((value) => value + 1)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageShell>
        <div className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center px-margin py-space-3xl text-center">
          <p className="font-body-lg text-body-lg text-on-surface-variant">Cargando disponibilidad…</p>
        </div>
      </PageShell>
    )
  }

  if (loadError || !settings) {
    return (
      <PageShell>
        <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-margin py-space-3xl text-center">
          <h1 className="font-headline-lg text-headline-lg-mobile uppercase text-primary">No pudimos cargar las reservas</h1>
          <p className="mt-space-md font-body-md text-body-md text-on-surface-variant">
            Intenta de nuevo en unos minutos o escríbenos por WhatsApp para agendar tu cita.
          </p>
          <a
            className="mt-space-lg flex items-center gap-2 bg-primary px-5 py-3 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary"
            href={siteConfig.whatsapp}
            rel="noopener noreferrer"
            target="_blank"
          >
            <FaWhatsapp aria-hidden="true" />
            Escribir por WhatsApp
          </a>
        </div>
      </PageShell>
    )
  }

  if (result) {
    const whatsappMessage = `Hola, acabo de reservar una cita. Código: ${result.confirmation_code}. Servicio: ${result.service_name}.`
    const whatsappLink = `${siteConfig.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`

    return (
      <PageShell>
        <section className="mx-auto w-full max-w-2xl px-margin py-space-3xl md:px-margin-tablet">
          <div className="border border-surface-container bg-surface-container-lowest p-space-lg shadow-sm sm:p-space-xl">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">Reserva recibida</span>
            <h1 className="mt-space-sm font-headline-lg text-headline-lg-mobile uppercase leading-tight text-primary">
              Tu cita quedó pendiente de confirmación
            </h1>
            <p className="mt-space-md font-body-md text-body-md leading-relaxed text-on-surface-variant">
              Guarda tu código de confirmación. Te contactaremos por WhatsApp para confirmar la cita.
            </p>

            <div className="mt-space-lg bg-surface-container px-space-lg py-space-md">
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">Código</p>
              <p className="mt-1 font-headline-sm text-headline-sm tracking-widest text-primary">{result.confirmation_code}</p>
            </div>

            <dl className="mt-space-lg space-y-space-sm font-body-md text-body-md">
              <div className="flex flex-col gap-1 border-b border-surface-container pb-space-sm sm:flex-row sm:justify-between">
                <dt className="text-on-surface-variant">Servicio</dt>
                <dd className="font-semibold text-primary">{result.service_name}</dd>
              </div>
              <div className="flex flex-col gap-1 border-b border-surface-container pb-space-sm sm:flex-row sm:justify-between">
                <dt className="text-on-surface-variant">Especialista</dt>
                <dd className="font-semibold text-primary">{result.professional_name}</dd>
              </div>
              <div className="flex flex-col gap-1 border-b border-surface-container pb-space-sm sm:flex-row sm:justify-between">
                <dt className="text-on-surface-variant">Fecha y hora</dt>
                <dd className="font-semibold text-primary">
                  {formatDateTimeLong(result.starts_at, settings.timezone)} – {formatTime(result.service_ends_at, settings.timezone)}
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                <dt className="text-on-surface-variant">Estado</dt>
                <dd className="font-semibold uppercase text-secondary">Pendiente de confirmación</dd>
              </div>
            </dl>

            <div className="mt-space-lg flex flex-col gap-space-sm sm:flex-row">
              <a
                className="flex items-center justify-center gap-2 bg-primary px-5 py-3 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary"
                href={whatsappLink}
                rel="noopener noreferrer"
                target="_blank"
              >
                <FaWhatsapp aria-hidden="true" />
                Enviar por WhatsApp
              </a>
              <button
                className="border border-primary px-5 py-3 font-label-caps text-label-caps uppercase text-primary transition-colors hover:bg-surface-container"
                onClick={() => window.location.assign(siteConfig.bookingPath)}
                type="button"
              >
                Reservar otra cita
              </button>
            </div>

            <p className="mt-space-md font-body-sm text-body-sm text-on-surface-variant">
              Si necesitas cambiar o cancelar la cita, escríbenos por WhatsApp con tu código de confirmación.
            </p>
          </div>
        </section>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <section className="mx-auto w-full max-w-5xl px-margin py-space-3xl md:px-margin-tablet lg:px-margin-desktop">
        <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">Reservas en línea</span>
        <h1 className="mt-space-sm max-w-3xl font-headline-lg text-headline-lg-mobile uppercase leading-tight tracking-tight text-primary md:text-headline-lg">
          Reserva tu cita
        </h1>
        <p className="mt-space-md max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
          Elige el servicio, la fecha y la hora. Tu cita queda pendiente y la confirmamos por WhatsApp.
        </p>

        <form className="mt-space-2xl grid grid-cols-1 gap-space-2xl lg:grid-cols-12" onSubmit={handleSubmit}>
          <div className="space-y-space-2xl lg:col-span-8">
            <section>
              <h2 className="font-title-lg text-title-lg uppercase text-primary">1. Servicio</h2>
              <div className="mt-space-md grid grid-cols-1 gap-space-sm sm:grid-cols-2">
                {services.map((service) => {
                  const isSelected = service.id === serviceId

                  return (
                    <button
                      key={service.id}
                      aria-pressed={isSelected}
                      className={`border p-space-md text-left transition-colors ${
                        isSelected
                          ? 'border-secondary bg-surface-container'
                          : 'border-surface-container bg-surface-container-lowest hover:border-secondary/50'
                      }`}
                      onClick={() => {
                        setServiceId(service.id)
                        setSubmitError(null)
                      }}
                      type="button"
                    >
                      <span className="font-label-caps text-[10px] uppercase tracking-wider text-secondary">
                        {service.category ?? 'Servicio'}
                      </span>
                      <span className="mt-1 block font-title-lg text-title-lg uppercase text-primary">{service.name}</span>
                      <span className="mt-1 block font-body-sm text-body-sm text-on-surface-variant">
                        {service.duration_minutes} min ·{' '}
                        {service.price_cop !== null
                          ? `Cop ${service.price_cop.toLocaleString('es-CO')}`
                          : 'Precio por confirmar'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>

            <section>
              <h2 className="font-title-lg text-title-lg uppercase text-primary">2. Fecha y hora</h2>
              <div className="mt-space-md grid grid-cols-1 gap-space-md sm:grid-cols-2">
                {professionals.length > 1 && (
                  <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
                    Especialista
                    <select
                      className="border border-surface-container bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-primary outline-none focus:border-secondary"
                      onChange={(event) => {
                        setProfessionalId(event.target.value)
                        setSubmitError(null)
                      }}
                      value={professionalId}
                    >
                      {professionals.map((professional) => (
                        <option key={professional.id} value={professional.id}>
                          {professional.full_name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
                  Fecha
                  <input
                    className="border border-surface-container bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-primary outline-none focus:border-secondary"
                    max={maxDate}
                    min={minDate}
                    onChange={(event) => {
                      setDate(event.target.value)
                      setSubmitError(null)
                    }}
                    type="date"
                    value={date}
                  />
                </label>
              </div>

              {professionals.length === 1 && (
                <p className="mt-space-sm font-body-sm text-body-sm text-on-surface-variant">
                  Especialista: <span className="font-semibold text-primary">{professionals[0].full_name}</span>
                </p>
              )}

              <p className="mt-space-sm font-body-sm text-body-sm text-on-surface-variant">
                Horarios en hora local de {timezoneLabel}.
              </p>

              <div className="mt-space-md">
                {!date && <p className="font-body-md text-body-md text-on-surface-variant">Selecciona una fecha.</p>}
                {date && slotsLoading && <p className="font-body-md text-body-md text-on-surface-variant">Cargando horarios…</p>}
                {date && !slotsLoading && slots.length === 0 && (
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    No hay horarios disponibles para esta fecha. Prueba con otro día.
                  </p>
                )}
                {date && !slotsLoading && slots.length > 0 && (
                  <div className="grid grid-cols-3 gap-space-sm sm:grid-cols-4 md:grid-cols-5">
                    {slots.map((slot) => {
                      const isSelected = selectedSlot?.slot_start === slot.slot_start

                      return (
                        <button
                          key={slot.slot_start}
                          aria-pressed={isSelected}
                          className={`border px-2 py-2 font-body-sm text-body-sm transition-colors ${
                            isSelected
                              ? 'border-secondary bg-secondary text-on-secondary'
                              : 'border-surface-container bg-surface-container-lowest text-primary hover:border-secondary'
                          }`}
                          onClick={() => {
                            setSelectedSlot(slot)
                            setSubmitError(null)
                          }}
                          type="button"
                        >
                          {formatTime(slot.slot_start, settings.timezone)}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>

            <section>
              <h2 className="font-title-lg text-title-lg uppercase text-primary">3. Tus datos</h2>
              <div className="mt-space-md grid grid-cols-1 gap-space-md sm:grid-cols-2">
                <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
                  Nombre completo *
                  <input
                    autoComplete="name"
                    className="border border-surface-container bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-primary outline-none focus:border-secondary"
                    maxLength={120}
                    minLength={2}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                    type="text"
                    value={fullName}
                  />
                </label>
                <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
                  Teléfono / WhatsApp *
                  <input
                    autoComplete="tel"
                    className="border border-surface-container bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-primary outline-none focus:border-secondary"
                    inputMode="tel"
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="300 123 4567"
                    required
                    type="tel"
                    value={phone}
                  />
                </label>
                <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant sm:col-span-2">
                  Correo electrónico (opcional)
                  <input
                    autoComplete="email"
                    className="border border-surface-container bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-primary outline-none focus:border-secondary"
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    value={email}
                  />
                </label>
                <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant sm:col-span-2">
                  Notas (opcional)
                  <textarea
                    className="min-h-24 resize-y border border-surface-container bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-primary outline-none focus:border-secondary"
                    maxLength={2000}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Alergias, preferencias o información que debamos tener en cuenta."
                    value={notes}
                  />
                </label>
              </div>

              <label className="mt-space-md flex items-start gap-2 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                <input
                  checked={consent}
                  className="mt-0.5 h-4 w-4 accent-secondary"
                  onChange={(event) => setConsent(event.target.checked)}
                  required
                  type="checkbox"
                />
                <span>
                  He leído y acepto la{' '}
                  <Link
                    className="underline decoration-secondary/50 underline-offset-2 hover:text-primary"
                    rel="noopener noreferrer"
                    target="_blank"
                    to={siteConfig.privacyPath}
                  >
                    política de privacidad
                  </Link>{' '}
                  y autorizo el tratamiento de mis datos para gestionar esta cita.
                </span>
              </label>
            </section>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-4 border border-surface-container bg-surface-container-lowest p-space-lg shadow-sm">
              <h2 className="font-title-lg text-title-lg uppercase text-primary">Resumen</h2>
              <dl className="mt-space-md space-y-space-sm font-body-sm text-body-sm">
                <div className="flex justify-between gap-space-md border-b border-surface-container pb-space-sm">
                  <dt className="text-on-surface-variant">Servicio</dt>
                  <dd className="text-right font-semibold text-primary">{selectedService?.name ?? 'Sin seleccionar'}</dd>
                </div>
                <div className="flex justify-between gap-space-md border-b border-surface-container pb-space-sm">
                  <dt className="text-on-surface-variant">Especialista</dt>
                  <dd className="text-right font-semibold text-primary">
                    {selectedProfessional?.full_name ?? professionals[0]?.full_name ?? 'Por confirmar'}
                  </dd>
                </div>
                <div className="flex justify-between gap-space-md border-b border-surface-container pb-space-sm">
                  <dt className="text-on-surface-variant">Fecha</dt>
                  <dd className="text-right font-semibold text-primary">
                    {date ? formatDateLong(date, settings.timezone) : 'Sin seleccionar'}
                  </dd>
                </div>
                <div className="flex justify-between gap-space-md">
                  <dt className="text-on-surface-variant">Hora</dt>
                  <dd className="text-right font-semibold text-primary">
                    {selectedSlot ? formatTime(selectedSlot.slot_start, settings.timezone) : 'Sin seleccionar'}
                  </dd>
                </div>
              </dl>

              {submitError && (
                <p className="mt-space-md border-l-2 border-error bg-error-container px-3 py-2 font-body-sm text-body-sm text-on-error-container" role="alert">
                  {submitError}
                </p>
              )}

              <button
                className="mt-space-lg w-full bg-primary px-5 py-3 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!selectedSlot || !consent || submitting}
                type="submit"
              >
                {submitting ? 'Enviando…' : 'Solicitar cita'}
              </button>
              <p className="mt-space-sm font-body-sm text-body-sm text-on-surface-variant">
                Tu cita queda pendiente hasta que la confirmemos por WhatsApp.
              </p>
            </div>
          </aside>
        </form>
      </section>
    </PageShell>
  )
}
