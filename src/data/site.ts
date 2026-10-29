const whatsappHref = 'https://wa.me/573024090623'

export const siteConfig = {
  brand: 'PERFECT WOMAN T',
  descriptor: 'ESTUDIO DE MIRADA & BELLEZA · BOGOTÁ',
  url: 'https://perfectwoman.vercel.app',
  description: 'Estudio de mirada y belleza en Bogotá. Pestañas, cejas, lifting, depilación y cuidado facial con precisión visagista.',
  seoImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiyEk9eF-JhghldRMvR0Mh0sbFU24ty78Kuc3Kzaz2JGnQXcMxyZxONy1uJsr2m6RZmv0-y477EtpOLL8rg2U4KuKqZyXsiJS8FLPI55xfVF8k7767MK4BkSbLMPdkQPsrBbUHjj8BUno4YjsSK_Os0lwwF7ySk2w7ewge7hIPHjZ7UvTRG6E_vsB0umLlstn0I5nEsB4gCt2i4KdbVNPurvRUZeBSfhNpZp8fZt80',
  instagram: 'https://www.instagram.com/perfectwoman_t/',
  whatsapp: whatsappHref,
  bookingPath: '/reservas',
  privacyPath: '/politica-privacidad',
  privacyEmail: 'fernandomenesesda@gmail.com',
  privacyPhone: '+57 302 409 0623',
  location: 'Bogotá, Colombia',
  timeZone: 'America/Bogota',
  adminPath: '/gestion-perfectwoman',
}

export function serviceBookingHref(slug: string): string {
  return `${siteConfig.bookingPath}?servicio=${encodeURIComponent(slug)}`
}
