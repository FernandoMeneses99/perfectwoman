import { siteConfig } from '../data/site'
import { dateInTimeZone, formatDateLong, formatTime } from './dates'
import type { AdminAppointment } from './admin'

const COLOMBIA_COUNTRY_CODE = '57'

export function normalizeWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  if (!digits) {
    return ''
  }

  return digits.startsWith(COLOMBIA_COUNTRY_CODE)
    ? digits
    : `${COLOMBIA_COUNTRY_CODE}${digits}`
}

export function whatsappUrl(phone: string, message?: string): string {
  const normalized = normalizeWhatsAppPhone(phone)

  if (!normalized) {
    return ''
  }

  const base = `https://wa.me/${normalized}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export function buildAppointmentReminderMessage(appointment: AdminAppointment): string {
  const name = appointment.client?.full_name?.trim()
  const greeting = name ? `Hola ${name}` : 'Hola'
  const date = dateInTimeZone(appointment.starts_at, siteConfig.timeZone)

  return [
    `${greeting}, te escribimos de ${siteConfig.brand} para recordarte tu cita.`,
    '',
    `Servicio: ${appointment.service?.name ?? 'por confirmar'}`,
    `Fecha: ${formatDateLong(date, siteConfig.timeZone)}`,
    `Hora: ${formatTime(appointment.starts_at, siteConfig.timeZone)}`,
    `Especialista: ${appointment.professional?.full_name ?? 'por confirmar'}`,
    `Código de confirmación: ${appointment.confirmation_code}`,
    '',
    'Si necesitas reprogramar o cancelar, respóndenos por este medio. ¡Te esperamos!',
  ].join('\n')
}
