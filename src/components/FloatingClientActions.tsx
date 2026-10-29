import { FaStamp, FaWhatsapp } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { siteConfig } from '../data/site'

const enrollmentMessage = encodeURIComponent('Hola Perfect Woman T, quiero registrarme en el Club de Fidelidad y conocer cómo activar mi tarjeta.')

export default function FloatingClientActions() {
  const whatsappUrl = `${siteConfig.whatsapp}?text=${enrollmentMessage}`

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6" aria-label="Acciones rápidas">
      <Link
        className="group flex min-h-11 items-center gap-2 rounded-full border border-surface-container bg-surface px-4 py-3 font-label-caps text-[10px] uppercase tracking-wider text-primary shadow-lg transition-colors hover:border-secondary hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2"
        to="/club-fidelidad"
      >
        <FaStamp aria-hidden="true" className="text-secondary" />
        <span>Mis sellos</span>
      </Link>
      <a
        aria-label="Escribir por WhatsApp para registrarse o pedir ayuda"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#128C7E] focus-visible:outline-offset-2"
        href={whatsappUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        <FaWhatsapp aria-hidden="true" className="text-[30px]" />
      </a>
    </div>
  )
}
