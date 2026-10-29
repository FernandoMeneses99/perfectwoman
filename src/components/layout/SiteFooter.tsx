import { navLinks } from '../../data/nav'
import { siteConfig } from '../../data/site'

export default function SiteFooter() {
  return (
    <footer className="w-full bg-surface-container-low text-on-surface">
      <div className="w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-gutter-desktop">
          <div className="lg:col-span-4 flex flex-col items-start">
            <span className="font-headline-md text-headline-md uppercase tracking-tight text-primary">{siteConfig.brand}</span>
            <span className="font-label-caps text-label-caps uppercase text-secondary mt-1">Atelier de Mirada & Estética Facial</span>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-md max-w-sm">
              Arquitectura de la mirada y tratamientos de autor en Bogotá. Precisión milimétrica, armonía facial y cuidado de alta costura para pestañas, cejas y piel.
            </p>
            <div className="mt-space-lg inline-flex items-center gap-space-xs px-3 py-1.5 bg-surface-container text-secondary">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span className="font-label-caps text-label-caps uppercase">Bogotá, Colombia · Más de 5 años realzando tu mirada</span>
            </div>
          </div>
          <div className="lg:col-span-3 flex flex-col">
            <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest">Servicios Exclusivos</span>
            <ul className="mt-space-md space-y-space-sm font-body-md text-body-md text-on-surface-variant">
              <li className="hover:text-primary transition-colors"><a href="#servicios">Pestañas (Clásicas, Híbridas, Volumen Ruso)</a></li>
              <li className="hover:text-primary transition-colors"><a href="#servicios">Cejas (Diseño Visagista, Henna, Laminado)</a></li>
              <li className="hover:text-primary transition-colors"><a href="#servicios">Lifting de Pestañas & Keratina</a></li>
              <li className="hover:text-primary transition-colors"><a href="#servicios">Depilación Facial con Hilo Hindú</a></li>
              <li className="hover:text-primary transition-colors"><a href="#servicios">Cuidado & Preparación de la Piel</a></li>
            </ul>
          </div>
          <div className="lg:col-span-2 flex flex-col">
            <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest">Navegación</span>
            <ul className="mt-space-md space-y-space-sm font-body-md text-body-md text-on-surface-variant">
              {navLinks.map((link) => (
                <li key={link.path} className="hover:text-primary transition-colors"><a href={link.href}>{link.label === 'Sobre mí' ? 'Master Artist' : link.label === 'Contacto' ? 'Ubicación & Citas' : link.label === 'Servicios' ? 'Carta de Servicios' : link.label === 'Galería' ? 'Galería Editorial' : link.label}</a></li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-3 flex flex-col">
            <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest">Atención Privada</span>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-md">{siteConfig.location}<br />Previa reserva confirmada.</p>
            <div className="flex items-center gap-space-sm mt-space-md">
              <a aria-label="Instagram" className="w-9 h-9 flex items-center justify-center bg-surface-container text-on-surface-variant hover:text-secondary hover:bg-surface-container-high transition-colors" href={siteConfig.instagram} rel="noopener noreferrer" target="_blank">
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              </a>
              <a aria-label="WhatsApp" className="w-9 h-9 flex items-center justify-center bg-surface-container text-on-surface-variant hover:text-secondary hover:bg-surface-container-high transition-colors" href={siteConfig.whatsapp} rel="noopener noreferrer" target="_blank">
                <span className="material-symbols-outlined text-[18px]">chat</span>
              </a>
              <a aria-label="Contacto" className="w-9 h-9 flex items-center justify-center bg-surface-container text-on-surface-variant hover:text-secondary hover:bg-surface-container-high transition-colors" href="#contacto">
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </a>
            </div>
            <div className="mt-space-lg">
              <a className="inline-block px-4 py-2 bg-primary text-on-primary font-label-caps text-label-caps uppercase hover:bg-secondary hover:text-on-secondary transition-colors" href={siteConfig.bookingHref}>Agenda en Línea</a>
            </div>
          </div>
        </div>
        <div className="mt-space-2xl pt-space-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-space-md text-on-surface-variant">
          <p className="font-body-sm text-body-sm max-w-xl">Nota editorial: Los valores, tiempos y agendas exhibidos son referencias ilustrativas de portafolio y confirmación directa según valoración visagista personalizada.</p>
          <p className="font-body-sm text-body-sm">© 2025 {siteConfig.brand}. Todos los derechos reservados · {siteConfig.location}.</p>
        </div>
      </div>
    </footer>
  )
}
