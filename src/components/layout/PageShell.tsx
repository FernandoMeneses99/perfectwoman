import type { ReactNode } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { siteConfig } from '../../data/site'

type PageShellProps = {
  children: ReactNode
}

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-surface-container bg-surface/95">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-margin py-4 md:px-margin-tablet lg:px-margin-desktop">
          <Link className="group flex min-w-0 flex-col" to="/">
            <span className="font-headline-sm text-[14px] uppercase tracking-wider text-primary transition-colors group-hover:text-secondary">
              {siteConfig.brand}
            </span>
            <span className="font-label-caps text-[7px] uppercase tracking-normal text-on-surface-variant">
              {siteConfig.descriptor}
            </span>
          </Link>
          <div className="flex items-center gap-space-sm sm:gap-space-md">
            <Link
              className="hidden font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:text-primary sm:inline"
              to="/"
            >
              Inicio
            </Link>
            <a
              className="flex items-center gap-2 bg-primary px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary"
              href={siteConfig.whatsapp}
              rel="noopener noreferrer"
              target="_blank"
            >
              <FaWhatsapp aria-hidden="true" className="text-[18px]" />
              WhatsApp
            </a>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-surface-container bg-surface-container-low px-margin py-space-lg text-center md:px-margin-tablet lg:px-margin-desktop">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          © 2026 {siteConfig.brand} ·{' '}
          <Link className="underline decoration-secondary/40 underline-offset-2 hover:text-primary" to={siteConfig.privacyPath}>
            Política de privacidad
          </Link>
        </p>
      </footer>
    </div>
  )
}
