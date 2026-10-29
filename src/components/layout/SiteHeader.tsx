import { useState } from 'react'
import { navLinks } from '../../data/nav'
import { siteConfig } from '../../data/site'

export default function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 w-full px-margin md:px-margin-tablet lg:px-margin-desktop flex items-center justify-between">
        <a className="flex flex-col group" href="#inicio">
          <span className="font-headline-sm text-headline-sm uppercase tracking-wider text-primary group-hover:text-secondary transition-colors">{siteConfig.brand}</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">{siteConfig.descriptor}</span>
        </a>
        <nav className="hidden xl:flex items-center gap-space-lg" aria-label="Navegacion principal">
          {navLinks.map((link) => (
            <a key={link.path} href={link.href} className="font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-on-surface transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-space-sm sm:gap-space-md">
          <a aria-label="Instagram oficial" className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-secondary hover:bg-surface-container transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2" href={siteConfig.instagram} rel="noopener noreferrer" target="_blank">
            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
          </a>
          <a aria-label="WhatsApp Studio Bogota" className="hidden sm:flex items-center gap-space-xs px-3 py-2 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2" href={siteConfig.whatsapp} rel="noopener noreferrer" target="_blank">
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span className="font-label-caps text-label-caps uppercase">+57 Bogota</span>
          </a>
          <a className="px-5 py-2.5 bg-secondary text-on-secondary font-label-caps text-label-caps uppercase tracking-widest hover:bg-tertiary-container hover:text-on-tertiary transition-colors shadow-[0_1px_8px_rgba(0,0,0,0.04)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2" href={siteConfig.bookingHref}>
            Reservar Cita
          </a>
          <button
            className="xl:hidden w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2"
            aria-label={open ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            <span className="material-symbols-outlined text-[24px]">{open ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>
      {open && (
        <div id="mobile-menu" className="xl:hidden absolute top-20 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-surface-container shadow-md">
          <nav className="flex flex-col px-margin py-space-md gap-space-sm" aria-label="Navegacion movil">
            {navLinks.map((link) => (
              <a key={link.path} href={link.href} className="font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-on-surface transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2" onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            <a href={siteConfig.bookingHref} className="mt-space-sm px-5 py-2.5 bg-secondary text-on-secondary font-label-caps text-label-caps uppercase tracking-widest text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2" onClick={() => setOpen(false)}>
              Reservar Cita
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
