import { Link } from 'react-router-dom'

type ServiceCardProps = {
  category: string
  name: string
  description: string
  duration: string
  priceCOP: number | null
  image?: string
  imageAlt: string
  bookingHref?: string
}

export default function ServiceCard({
  category,
  name,
  description,
  duration,
  priceCOP,
  image,
  imageAlt,
  bookingHref = '/reservas',
}: ServiceCardProps) {
  return (
    <article className="group flex flex-col bg-surface-container-lowest shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-high">
        {image ? (
          <img className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src={image} alt={imageAlt} decoding="async" loading="lazy" />
        ) : (
          <div className="flex h-full items-end bg-surface-container p-space-lg">
            <span className="font-headline-sm text-headline-sm uppercase leading-none text-primary/40">{name}</span>
          </div>
        )}
        <span className="absolute left-3 top-3 bg-primary px-2.5 py-1 font-label-caps text-[10px] tracking-wider text-on-primary">
          {duration}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-space-lg">
        <span className="font-label-caps text-[10px] font-semibold uppercase tracking-wider text-secondary">{category}</span>
        <h3 className="mt-1 font-title-lg text-title-lg uppercase text-primary">{name}</h3>
        <p className="mt-2 flex-1 font-body-md text-body-md text-on-surface-variant">{description}</p>
        <div className="mt-space-lg flex items-center justify-between bg-surface-container px-3 py-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Precio</span>
          <span className="font-body-sm text-body-sm font-semibold text-primary">
            {priceCOP !== null ? 'COP ' + priceCOP.toLocaleString('es-CO') : 'Precio por confirmar'}
          </span>
        </div>
        <Link className="mt-space-md w-full bg-primary py-2.5 text-center font-label-caps text-label-caps uppercase tracking-wider text-on-primary transition-colors hover:bg-secondary" to={bookingHref}>
          Reservar este servicio
        </Link>
      </div>
    </article>
  )
}
