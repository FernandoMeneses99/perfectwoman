const whatsappHref = 'https://wa.me/573024090623'

export const siteConfig = {
  brand: 'PERFECT WOMAN T',
  descriptor: 'ESTUDIO DE MIRADA & BELLEZA · BOGOTÁ',
  instagram: 'https://www.instagram.com/perfectwoman_t/',
  whatsapp: whatsappHref,
  bookingPath: '/reservas',
  privacyPath: '/politica-privacidad',
  privacyEmail: 'fernandomenesesda@gmail.com',
  privacyPhone: '+57 302 409 0623',
  location: 'Bogotá, Colombia',
}

export function serviceBookingHref(slug: string): string {
  return `${siteConfig.bookingPath}?servicio=${encodeURIComponent(slug)}`
}
