import { FaWhatsapp } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import { siteConfig } from '../data/site'
import { usePageMeta } from '../lib/seo'

export default function NotFoundPage() {
  usePageMeta({
    title: `Página no encontrada | ${siteConfig.brand}`,
    description: 'La página que buscas no existe o cambió de dirección.',
    path: '/404',
    noIndex: true,
  })

  return (
    <PageShell>
      <section className="mx-auto flex w-full max-w-3xl flex-col items-start px-margin py-space-2xl md:px-margin-tablet lg:px-margin-desktop">
        <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">Error 404</span>
        <h1 className="mt-space-sm font-headline-lg text-headline-lg-mobile uppercase leading-tight text-primary md:text-headline-lg">
          Esta página no existe
        </h1>
        <p className="mt-space-md max-w-xl font-body-md text-body-md text-on-surface-variant">
          Puede que el enlace haya cambiado o que la dirección esté mal escrita. Vuelve al inicio o reserva tu cita desde aquí.
        </p>
        <div className="mt-space-lg flex flex-wrap gap-space-sm">
          <Link
            className="bg-primary px-5 py-3 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary"
            to="/"
          >
            Ir al inicio
          </Link>
          <Link
            className="border border-surface-container px-5 py-3 font-label-caps text-label-caps uppercase text-primary transition-colors hover:border-secondary"
            to={siteConfig.bookingPath}
          >
            Reservar cita
          </Link>
          <a
            className="flex items-center gap-2 border border-surface-container px-5 py-3 font-label-caps text-label-caps uppercase text-primary transition-colors hover:border-secondary"
            href={siteConfig.whatsapp}
            rel="noopener noreferrer"
            target="_blank"
          >
            <FaWhatsapp aria-hidden="true" />
            WhatsApp
          </a>
        </div>
      </section>
    </PageShell>
  )
}
