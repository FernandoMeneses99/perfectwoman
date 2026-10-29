import { siteConfig } from '../data/site'

export default function BookingCTA() {
  return (
    <section id="reservas" className="w-full bg-primary text-on-primary py-space-3xl px-margin md:px-margin-tablet lg:px-margin-desktop relative overflow-hidden">
      <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute left-1/4 -top-20 w-80 h-80 bg-tertiary-container/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center">
        <span className="font-label-caps text-label-caps uppercase text-secondary-fixed tracking-widest">
          Atención con Cita Previa · Bogotá, Colombia
        </span>
        <h2 className="mt-space-md font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase tracking-tight text-surface-bright max-w-3xl leading-tight">
          ¿Lista para transformar tu mirada?
        </h2>
        <p className="mt-space-md font-body-lg text-body-lg text-primary-fixed-dim max-w-xl">
          Reserva tu espacio exclusivo en nuestro atelier. Te asesoramos paso a paso para conseguir el resultado que siempre soñaste.
        </p>
        <div className="mt-space-xl flex flex-wrap items-center justify-center gap-space-md w-full">
          <a className="px-8 py-4 bg-secondary-container text-primary font-label-caps text-label-caps uppercase tracking-widest shadow-[3px_3px_0px_#ffffff] hover:bg-secondary hover:text-on-secondary transition-all" href={siteConfig.bookingHref}>
            Reservar Cita Online
          </a>
          <a className="px-7 py-4 bg-surface-container-high text-primary font-label-caps text-label-caps uppercase tracking-wider flex items-center gap-2 hover:bg-surface-bright transition-colors shadow-sm" href={siteConfig.whatsapp} rel="noopener noreferrer" target="_blank">
            <span className="material-symbols-outlined text-[18px] text-secondary">chat</span>
            <span>Contactar por WhatsApp (+57 Bogotá)</span>
          </a>
          <a className="px-6 py-4 bg-transparent text-surface-bright font-label-caps text-label-caps uppercase tracking-wider flex items-center gap-2 hover:text-secondary-fixed transition-colors" href={siteConfig.instagram} rel="noopener noreferrer" target="_blank">
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            <span>@perfectwoman_t</span>
          </a>
        </div>
        <div className="mt-space-2xl pt-space-md text-on-primary-container max-w-2xl">
          <p className="font-body-sm text-body-sm text-outline-variant">
            Nota aclaratoria: Todos los precios, duraciones, horarios y reseñas mostrados son ilustrativos/configurables. No se ha habilitado backend aún. Cita previa obligatoria.
          </p>
        </div>
      </div>
    </section>
  )
}
