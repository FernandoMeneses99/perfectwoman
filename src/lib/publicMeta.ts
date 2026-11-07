import { siteConfig } from '../data/site'

export type PublicMeta = {
  title: string
  description: string
  path: string
  noIndex?: boolean
  image?: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
}

const defaultImageAlt = 'Ambiente del estudio Perfect Woman T en Bogotá'
const defaultImageWidth = 512
const defaultImageHeight = 279

export const publicMetaRoutes = {
  home: {
    title: 'Perfect Woman T | Pestañas, cejas y belleza en Bogotá',
    description: siteConfig.description,
    path: '/',
  },
  booking: {
    title: 'Reserva tu cita | Perfect Woman T',
    description: 'Elige tu servicio, fecha y hora. Tu cita queda pendiente y la confirmamos por WhatsApp.',
    path: '/reservas',
  },
  loyaltyClub: {
    title: `Club de fidelidad · ${siteConfig.brand}`,
    description: 'Conoce el programa de fidelidad de Perfect Woman T y consulta tu tarjeta digital.',
    path: '/club-fidelidad',
  },
  privacy: {
    title: 'Política de privacidad | Perfect Woman T',
    description: 'Política de privacidad y tratamiento de datos personales de Perfect Woman T.',
    path: '/politica-privacidad',
  },
  review: {
    title: 'Comparte tu experiencia | Perfect Woman T',
    description: 'Cuéntanos cómo fue tu experiencia en Perfect Woman T.',
    path: '/opinion',
    noIndex: true,
  },
  loyaltyCard: {
    title: `Tarjeta de fidelidad · ${siteConfig.brand}`,
    description: 'Consulta el avance de tu tarjeta de fidelidad de Perfect Woman T.',
    path: '/fidelidad',
    noIndex: true,
  },
  admin: {
    title: `Panel administrativo · ${siteConfig.brand}`,
    description: 'Panel administrativo de Perfect Woman T.',
    path: '/gestion-perfectwoman',
    noIndex: true,
  },
} satisfies Record<string, PublicMeta>

export const fallbackMeta: PublicMeta = {
  title: `Página no encontrada | ${siteConfig.brand}`,
  description: 'La página que buscas no existe o cambió de dirección.',
  path: '/',
  noIndex: true,
}

function normalizePath(pathname: string): string {
  const clean = pathname.split('?')[0].split('#')[0]
  const withLeadingSlash = clean.startsWith('/') ? clean : `/${clean}`
  return withLeadingSlash.replace(/\/+$/, '') || '/'
}

export function resolvePublicMeta(pathname: string): PublicMeta {
  const path = normalizePath(pathname)

  if (path === '/') return publicMetaRoutes.home
  if (path === '/reservas') return publicMetaRoutes.booking
  if (path === '/club-fidelidad') return publicMetaRoutes.loyaltyClub
  if (path === '/politica-privacidad') return publicMetaRoutes.privacy
  if (path === '/gestion-perfectwoman') return publicMetaRoutes.admin
  if (path === '/api/meta' || path === '/__shell.html') return fallbackMeta
  if (path === '/opinion' || path.startsWith('/opinion/')) return publicMetaRoutes.review
  if (path === '/fidelidad' || path.startsWith('/fidelidad/')) return publicMetaRoutes.loyaltyCard

  return { ...fallbackMeta, path }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function buildMetaTagBlock(meta: PublicMeta): string {
  const url = `${siteConfig.url}${meta.path === '/' ? '/' : meta.path}`
  const image = meta.image ?? siteConfig.seoImage
  const imageAlt = meta.imageAlt ?? defaultImageAlt
  const imageWidth = meta.imageWidth ?? defaultImageWidth
  const imageHeight = meta.imageHeight ?? defaultImageHeight
  const robots = meta.noIndex ? 'noindex, nofollow' : 'index, follow'
  const esc = escapeHtml

  return [
    '<!--meta:start-->',
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`,
    `<meta name="robots" content="${robots}">`,
    `<link rel="canonical" href="${esc(url)}">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:locale" content="es_CO">',
    '<meta property="og:site_name" content="Perfect Woman T">',
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.description)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${esc(image)}">`,
    `<meta property="og:image:alt" content="${esc(imageAlt)}">`,
    '<meta property="og:image:type" content="image/jpeg">',
    `<meta property="og:image:width" content="${imageWidth}">`,
    `<meta property="og:image:height" content="${imageHeight}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${esc(meta.title)}">`,
    `<meta name="twitter:description" content="${esc(meta.description)}">`,
    `<meta name="twitter:image" content="${esc(image)}">`,
    `<meta name="twitter:image:alt" content="${esc(imageAlt)}">`,
    '<!--meta:end-->',
  ].join('\n')
}
