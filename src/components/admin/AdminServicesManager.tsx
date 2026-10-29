import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { mapAdminError } from '../../lib/admin'
import {
  fetchAdminServices,
  formatCOP,
  saveAdminService,
  slugify,
} from '../../lib/adminCatalog'
import type { AdminService, AdminServiceInput } from '../../lib/adminCatalog'
import AdminModal from './AdminModal'

type ServiceFormProps = {
  service: AdminService | null
  nextSortOrder: number
  onClose: () => void
  onSaved: () => void
}

function ServiceForm({ service, nextSortOrder, onClose, onSaved }: ServiceFormProps) {
  const [name, setName] = useState(service?.name ?? '')
  const [slug, setSlug] = useState(service?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(service))
  const [category, setCategory] = useState(service?.category ?? '')
  const [description, setDescription] = useState(service?.description ?? '')
  const [duration, setDuration] = useState(String(service?.duration_minutes ?? 40))
  const [bufferBefore, setBufferBefore] = useState(
    String(service?.buffer_before_minutes ?? 0),
  )
  const [bufferAfter, setBufferAfter] = useState(
    String(service?.buffer_after_minutes ?? 15),
  )
  const [price, setPrice] = useState(
    service?.price_cop === null || service?.price_cop === undefined
      ? ''
      : String(service.price_cop),
  )
  const [priceVerified, setPriceVerified] = useState(service?.price_verified ?? false)
  const [durationVerified, setDurationVerified] = useState(
    service?.duration_verified ?? false,
  )
  const [active, setActive] = useState(service?.active ?? true)
  const [sortOrder, setSortOrder] = useState(String(service?.sort_order ?? nextSortOrder))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleNameChange(value: string) {
    setName(value)

    if (!slugTouched) {
      setSlug(slugify(value))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const input: AdminServiceInput = {
      id: service?.id,
      slug: slug.trim(),
      name: name.trim(),
      category: category.trim() || null,
      description: description.trim() || null,
      duration_minutes: Number(duration),
      buffer_before_minutes: Number(bufferBefore),
      buffer_after_minutes: Number(bufferAfter),
      price_cop: price.trim() ? Number(price) : null,
      price_verified: priceVerified,
      duration_verified: durationVerified,
      active,
      sort_order: Number(sortOrder),
    }

    try {
      await saveAdminService(input)
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
      eyebrow="Catálogo"
      onClose={onClose}
      title={service ? 'Editar servicio' : 'Nuevo servicio'}
    >
      <form className="space-y-space-md" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Nombre *
            <input
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              maxLength={120}
              onChange={(event) => handleNameChange(event.target.value)}
              required
              value={name}
            />
          </label>

          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Slug *
            <input
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              onChange={(event) => {
                setSlug(event.target.value)
                setSlugTouched(true)
              }}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              required
              value={slug}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Categoría
            <input
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              maxLength={80}
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            />
          </label>

          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Orden
            <input
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              min={0}
              onChange={(event) => setSortOrder(event.target.value)}
              required
              type="number"
              value={sortOrder}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
          Descripción
          <textarea
            className="min-h-20 resize-y border border-surface-container bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-primary outline-none focus:border-secondary"
            maxLength={2000}
            onChange={(event) => setDescription(event.target.value)}
            value={description}
          />
        </label>

        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-3">
          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Duración (min) *
            <input
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              max={60}
              min={40}
              onChange={(event) => setDuration(event.target.value)}
              required
              type="number"
              value={duration}
            />
          </label>

          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Buffer antes (min)
            <input
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              max={60}
              min={0}
              onChange={(event) => setBufferBefore(event.target.value)}
              required
              type="number"
              value={bufferBefore}
            />
          </label>

          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Buffer después (min)
            <input
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              max={60}
              min={0}
              onChange={(event) => setBufferAfter(event.target.value)}
              required
              type="number"
              value={bufferAfter}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Precio COP
            <input
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              min={0}
              onChange={(event) => setPrice(event.target.value)}
              type="number"
              value={price}
            />
          </label>

          <div className="flex flex-col justify-end gap-2 font-body-sm text-body-sm text-on-surface-variant">
            <label className="flex items-center gap-2">
              <input
                checked={priceVerified}
                onChange={(event) => setPriceVerified(event.target.checked)}
                type="checkbox"
              />
              Precio verificado
            </label>
            <label className="flex items-center gap-2">
              <input
                checked={durationVerified}
                onChange={(event) => setDurationVerified(event.target.checked)}
                type="checkbox"
              />
              Duración verificada
            </label>
          </div>
        </div>

        <label className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
          <input
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            type="checkbox"
          />
          Servicio activo para reservas
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
            {submitting ? 'Guardando…' : 'Guardar servicio'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}

export default function AdminServicesManager() {
  const [services, setServices] = useState<AdminService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminService | null>(null)

  async function loadServices() {
    setLoading(true)
    setError(null)

    try {
      setServices(await fetchAdminServices())
    } catch (loadError) {
      setError(mapAdminError(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadServices()
  }, [])

  const nextSortOrder =
    services.reduce((max, service) => Math.max(max, service.sort_order), 0) + 1

  return (
    <div className="space-y-space-lg py-space-lg md:py-space-xl">
      <div className="flex flex-col gap-space-md sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
            Catálogo
          </span>
          <h1 className="mt-space-sm font-headline-lg text-headline-lg-mobile uppercase leading-tight text-primary md:text-headline-lg">
            Servicios
          </h1>
          <p className="mt-space-sm max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Ajusta duración, buffers, precios y visibilidad de cada servicio.
          </p>
        </div>

        <button
          className="w-fit bg-primary px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary"
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
          type="button"
        >
          Nuevo servicio
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
        <p className="font-body-md text-body-md text-on-surface-variant">
          Cargando servicios…
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-space-md lg:grid-cols-2">
          {services.map((service) => (
            <article
              className="border border-surface-container bg-surface-container-lowest p-space-md shadow-sm"
              key={service.id}
            >
              <div className="flex items-start justify-between gap-space-md">
                <div>
                  <p className="font-title-lg text-title-lg uppercase text-primary">
                    {service.name}
                  </p>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                    {service.category ?? 'Sin categoría'} · {service.duration_minutes} min
                  </p>
                </div>
                <span
                  className={`shrink-0 px-2.5 py-1 font-label-caps text-[10px] uppercase tracking-wider ${
                    service.active
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-zinc-200 text-zinc-700'
                  }`}
                >
                  {service.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">
                {formatCOP(service.price_cop)}
              </p>
              <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                Buffer: {service.buffer_before_minutes} min antes ·{' '}
                {service.buffer_after_minutes} min después
              </p>

              <button
                className="mt-space-md border border-surface-container px-4 py-2 font-label-caps text-[10px] uppercase tracking-wider text-primary transition-colors hover:border-secondary"
                onClick={() => {
                  setEditing(service)
                  setFormOpen(true)
                }}
                type="button"
              >
                Editar
              </button>
            </article>
          ))}
        </div>
      )}

      {formOpen && (
        <ServiceForm
          nextSortOrder={nextSortOrder}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false)
            void loadServices()
          }}
          service={editing}
        />
      )}
    </div>
  )
}
