import { Link } from 'react-router-dom'
import { siteConfig } from '../data/site'

export default function HeroSection() {
  return (
    <section id="inicio" className="relative w-full overflow-hidden bg-surface-bright pt-space-xl pb-space-3xl px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="absolute -top-32 right-0 w-[580px] h-[580px] bg-secondary-container/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -left-20 w-[420px] h-[420px] bg-tertiary-fixed-dim/20 rounded-full blur-2xl pointer-events-none"></div>
      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-center">
        <div className="w-full min-w-0 lg:col-span-7 flex flex-col items-start z-10">
          <div className="inline-flex w-fit max-w-full flex-wrap items-center gap-space-xs border-l-2 border-brand-pink px-3 py-1.5 bg-surface-container text-secondary text-label-caps font-label-caps uppercase tracking-normal">
            <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            <span className="min-w-0 break-words">Más de 5 años de experiencia · Bogotá, Colombia</span>
          </div>
          <h1 className="mt-space-lg font-display-hero text-display-hero-mobile sm:text-[48px] sm:leading-[56px] md:text-[56px] md:leading-[64px] lg:text-display-hero uppercase tracking-tight text-primary leading-none w-full max-w-full">
            Tu mirada,<br />
            <span className="font-editorial text-[clamp(2.75rem,8vw,5rem)] font-medium leading-[0.9] text-secondary italic tracking-normal lowercase block mt-1">tu esencia</span>
          </h1>
          <p className="mt-space-md font-body-lg text-body-lg w-full text-on-surface-variant max-w-xl">
            Realza tu belleza con servicios profesionales de pestañas y cejas. Arquitectura visagista de alta precisión y bienestar estético en el corazon de Bogotá.
          </p>
          <div className="mt-space-xl flex w-full flex-col gap-space-sm sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-space-md">
            <Link className="w-full px-8 py-4 text-center bg-secondary-container text-primary font-label-caps text-label-caps uppercase tracking-widest shadow-[3px_3px_0px_#282329] hover:bg-secondary hover:text-on-secondary hover:shadow-[1px_1px_0px_#282329] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 sm:w-auto" to={siteConfig.bookingPath}>Reservar cita</Link>
            <a className="w-full px-7 py-4 text-center bg-surface-container-lowest text-primary font-label-caps text-label-caps uppercase tracking-wider shadow-sm hover:bg-surface-container transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2 sm:w-auto" href="#servicios">Explorar Servicios</a>
          </div>
          <div className="mt-space-2xl pt-space-md flex flex-wrap items-center gap-y-2 gap-x-6 text-on-surface-variant font-label-md text-label-md">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-brand-pink text-[18px]">visibility</span>
              <span>Pestañas y cejas</span>
            </div>
            <span className="text-outline-variant hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-brand-pink text-[18px]">location_on</span>
              <span>Bogotá, Colombia</span>
            </div>
          </div>
        </div>
        <div className="relative mt-space-xl w-full min-w-0 lg:col-span-5 lg:mt-0">
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative bg-surface-container-high overflow-hidden shadow-xl aspect-[4/5]">
              <img className="w-full h-full object-cover" alt="Retrato editorial de mujer con cejas esculpidas y extensiones de pestañas" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiyEk9eF-JhghldRMvR0Mh0sbFU24ty78Kuc3Kzaz2JGnQXcMxyZxONy1uJsr2m6RZmv0-y477EtpOLL8rg2U4KuKqZyXsiJS8FLPI55xfVF8k7767MK4BkSbLMPdkQPsrBbUHjj8BUno4YjsSK_Os0lwwF7ySk2w7ewge7hIPHjZ7UvTRG6E_vsB0umLlstn0I5nEsB4gCt2i4KdbVNPurvRUZeBSfhNpZp8fZt80" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-md p-space-md flex items-center justify-between shadow-sm">
                <div>
                  <span className="font-label-caps text-label-caps uppercase text-secondary block">Atelier Bogotá</span>
                  <span className="font-headline-sm text-headline-sm text-primary">Edición Couture</span>
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container px-2 py-1">2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
