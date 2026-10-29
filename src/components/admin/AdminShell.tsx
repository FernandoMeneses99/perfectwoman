import type { ReactNode } from 'react'
import { FaArrowLeft, FaSignOutAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { siteConfig } from '../../data/site'

type AdminShellProps = {
  children: ReactNode
  adminName?: string | null
  email?: string | null
  onSignOut?: () => void
  signingOut?: boolean
}

export default function AdminShell({
  children,
  adminName,
  email,
  onSignOut,
  signingOut = false,
}: AdminShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-surface-container bg-surface/95">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-space-sm px-margin py-4 sm:flex-row sm:items-center sm:justify-between md:px-margin-tablet lg:px-margin-desktop">
          <div className="flex min-w-0 items-center gap-space-md">
            <Link className="group flex min-w-0 flex-col" to="/">
              <span className="font-headline-sm text-[14px] uppercase tracking-wider text-primary transition-colors group-hover:text-secondary">
                {siteConfig.brand}
              </span>
              <span className="font-label-caps text-[7px] uppercase tracking-normal text-on-surface-variant">
                {siteConfig.descriptor}
              </span>
            </Link>
            <span className="hidden h-4 w-px bg-outline-variant sm:block" />
            <span className="hidden font-label-caps text-label-caps uppercase tracking-widest text-secondary sm:inline">
              Panel administrativo
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm sm:justify-end">
            <Link
              className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:text-primary"
              to="/"
            >
              <FaArrowLeft aria-hidden="true" />
              Ver sitio
            </Link>

            {adminName && (
              <span className="hidden max-w-48 truncate font-body-sm text-body-sm text-primary md:inline">
                {adminName}
              </span>
            )}

            {email && (
              <span className="hidden max-w-56 truncate font-body-sm text-body-sm text-on-surface-variant lg:inline">
                {email}
              </span>
            )}

            {onSignOut && (
              <button
                className="flex items-center gap-2 border border-surface-container px-3 py-2 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:border-secondary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                disabled={signingOut}
                onClick={onSignOut}
                type="button"
              >
                <FaSignOutAlt aria-hidden="true" />
                {signingOut ? 'Saliendo…' : 'Salir'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-surface-container px-margin py-space-md text-center md:px-margin-tablet lg:px-margin-desktop">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Acceso restringido · Sesión protegida con Supabase Auth
        </p>
      </footer>
    </div>
  )
}
