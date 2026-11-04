import { Link } from 'react-router-dom'
import { siteConfig } from '../data/site'
import { useSiteContent } from '../lib/siteContentContext'

const highlightIcons = ['health_and_safety', 'architecture', 'spa', 'auto_awesome']

export default function SpecialistSection() {
  const { content } = useSiteContent()
  const { specialist } = content

  return (
    <section id="sobre-mi" className="w-full bg-surface-container-low py-space-3xl px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-center">
        <div className="lg:col-span-5 relative">
          <div className="relative bg-surface-container overflow-hidden shadow-xl aspect-[4/3]">
            <img className="w-full h-full object-cover" alt={specialist.imageAlt} src={specialist.image} decoding="async" loading="lazy" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary-container/30 rounded-full blur-xl pointer-events-none"></div>
          </div>
          <div className="mt-space-md p-space-md bg-surface-container-lowest shadow-sm flex items-center justify-between">
            <div>
              <span className="font-label-caps text-label-caps uppercase text-secondary">Atelier en Bogotá</span>
              <span className="font-title-lg text-title-lg text-primary block">Perfect Woman T · Estudio de mirada</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">brush</span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7 flex flex-col items-start lg:pl-space-lg">
          <div className="inline-flex items-center gap-space-xs px-3 py-1 bg-surface-container text-secondary text-label-caps font-label-caps uppercase">
            <span>{specialist.eyebrow}</span>
          </div>
          <h2 className="mt-space-md font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-tight">
            {specialist.title}
          </h2>
          <p className="mt-space-md font-body-lg text-body-lg text-on-surface-variant">
            {specialist.description}
          </p>
          <div className="mt-space-lg grid grid-cols-1 sm:grid-cols-2 gap-space-md w-full">
            {specialist.highlights.map((highlight, index) => (
              <div className="p-space-md bg-surface-container-lowest shadow-sm" key={highlight.title}>
                <div className="flex items-center gap-space-xs text-primary font-title-lg text-title-lg">
                  <span className="material-symbols-outlined text-secondary text-[22px]">{highlightIcons[index % highlightIcons.length]}</span>
                  <span>{highlight.title}</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
          <blockquote className="mt-space-xl p-space-lg bg-surface-container-high shadow-sm w-full relative">
            <span className="material-symbols-outlined text-secondary/30 text-[48px] absolute top-2 right-4 pointer-events-none">format_quote</span>
            <p className="font-headline-sm text-headline-sm italic text-primary leading-snug">
              «{specialist.quote}»
            </p>
            <cite className="mt-space-sm block font-label-caps text-label-caps uppercase text-secondary not-italic font-bold tracking-widest">
              — {specialist.quoteAuthor}
            </cite>
          </blockquote>
          <div className="mt-space-xl">
            <Link className="px-6 py-3 bg-primary text-on-primary font-label-caps text-label-caps uppercase tracking-widest hover:bg-secondary transition-colors shadow-sm" to={siteConfig.bookingPath}>
              Reservar cita
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
