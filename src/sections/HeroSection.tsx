import { siteConfig } from '../data/site'

export default function HeroSection() {
  return (
    <section id="inicio" className="relative w-full overflow-hidden bg-surface-bright pt-space-xl pb-space-3xl px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="absolute -top-32 right-0 w-[580px] h-[580px] bg-secondary-container/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -left-20 w-[420px] h-[420px] bg-tertiary-fixed-dim/20 rounded-full blur-2xl pointer-events-none"></div>
      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-center">
        <div className="lg:col-span-7 flex flex-col items-start z-10">
          <div className="inline-flex items-center gap-space-xs px-3 py-1.5 bg-surface-container text-secondary text-label-caps font-label-caps uppercase tracking-widest shadow-sm">
            <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            <span>Mas de 5 anos de experiencia profesional · Bogota, Colombia</span>
          </div>
          <h1 className="mt-space-lg font-display-hero text-display-hero-mobile sm:text-[48px] sm:leading-[56px] md:text-[56px] md:leading-[64px] lg:text-display-hero uppercase tracking-tight text-primary leading-none max-w-full">
            Tu mirada,<br />
            <span className="text-secondary italic font-headline-lg font-light tracking-normal lowercase block mt-1">tu esencia</span>
          </h1>
          <p className="mt-space-md font-body-lg text-body-lg text-on-surface-variant max-w-xl">
            Realza tu belleza con servicios profesionales de pestanas y cejas. Arquitectura visagista de alta precision y bienestar estetico en el corazon de Bogota.
          </p>
          <div className="mt-space-xl flex flex-wrap items-center gap-space-md w-full sm:w-auto">
            <a className="px-8 py-4 bg-secondary-container text-primary font-label-caps text-label-caps uppercase tracking-widest shadow-[3px_3px_0px_#282329] hover:bg-secondary hover:text-on-secondary hover:shadow-[1px_1px_0px_#282329] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2" href={siteConfig.bookingHref}>Reservar Cita</a>
            <a className="px-7 py-4 bg-surface-container-lowest text-primary font-label-caps text-label-caps uppercase tracking-wider shadow-sm hover:bg-surface-container transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2" href="#servicios">Explorar Servicios</a>
          </div>
          <div className="mt-space-2xl pt-space-md flex flex-wrap items-center gap-y-2 gap-x-6 text-on-surface-variant font-label-md text-label-md">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
              <span>Atencion personalizada</span>
            </div>
            <span className="text-outline-variant hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[18px]">award_star</span>
              <span>Tecnicas certificadas</span>
            </div>
            <span className="text-outline-variant hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[18px]">calendar_clock</span>
              <span>Cita previa obligatoria</span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-5 relative mt-space-xl lg:mt-0">
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative bg-surface-container-high overflow-hidden shadow-xl aspect-[4/5]">
              <img className="w-full h-full object-cover" alt="Retrato editorial de mujer con cejas esculpidas y extensiones de pestanas" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiyEk9eF-JhghldRMvR0Mh0sbFU24ty78Kuc3Kzaz2JGnQXcMxyZxONy1uJsr2m6RZmv0-y477EtpOLL8rg2U4KuKqZyXsiJS8FLPI55xfVF8k7767MK4BkSbLMPdkQPsrBbUHjj8BUno4YjsSK_Os0lwwF7ySk2w7ewge7hIPHjZ7UvTRG6E_vsB0umLlstn0I5nEsB4gCt2i4KdbVNPurvRUZeBSfhNpZp8fZt80" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-md p-space-md flex items-center justify-between shadow-sm">
                <div>
                  <span className="font-label-caps text-label-caps uppercase text-secondary block">Atelier Bogota</span>
                  <span className="font-headline-sm text-headline-sm text-primary">Edicion Couture</span>
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
