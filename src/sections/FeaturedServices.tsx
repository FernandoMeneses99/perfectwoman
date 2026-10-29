import { useEffect, useState } from 'react'
import ServiceCard from '../components/ui/ServiceCard'
import { services } from '../data/services'
import type { Service } from '../data/services'
import { serviceBookingHref } from '../data/site'
import { fetchPublicServices } from '../lib/booking'
import type { PublicService } from '../lib/booking'

function toShowcaseService(row: PublicService): Service {
  const fallback = services.find((service) => service.id === row.slug)

  return {
    id: row.slug,
    category: row.category ?? fallback?.category ?? 'Servicio',
    name: row.name,
    description: row.description ?? fallback?.description ?? '',
    duration: `${row.duration_minutes} min`,
    durationVerified: true,
    priceCOP: row.price_cop,
    priceVerified: row.price_verified,
    image: fallback?.image ?? '',
    imageAlt: fallback?.imageAlt ?? row.name,
    verified: row.price_verified,
  }
}

export default function FeaturedServices() {
  const [items, setItems] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    fetchPublicServices()
      .then((rows) => {
        if (active) {
          setItems(rows.map(toShowcaseService))
        }
      })
      .catch(() => {
        if (active) {
          setItems(services)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

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
        <div className="mt-space-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter" aria-busy={loading}>
          {loading
            ? Array.from({ length: 4 }, (_, index) => (
                <div className="animate-pulse border border-surface-container bg-surface-container-lowest" key={index}>
                  <div className="aspect-[4/3] bg-surface-container" />
                  <div className="space-y-3 p-space-lg">
                    <div className="h-2.5 w-24 bg-surface-container" />
                    <div className="h-5 w-3/4 bg-surface-container" />
                    <div className="h-3 w-full bg-surface-container" />
                    <div className="h-3 w-2/3 bg-surface-container" />
                  </div>
                </div>
              ))
            : items.length === 0
              ? (
                  <p className="col-span-full font-body-md text-body-md text-on-surface-variant">
                    No hay servicios disponibles por el momento.
                  </p>
                )
              : items.map((service) => (
                  <ServiceCard
                    key={service.id}
                    category={service.category}
                    name={service.name}
                    description={service.description}
                    duration={service.duration}
                    priceCOP={service.priceCOP}
                    image={service.image}
                    imageAlt={service.imageAlt}
                    bookingHref={serviceBookingHref(service.id)}
                  />
                ))}
        </div>
      </div>
    </section>
  )
}
