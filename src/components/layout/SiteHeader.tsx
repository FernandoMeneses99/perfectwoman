import { useState } from 'react'
import { FaInstagram, FaWhatsapp } from 'react-icons/fa'
import { navLinks } from '../../data/nav'
import { siteConfig } from '../../data/site'

export default function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-surface/95 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex h-20 w-full items-center justify-between px-margin md:px-margin-tablet lg:px-margin-desktop">
        <a className="group flex min-w-0 flex-col" href="#inicio">
          <span className="font-headline-sm text-[14px] uppercase tracking-wider text-primary transition-colors group-hover:text-secondary sm:text-headline-sm">{siteConfig.brand}</span>
          <span className="font-label-caps text-[7px] uppercase tracking-normal text-on-surface-variant sm:text-label-caps">{siteConfig.descriptor}</span>
        </a>
        <nav className="hidden items-center gap-space-lg xl:flex" aria-label="Navegación principal">
          {navLinks.map((link) => (
            <a key={link.path} href={link.href} className="font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-space-md">
          <a aria-label="Instagram oficial" className="hidden h-10 w-10 items-center justify-center text-on-surface-variant transition-colors hover:bg-surface-container hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2 sm:flex" href={siteConfig.instagram} rel="noopener noreferrer" target="_blank">
            <FaInstagram aria-hidden="true" className="text-[20px]" />
          </a>
          {siteConfig.whatsapp ? (
            <a aria-label="WhatsApp" className="hidden items-center gap-space-xs px-3 py-2 font-label-caps text-label-caps text-on-surface-variant transition-colors hover:bg-surface-container sm:flex" href={siteConfig.whatsapp} rel="noopener noreferrer" target="_blank">
              <FaWhatsapp aria-hidden="true" className="text-[18px]" />
              <span>WhatsApp</span>
            </a>
          ) : (
            <span className="hidden px-2 py-2 font-label-caps text-label-caps text-on-surface-variant xl:inline" aria-label="WhatsApp no configurado">
              WhatsApp no configurado
            </span>
          )}
          <a className="bg-secondary px-2 py-2.5 text-[9px] font-label-caps uppercase tracking-normal text-on-secondary transition-colors hover:bg-tertiary-container hover:text-on-tertiary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 sm:px-4 sm:text-label-caps md:px-5" href={siteConfig.bookingHref}>
            <span className="sm:hidden">Consulta</span>
            <span className="hidden sm:inline md:hidden">Consulta</span>
            <span className="hidden md:inline">Consultar disponibilidad</span>
          </a>
          <button
            className="flex h-10 w-10 items-center justify-center text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2 xl:hidden"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            <span className="material-symbols-outlined text-[24px]">{open ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>
      {open && (
        <div id="mobile-menu" className="absolute left-0 right-0 top-20 border-t border-surface-container bg-surface shadow-md xl:hidden">
          <nav className="flex flex-col gap-space-sm px-margin py-space-md" aria-label="Navegación móvil">
            {navLinks.map((link) => (
              <a key={link.path} href={link.href} className="font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2" onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            <a href={siteConfig.bookingHref} className="mt-space-sm bg-secondary px-5 py-2.5 text-center font-label-caps text-label-caps uppercase tracking-widest text-on-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2" onClick={() => setOpen(false)}>
              Consultar disponibilidad
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
