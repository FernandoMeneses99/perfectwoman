import { services } from '../data/services'
import { siteConfig } from '../data/site'
import ServiceCard from '../components/ui/ServiceCard'

export default function FeaturedServices() {
  return (
    <section id="servicios" className="w-full bg-background py-space-3xl px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest">Portafolio Esencial</span>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-tight mt-1">Especialidades del Estudio</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-2">
              Tratamientos diseñados para armonizar y potenciar la expresión natural de tu rostro con proporciones arquitectónicas.
            </p>
          </div>
        </div>
        <div className="mt-space-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {services.map((s) => (
            <ServiceCard key={s.id} category={s.category} name={s.name} description={s.description} duration={s.duration} durationVerified={s.durationVerified} priceCOP={s.priceCOP} priceVerified={s.priceVerified} image={s.image} imageAlt={s.imageAlt} bookingHref={siteConfig.bookingHref} />
          ))}
        </div>
      </div>
    </section>
  )
}
