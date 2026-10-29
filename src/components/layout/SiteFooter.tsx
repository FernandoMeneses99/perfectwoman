import { FaInstagram, FaWhatsapp } from 'react-icons/fa'
import { navLinks } from '../../data/nav'
import { siteConfig } from '../../data/site'

export default function SiteFooter() {
  return (
    <footer className="w-full bg-surface-container-low text-on-surface">
      <div className="w-full px-margin py-space-3xl md:px-margin-tablet lg:px-margin-desktop">
        <div className="grid grid-cols-1 gap-gutter-desktop md:grid-cols-2 lg:grid-cols-12">
          <div className="flex flex-col items-start lg:col-span-4">
            <span className="font-headline-md text-headline-md uppercase tracking-tight text-primary">{siteConfig.brand}</span>
            <span className="mt-1 font-label-caps text-label-caps uppercase text-secondary">Estudio de mirada y belleza</span>
            <p className="mt-space-md max-w-sm font-body-md text-body-md text-on-surface-variant">
              Servicios de pestañas, cejas, depilación, lifting y cuidado de la piel en Bogotá.
            </p>
            <div className="mt-space-lg inline-flex items-center gap-space-xs border-l-2 border-brand-pink bg-surface-container px-3 py-1.5 text-primary">
              <span className="font-label-caps text-label-caps uppercase">Bogotá, Colombia · Más de 5 años de experiencia</span>
            </div>
          </div>
          <div className="flex flex-col lg:col-span-3">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">Servicios</span>
            <ul className="mt-space-md space-y-space-sm font-body-md text-body-md text-on-surface-variant">
              {['Pestañas', 'Cejas', 'Depilación', 'Lifting', 'Cuidado de la piel'].map((service) => (
                <li key={service} className="transition-colors hover:text-primary"><a href="#servicios">{service}</a></li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col lg:col-span-2">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">Navegación</span>
            <ul className="mt-space-md space-y-space-sm font-body-md text-body-md text-on-surface-variant">
              {navLinks.map((link) => (
                <li key={link.path} className="transition-colors hover:text-primary"><a href={link.href}>{link.label}</a></li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col lg:col-span-3">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">Contacto</span>
            <p className="mt-space-md font-body-md text-body-md text-on-surface-variant">
              {siteConfig.location}<br />Consulta por WhatsApp o Instagram.
            </p>
            <div className="mt-space-md flex items-center gap-space-sm">
              <a aria-label="Instagram" className="flex h-9 w-9 items-center justify-center bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-secondary" href={siteConfig.instagram} rel="noopener noreferrer" target="_blank">
                <FaInstagram aria-hidden="true" className="text-[18px]" />
              </a>
              <a aria-label="Información de contacto" className="flex h-9 w-9 items-center justify-center bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-secondary" href="#reservas">
                <span className="material-symbols-outlined text-[18px]">info</span>
              </a>
              {siteConfig.whatsapp ? (
                <a aria-label="WhatsApp" className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant hover:text-secondary" href={siteConfig.whatsapp} rel="noopener noreferrer" target="_blank"><FaWhatsapp aria-hidden="true" className="text-lg" />WhatsApp</a>
              ) : (
                <span className="font-body-sm text-body-sm text-on-surface-variant">WhatsApp no configurado</span>
              )}
            </div>
            <div className="mt-space-lg">
              <a className="inline-block bg-primary px-4 py-2 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary hover:text-on-secondary" href={siteConfig.bookingHref}>Consultar disponibilidad</a>
            </div>
          </div>
        </div>
        <div className="mt-space-2xl flex flex-col items-start justify-between gap-space-md pt-space-lg text-on-surface-variant md:flex-row md:items-center">
          <p className="max-w-xl font-body-sm text-body-sm">Precios y duraciones por confirmar. Consulta la información vigente por WhatsApp o Instagram.</p>
          <p className="font-body-sm text-body-sm">© 2026 {siteConfig.brand}. Todos los derechos reservados · {siteConfig.location}.</p>
        </div>
      </div>
    </footer>
  )
}
