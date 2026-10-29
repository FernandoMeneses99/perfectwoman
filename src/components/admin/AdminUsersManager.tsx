import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { mapAdminError } from '../../lib/admin'
import { fetchAdminUsers, saveAdminUser } from '../../lib/adminCatalog'
import type { AdminUser } from '../../lib/adminCatalog'
import AdminModal from './AdminModal'

type AdminUserFormProps = {
  admin: AdminUser | null
  onClose: () => void
  onSaved: () => void
}

function AdminUserForm({ admin, onClose, onSaved }: AdminUserFormProps) {
  const [email, setEmail] = useState(admin?.email ?? '')
  const [displayName, setDisplayName] = useState(admin?.display_name ?? '')
  const [active, setActive] = useState(admin?.active ?? true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await saveAdminUser({
        email: email.trim().toLowerCase(),
        displayName: displayName.trim() || null,
        active,
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
      eyebrow="Accesos"
      onClose={onClose}
      title={admin ? 'Editar administrador' : 'Agregar administrador'}
    >
      <form className="space-y-space-md" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
          Correo *
          <input
            autoComplete="email"
            className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary disabled:cursor-not-allowed disabled:bg-surface-container"
            disabled={Boolean(admin)}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
          Nombre visible
          <input
            className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary"
            maxLength={120}
            onChange={(event) => setDisplayName(event.target.value)}
            value={displayName}
          />
        </label>

        <label className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
          <input
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            type="checkbox"
          />
          Acceso activo
        </label>

        <p className="border-l-2 border-surface-container bg-surface-container-low px-3 py-2 font-body-sm text-body-sm text-on-surface-variant">
          El correo debe existir primero en Supabase Auth. No puedes desactivar tu
          propio acceso.
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
            {submitting ? 'Guardando…' : 'Guardar administrador'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}

export default function AdminUsersManager() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [busyEmail, setBusyEmail] = useState<string | null>(null)

  async function loadAdmins() {
    setLoading(true)
    setError(null)

    try {
      setAdmins(await fetchAdminUsers())
    } catch (loadError) {
      setError(mapAdminError(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAdmins()
  }, [])

  async function handleToggle(admin: AdminUser) {
    setBusyEmail(admin.email)
    setError(null)

    try {
      await saveAdminUser({
        email: admin.email,
        displayName: admin.display_name,
        active: !admin.active,
      })
      await loadAdmins()
    } catch (toggleError) {
      setError(mapAdminError(toggleError))
    } finally {
      setBusyEmail(null)
    }
  }

  return (
    <div className="space-y-space-lg py-space-lg md:py-space-xl">
      <div className="flex flex-col gap-space-md sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
            Accesos
          </span>
          <h1 className="mt-space-sm font-headline-lg text-headline-lg-mobile uppercase leading-tight text-primary md:text-headline-lg">
            Administradores
          </h1>
          <p className="mt-space-sm max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Controla quién puede entrar al panel. Los usuarios se crean en Supabase
            Auth y aquí se habilitan.
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
          Agregar administrador
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
          Cargando administradores…
        </p>
      ) : (
        <div className="space-y-space-md">
          {admins.map((admin) => (
            <article
              className="border border-surface-container bg-surface-container-lowest p-space-md shadow-sm"
              key={admin.email}
            >
              <div className="flex flex-col gap-space-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-title-lg text-title-lg text-primary">
                    {admin.display_name ?? admin.email}
                  </p>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                    {admin.email}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-space-sm">
                  <span
                    className={`px-2.5 py-1 font-label-caps text-[10px] uppercase tracking-wider ${
                      admin.active
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    {admin.active ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
                    className="border border-surface-container px-4 py-2 font-label-caps text-[10px] uppercase tracking-wider text-primary transition-colors hover:border-secondary"
                    onClick={() => {
                      setEditing(admin)
                      setFormOpen(true)
                    }}
                    type="button"
                  >
                    Editar
                  </button>
                  <button
                    className={`border px-4 py-2 font-label-caps text-[10px] uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      admin.active
                        ? 'border-error/40 text-error hover:border-error hover:bg-error-container'
                        : 'border-secondary/40 text-secondary hover:border-secondary hover:bg-surface-container'
                    }`}
                    disabled={busyEmail === admin.email}
                    onClick={() => void handleToggle(admin)}
                    type="button"
                  >
                    {busyEmail === admin.email
                      ? 'Guardando…'
                      : admin.active
                        ? 'Desactivar'
                        : 'Activar'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {formOpen && (
        <AdminUserForm
          admin={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false)
            void loadAdmins()
          }}
        />
      )}
    </div>
  )
}
