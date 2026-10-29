import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { mapAdminError } from '../../lib/admin'
import {
  fetchAdminProfessionals,
  saveAdminProfessional,
  slugify,
} from '../../lib/adminCatalog'
import type {
  AdminProfessional,
  AdminProfessionalInput,
} from '../../lib/adminCatalog'
import AdminModal from './AdminModal'

type ProfessionalFormProps = {
  professional: AdminProfessional | null
  nextSortOrder: number
  onClose: () => void
  onSaved: () => void
}

function ProfessionalForm({
  professional,
  nextSortOrder,
  onClose,
  onSaved,
}: ProfessionalFormProps) {
  const [fullName, setFullName] = useState(professional?.full_name ?? '')
  const [slug, setSlug] = useState(professional?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(professional))
  const [email, setEmail] = useState(professional?.email ?? '')
  const [phone, setPhone] = useState(professional?.phone ?? '')
  const [active, setActive] = useState(professional?.active ?? true)
  const [sortOrder, setSortOrder] = useState(
    String(professional?.sort_order ?? nextSortOrder),
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleNameChange(value: string) {
    setFullName(value)

    if (!slugTouched) {
      setSlug(slugify(value))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const input: AdminProfessionalInput = {
      id: professional?.id,
      full_name: fullName.trim(),
      slug: slug.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      active,
      sort_order: Number(sortOrder),
    }

    try {
      await saveAdminProfessional(input)
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
      eyebrow="Equipo"
      onClose={onClose}
      title={professional ? 'Editar especialista' : 'Nueva especialista'}
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
              value={fullName}
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
            Correo
            <input
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>

          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Teléfono
            <input
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
              inputMode="tel"
              maxLength={30}
              onChange={(event) => setPhone(event.target.value)}
              value={phone}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
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

          <label className="flex items-end gap-2 pb-3 font-body-sm text-body-sm text-on-surface-variant">
            <input
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              type="checkbox"
            />
            Disponible en la agenda
          </label>
        </div>

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
            {submitting ? 'Guardando…' : 'Guardar especialista'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}

export default function AdminProfessionalsManager() {
  const [professionals, setProfessionals] = useState<AdminProfessional[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminProfessional | null>(null)

  async function loadProfessionals() {
    setLoading(true)
    setError(null)

    try {
      setProfessionals(await fetchAdminProfessionals())
    } catch (loadError) {
      setError(mapAdminError(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProfessionals()
  }, [])

  const nextSortOrder =
    professionals.reduce(
      (max, professional) => Math.max(max, professional.sort_order),
      0,
    ) + 1

  return (
    <div className="space-y-space-lg py-space-lg md:py-space-xl">
      <div className="flex flex-col gap-space-md sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
            Equipo
          </span>
          <h1 className="mt-space-sm font-headline-lg text-headline-lg-mobile uppercase leading-tight text-primary md:text-headline-lg">
            Especialistas
          </h1>
          <p className="mt-space-sm max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Administra quién atiende y en qué orden aparece en la reserva.
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
          Nueva especialista
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
          Cargando equipo…
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-space-md lg:grid-cols-2">
          {professionals.map((professional) => (
            <article
              className="border border-surface-container bg-surface-container-lowest p-space-md shadow-sm"
              key={professional.id}
            >
              <div className="flex items-start justify-between gap-space-md">
                <div>
                  <p className="font-title-lg text-title-lg uppercase text-primary">
                    {professional.full_name}
                  </p>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                    {professional.email ?? 'Sin correo'} ·{' '}
                    {professional.phone ?? 'Sin teléfono'}
                  </p>
                </div>
                <span
                  className={`shrink-0 px-2.5 py-1 font-label-caps text-[10px] uppercase tracking-wider ${
                    professional.active
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-zinc-200 text-zinc-700'
                  }`}
                >
                  {professional.active ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              <button
                className="mt-space-md border border-surface-container px-4 py-2 font-label-caps text-[10px] uppercase tracking-wider text-primary transition-colors hover:border-secondary"
                onClick={() => {
                  setEditing(professional)
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
        <ProfessionalForm
          nextSortOrder={nextSortOrder}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false)
            void loadProfessionals()
          }}
          professional={editing}
        />
      )}
    </div>
  )
}
