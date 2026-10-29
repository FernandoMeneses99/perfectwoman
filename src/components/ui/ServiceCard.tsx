type ServiceCardProps = {
  category: string
  name: string
  description: string
  duration: string
  priceCOP: number
  image: string
  imageAlt: string
  bookingHref?: string
}

export default function ServiceCard({ category, name, description, duration, priceCOP: _priceCOP, image, imageAlt, bookingHref = '#reservas' }: ServiceCardProps) {
  return (
    <article className="flex flex-col bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow group">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-high">
        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={image} alt={imageAlt} />
        <div className="absolute top-3 left-3 bg-primary text-on-primary px-2.5 py-1 font-label-caps text-[10px] tracking-wider uppercase">
          {duration}
        </div>
      </div>
      <div className="p-space-lg flex flex-col flex-1">
        <span className="font-label-caps text-[10px] uppercase text-secondary font-semibold tracking-wider">{category}</span>
        <h3 className="font-title-lg text-title-lg text-primary uppercase mt-1">{name}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2 flex-1">{description}</p>
        <div className="mt-space-lg pt-space-sm flex items-center justify-between bg-surface-container px-3 py-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Tarifa base</span>
          <span className="font-headline-sm text-headline-sm text-primary font-bold"> <span className="font-body-sm text-xs font-normal">COP</span></span>
        </div>
        <a className="mt-space-md w-full text-center py-2.5 bg-primary text-on-primary font-label-caps text-label-caps uppercase tracking-wider hover:bg-secondary transition-colors" href={bookingHref}>
          Agendar
        </a>
      </div>
    </article>
  )
}
