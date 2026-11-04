import { siteConfig } from '../data/site'
import { supabase } from './supabase'

export type SiteMetric = {
  value: string
  label: string
}

export type SiteHighlight = {
  title: string
  description: string
}

export type SiteContent = {
  brand: {
    name: string
    descriptor: string
    description: string
    location: string
  }
  hero: {
    eyebrow: string
    title: string
    titleAccent: string
    description: string
    primaryCta: string
    secondaryCta: string
    image: string
    imageAlt: string
    badge: string
    cardTitle: string
    year: string
  }
  metrics: SiteMetric[]
  services: {
    eyebrow: string
    title: string
    description: string
  }
  specialist: {
    eyebrow: string
    title: string
    description: string
    name: string
    role: string
    image: string
    imageAlt: string
    quote: string
    quoteAuthor: string
    highlights: SiteHighlight[]
  }
  gallery: {
    eyebrow: string
    title: string
    description: string
  }
  testimonials: {
    eyebrow: string
    title: string
    description: string
    emptyText: string
  }
  bookingCta: {
    eyebrow: string
    title: string
    description: string
    primaryCta: string
    secondaryCta: string
    note: string
  }
  footer: {
    tagline: string
    description: string
    services: string[]
    note: string
  }
  seo: {
    title: string
    description: string
    image: string
  }
}

export type GalleryItem = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  badge: string | null
  image_url: string
  image_alt: string
  sort_order: number
}

export const fallbackSiteContent: SiteContent = {
  brand: {
    name: siteConfig.brand,
    descriptor: siteConfig.descriptor,
    description: siteConfig.description,
    location: siteConfig.location,
  },
  hero: {
    eyebrow: 'Más de 5 años de experiencia · Bogotá, Colombia',
    title: 'Tu mirada,',
    titleAccent: 'tu esencia',
    description:
      'Realza tu belleza con servicios profesionales de pestañas y cejas. Arquitectura visagista de alta precisión y bienestar estético en el corazón de Bogotá.',
    primaryCta: 'Reservar cita',
    secondaryCta: 'Explorar Servicios',
    image: siteConfig.heroImage,
    imageAlt: 'Ambiente del estudio Perfect Woman T en Bogotá',
    badge: 'Atelier Bogotá',
    cardTitle: 'Estudio de mirada',
    year: '2026',
  },
  metrics: [
    { value: '+5', label: 'Años de experiencia' },
    { value: 'Bogotá', label: 'Colombia' },
  ],
  services: {
    eyebrow: 'Portafolio Esencial',
    title: 'Especialidades del Estudio',
    description:
      'Tratamientos diseñados para armonizar y potenciar la expresión natural de tu rostro con proporciones arquitectónicas.',
  },
  specialist: {
    eyebrow: 'Filosofía Visagista',
    title: 'Conoce a tu Especialista',
    description:
      'Más de cinco años de experiencia en servicios de pestañas y cejas en Bogotá. Cada persona puede consultar las opciones disponibles según su estilo.',
    name: 'Tathiana',
    role: 'Fundadora & Master Artist',
    image: siteConfig.specialistImage,
    imageAlt: 'Ambiente del estudio Perfect Woman T',
    quote:
      'Cada mirada tiene su propia arquitectura; mi misión es resaltar tu belleza única sin perder tu esencia natural.',
    quoteAuthor: 'Master Artist Tathiana · Bogotá',
    highlights: [
      {
        title: 'Información del servicio',
        description:
          'Consulta por Instagram los materiales y protocolos vigentes del servicio.',
      },
      {
        title: 'Servicios del estudio',
        description: 'Pestañas, cejas, depilación, lifting y cuidado de la piel.',
      },
    ],
  },
  gallery: {
    eyebrow: 'Portafolio Fotográfico',
    title: 'Galería Editorial de Resultados',
    description:
      'Miradas reales transformadas con precisión artesanal en nuestro atelier de Bogotá.',
  },
  testimonials: {
    eyebrow: 'Opiniones',
    title: 'Experiencias de clientas',
    description: 'Las opiniones se comparten con autorización de sus autoras.',
    emptyText: 'Espacio reservado para opiniones autorizadas',
  },
  bookingCta: {
    eyebrow: 'Reservas en línea · Bogotá, Colombia',
    title: 'Reserva tu próxima cita',
    description:
      'Elige tu servicio, fecha y hora en pocos pasos. Confirmamos tu cita por WhatsApp.',
    primaryCta: 'Reservar cita',
    secondaryCta: 'Ver servicios',
    note: 'Tu cita queda pendiente hasta que la confirmemos por WhatsApp. También puedes escribirnos si prefieres agendar por chat.',
  },
  footer: {
    tagline: 'Estudio de mirada y belleza',
    description:
      'Servicios de pestañas, cejas, depilación, lifting y cuidado de la piel en Bogotá.',
    services: ['Pestañas', 'Cejas', 'Depilación', 'Lifting', 'Cuidado de la piel'],
    note: 'Precios y duraciones vigentes al momento de la reserva. Consulta cualquier cambio por WhatsApp o Instagram.',
  },
  seo: {
    title: 'Perfect Woman T | Pestañas, cejas y belleza en Bogotá',
    description: siteConfig.description,
    image: siteConfig.seoImage,
  },
}

