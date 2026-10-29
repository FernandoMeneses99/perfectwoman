import { siteConfig } from '../data/site'

export default function SpecialistSection() {
  return (
    <section id="sobre-mi" className="w-full bg-surface-container-low py-space-3xl px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-center">
        <div className="lg:col-span-5 relative">
          <div className="relative bg-surface-container overflow-hidden shadow-xl aspect-[3/4]">
            <img className="w-full h-full object-cover" alt="Retrato de la master artist en estudio" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDRoGVbG16zJEU9wDdZK7rtC165VVuHs0DHFf5HdZw8uRoVe8VVqa8CSblZDeiZt-09lDpVF9AFnLFK-VKQx5OOuX6FC0l93_MBbR6MDv3hY-XF45tfqhqQwfGtdI0d8yhXLSpzHyqfa_0UrLmtbhZeswuA-s6nnF80oYd7EB2u5yzjuj6RKJscNKwQIneyxTggGpEsrS_XuCFqiGzocEvUk3XJ1VtRnzh7766r6Ah" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary-container/30 rounded-full blur-xl pointer-events-none"></div>
          </div>
          <div className="mt-space-md p-space-md bg-surface-container-lowest shadow-sm flex items-center justify-between">
            <div>
              <span className="font-label-caps text-label-caps uppercase text-secondary">Fundadora & Master Artist</span>
              <span className="font-title-lg text-title-lg text-primary block">Tathiana · Perfect Woman T</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">brush</span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7 flex flex-col items-start lg:pl-space-lg">
          <div className="inline-flex items-center gap-space-xs px-3 py-1 bg-surface-container text-secondary text-label-caps font-label-caps uppercase">
            <span>Filosofía Visagista</span>
          </div>
          <h2 className="mt-space-md font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-tight">
            Conoce a tu Especialista
          </h2>
          <p className="mt-space-md font-body-lg text-body-lg text-on-surface-variant">
            Más de cinco años de experiencia en servicios de pestañas y cejas en Bogotá. Cada persona puede consultar las opciones disponibles según su estilo.
          </p>
          <div className="mt-space-lg grid grid-cols-1 sm:grid-cols-2 gap-space-md w-full">
            <div className="p-space-md bg-surface-container-lowest shadow-sm">
              <div className="flex items-center gap-space-xs text-primary font-title-lg text-title-lg">
                <span className="material-symbols-outlined text-secondary text-[22px]">health_and_safety</span>
                <span>Información del servicio</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Consulta por Instagram los materiales y protocolos vigentes del servicio.
              </p>
            </div>
            <div className="p-space-md bg-surface-container-lowest shadow-sm">
              <div className="flex items-center gap-space-xs text-primary font-title-lg text-title-lg">
                <span className="material-symbols-outlined text-secondary text-[22px]">architecture</span>
                <span>Servicios del estudio</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Pestañas, cejas, depilación, lifting y cuidado de la piel.
              </p>
            </div>
          </div>
          <blockquote className="mt-space-xl p-space-lg bg-surface-container-high shadow-sm w-full relative">
            <span className="material-symbols-outlined text-secondary/30 text-[48px] absolute top-2 right-4 pointer-events-none">format_quote</span>
            <p className="font-headline-sm text-headline-sm italic text-primary leading-snug">
              «Cada mirada tiene su propia arquitectura; mi misión es resaltar tu belleza única sin perder your esencia natural.»
            </p>
            <cite className="mt-space-sm block font-label-caps text-label-caps uppercase text-secondary not-italic font-bold tracking-widest">
              — Master Artist Tathiana · Bogotá
            </cite>
          </blockquote>
          <div className="mt-space-xl">
            <a className="px-6 py-3 bg-primary text-on-primary font-label-caps text-label-caps uppercase tracking-widest hover:bg-secondary transition-colors shadow-sm" href={siteConfig.bookingHref}>
              Consultar disponibilidad
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
