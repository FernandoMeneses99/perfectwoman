import { useSiteContent } from '../lib/siteContentContext'
import type { GalleryItem } from '../lib/siteContent'

function GalleryTile({
  className,
  item,
  large = false,
}: {
  className: string
  item: GalleryItem
  large?: boolean
}) {
  return (
    <div className={`${className} relative group overflow-hidden bg-surface-container-high shadow-sm`}>
      <img
        alt={item.image_alt}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        decoding="async"
        loading="lazy"
        src={item.image_url}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
      <div className="absolute bottom-4 left-4 right-4 p-space-sm flex items-end justify-between gap-3 text-on-primary">
        <div>
          <span className="font-label-caps text-[10px] uppercase text-secondary-fixed tracking-wider">{item.subtitle}</span>
          <h4 className={`${large ? 'font-headline-sm text-headline-sm' : 'font-title-lg text-title-lg'} font-semibold`}>{item.title}</h4>
        </div>
        {item.badge && (
          <span className="font-label-caps text-label-caps px-2.5 py-1 bg-surface-container-lowest/20 backdrop-blur-sm uppercase whitespace-nowrap">{item.badge}</span>
        )}
      </div>
    </div>
  )
}

export default function GallerySection() {
  const { content, gallery } = useSiteContent()
  const [first, second, ...rest] = gallery
  const secondaryItems = rest.slice(0, 3)

  return (
    <section id="galeria" className="w-full bg-background py-space-3xl px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest">{content.gallery.eyebrow}</span>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-tight mt-1">{content.gallery.title}</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mt-2">
              {content.gallery.description}
            </p>
          </div>
        </div>
        <div className="mt-space-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-gutter items-stretch">
          {first && (
            <GalleryTile
              className="lg:col-span-7 aspect-[16/10] sm:aspect-auto sm:min-h-[380px]"
              item={first}
              large
            />
          )}
          {second && (
            <GalleryTile
              className="lg:col-span-5 aspect-[4/3] sm:aspect-auto sm:min-h-[380px]"
              item={second}
              large
            />
          )}
          {secondaryItems.map((item) => (
            <GalleryTile
              className="lg:col-span-4 aspect-[4/3]"
              item={item}
              key={item.id}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
