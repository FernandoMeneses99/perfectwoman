import { siteConfig } from '../data/site'

export default function BookingCTA() {
  return (
    <section id="reservas" className="relative w-full overflow-hidden bg-primary px-margin py-space-3xl text-on-primary md:px-margin-tablet lg:px-margin-desktop">
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-secondary-container/20 blur-3xl"></div>
      <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
        <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary-fixed">Consultas de servicios · Bogotá, Colombia</span>
        <h2 className="mt-space-md max-w-3xl font-headline-lg text-headline-lg-mobile uppercase leading-tight tracking-tight text-surface-bright md:text-headline-lg">
          Hablemos de tu próxima cita
        </h2>
        <p className="mt-space-md max-w-xl font-body-lg text-body-lg text-primary-fixed-dim">
          Pregunta por servicios y disponibilidad por WhatsApp o Instagram.
        </p>
        <div className="mt-space-xl flex w-full flex-wrap items-center justify-center gap-space-md">
          <a className="bg-secondary-container px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest text-primary shadow-[3px_3px_0px_#ffffff] transition-colors hover:bg-secondary hover:text-on-secondary" href="#servicios">
            Ver servicios
          </a>
          {siteConfig.whatsapp ? (
            <a className="px-5 py-4 font-label-caps text-label-caps uppercase tracking-wider text-primary-fixed-dim" href={siteConfig.whatsapp} rel="noopener noreferrer" target="_blank">Abrir chat de WhatsApp</a>
          ) : (
            <span className="px-5 py-4 font-label-caps text-label-caps uppercase tracking-wider text-primary-fixed-dim" aria-label="WhatsApp no configurado">
              WhatsApp no configurado
            </span>
          )}
          <a className="flex items-center gap-2 px-6 py-4 font-label-caps text-label-caps uppercase tracking-wider text-surface-bright transition-colors hover:text-secondary-fixed" href={siteConfig.instagram} rel="noopener noreferrer" target="_blank">
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            <span>Consultar por Instagram</span>
          </a>
        </div>
        <p className="mt-space-2xl max-w-2xl font-body-sm text-body-sm text-outline-variant">
          El sitio no recibe reservas en línea. Escríbenos por WhatsApp o Instagram para consultar servicios y disponibilidad.
        </p>
      </div>
    </section>
  )
}