export const fallbackGallery: GalleryItem[] = [
  {
    id: 'pestanas-clasicas-1-1',
    slug: 'pestanas-clasicas-1-1',
    title: 'Pestañas Clásicas 1:1',
    subtitle: 'Efecto Seda',
    badge: 'Curva D / 0.15',
    image_url: '/images/pestañas-clasicas.jpg',
    image_alt: 'Pestañas clásicas aplicadas pelo a pelo',
    sort_order: 1,
  },
  {
    id: 'cejas-efecto-sombra',
    slug: 'cejas-efecto-sombra',
    title: 'Cejas Efecto Sombra',
    subtitle: 'Henna Orgánica',
    badge: 'Visagismo',
    image_url: '/images/efecto-sombra.jpg',
    image_alt: 'Cejas diseñadas con efecto sombra',
    sort_order: 2,
  },
  {
    id: 'lifting-natural',
    slug: 'lifting-natural',
    title: 'Lifting Natural',
    subtitle: 'Queratina Pura',
    badge: 'Verificado',
    image_url: '/images/lifting-natura.jpg',
    image_alt: 'Lash lifting natural con nutrición de queratina',
    sort_order: 3,
  },
  {
    id: 'volumen-glam-ruso',
    slug: 'volumen-glam-ruso',
    title: 'Volumen Glam Ruso',
    subtitle: 'Densidad 4D',
    badge: 'Favorito',
    image_url: '/images/glow-ruso.jpg',
    image_alt: 'Volumen ruso de densidad 4D',
    sort_order: 4,
  },
  {
    id: 'ambiente-del-salon',
    slug: 'ambiente-del-salon',
    title: 'Ambiente del Salón',
    subtitle: 'Espacio Privado',
    badge: 'Atelier',
    image_url: '/images/salon.jpg',
    image_alt: 'Ambiente privado del salón Perfect Woman T',
    sort_order: 5,
  },
]

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function mergeSection<T extends Record<string, unknown>>(
  fallback: T,
  value: unknown,
): T {
  return { ...fallback, ...asRecord(value) } as T
}

export function normalizeSiteContent(value: unknown): SiteContent {
  const raw = asRecord(value)

  const metrics = Array.isArray(raw.metrics)
    ? raw.metrics
        .map((item) => asRecord(item))
        .filter(
          (item) =>
            typeof item.value === 'string' && typeof item.label === 'string',
        )
        .map((item) => ({
          value: item.value as string,
          label: item.label as string,
        }))
    : fallbackSiteContent.metrics

  const specialist = mergeSection(
    fallbackSiteContent.specialist,
    raw.specialist,
  )
  const specialistHighlights = Array.isArray(specialist.highlights)
    ? specialist.highlights
        .map((item) => asRecord(item))
        .filter(
          (item) =>
            typeof item.title === 'string' &&
            typeof item.description === 'string',
        )
        .map((item) => ({
          title: item.title as string,
          description: item.description as string,
        }))
    : fallbackSiteContent.specialist.highlights

  const footer = mergeSection(fallbackSiteContent.footer, raw.footer)
  const footerServices = Array.isArray(footer.services)
    ? footer.services.filter((item): item is string => typeof item === 'string')
    : fallbackSiteContent.footer.services

  return {
    ...raw,
    brand: mergeSection(fallbackSiteContent.brand, raw.brand) as SiteContent['brand'],
    hero: mergeSection(fallbackSiteContent.hero, raw.hero) as SiteContent['hero'],
    metrics: metrics.length > 0 ? metrics : fallbackSiteContent.metrics,
    services: mergeSection(
      fallbackSiteContent.services,
      raw.services,
    ) as SiteContent['services'],
    specialist: {
      ...(specialist as SiteContent['specialist']),
      highlights:
        specialistHighlights.length > 0
          ? specialistHighlights
          : fallbackSiteContent.specialist.highlights,
    },
    gallery: mergeSection(
      fallbackSiteContent.gallery,
      raw.gallery,
    ) as SiteContent['gallery'],
    testimonials: mergeSection(
      fallbackSiteContent.testimonials,
      raw.testimonials,
    ) as SiteContent['testimonials'],
    bookingCta: mergeSection(
      fallbackSiteContent.bookingCta,
      raw.bookingCta,
    ) as SiteContent['bookingCta'],
    footer: {
      ...(footer as SiteContent['footer']),
      services:
        footerServices.length > 0
          ? footerServices
          : fallbackSiteContent.footer.services,
    },
    seo: mergeSection(fallbackSiteContent.seo, raw.seo) as SiteContent['seo'],
  } as SiteContent
}

export async function fetchPublicSiteContent(): Promise<SiteContent> {
  const { data, error } = await supabase.rpc('get_public_site_content')

  if (error) {
    throw new Error(error.message)
  }

  const row = (data ?? [])[0] as { content?: unknown } | undefined
  return normalizeSiteContent(row?.content)
}

export async function fetchPublicGallery(): Promise<GalleryItem[]> {
  const { data, error } = await supabase.rpc('get_public_gallery')

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as GalleryItem[]
  return rows.length > 0 ? rows : fallbackGallery
}
