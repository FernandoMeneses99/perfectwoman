import { useState, type FormEvent } from 'react'
import { FaInstagram, FaWhatsapp } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import { siteConfig } from '../data/site'
import { usePageMeta } from '../lib/seo'

const steps = [
  ['01', 'Activa tu tarjeta', 'En tu visita, el equipo registra tu participación con tu autorización.'],
  ['02', 'Suma tus sellos', 'Cada cita completada puede registrar un sello según la campaña vigente.'],
  ['03', 'Disfruta tu premio', 'Cuando completes la meta de la campaña, podrás redimir tu beneficio.'],
]

export default function LoyaltyClubPage() {
  usePageMeta({
    title: `Club de fidelidad · ${siteConfig.brand}`,
    description: 'Conoce el programa de fidelidad de Perfect Woman T y consulta tu tarjeta digital.',
    path: '/club-fidelidad',
  })
  const navigate = useNavigate()
  const [token, setToken] = useState('')

  function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = token.trim()
    if (normalized) navigate(`/fidelidad/${encodeURIComponent(normalized)}`)
  }

  return (
    <PageShell>
      <div className="bg-background">
        <section className="relative overflow-hidden bg-surface px-margin py-space-3xl md:px-margin-tablet lg:px-margin-desktop">
          <div className="pointer-events-none absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-secondary-container/20 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-space-2xl lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">Privilegios y fidelidad de autor</span>
              <h1 className="mt-space-md max-w-3xl font-headline-lg text-headline-lg-mobile uppercase leading-tight tracking-tight text-primary md:text-display-hero">Club Perfect <span className="text-secondary">Woman T</span></h1>
              <p className="mt-space-lg max-w-2xl font-body-lg text-body-lg text-on-surface-variant">Una forma sencilla de reconocer tus visitas: acumula sellos en las campañas activas y consulta tu avance desde cualquier dispositivo.</p>
              <div className="mt-space-xl flex flex-wrap gap-space-md">
                <Link className="bg-primary px-6 py-4 font-label-caps text-label-caps uppercase tracking-widest text-on-primary transition-colors hover:bg-secondary" to={siteConfig.bookingPath}>Reservar una cita</Link>
                <a className="flex items-center gap-2 bg-surface-container-high px-6 py-4 font-label-caps text-label-caps uppercase tracking-widest text-primary transition-colors hover:bg-surface-variant" href={siteConfig.whatsapp} rel="noopener noreferrer" target="_blank"><FaWhatsapp aria-hidden="true" />Escribir por WhatsApp</a>
              </div>
            </div>
            <div className="bg-primary p-space-lg text-on-primary shadow-[12px_12px_0px_#ffb0cc] sm:p-space-xl">
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary-fixed">Tu tarjeta digital</span>
              <p className="mt-space-md font-headline-sm text-headline-sm text-surface-bright">Guarda el enlace que te entregamos y revisa tus sellos cuando quieras.</p>
              <form className="mt-space-xl" onSubmit={handleLookup}>
                <label className="font-label-caps text-label-caps uppercase tracking-widest text-primary-fixed-dim" htmlFor="loyalty-token">Código de tu tarjeta</label>
                <input className="mt-2 min-h-12 w-full border border-primary-fixed-dim bg-transparent px-3 font-body-md text-body-md text-surface-bright outline-none placeholder:text-outline-variant focus:border-secondary-fixed" id="loyalty-token" onChange={(event) => setToken(event.target.value)} placeholder="Pega aquí tu enlace o token" value={token} />
                <button className="mt-space-md min-h-12 w-full bg-secondary-container px-4 font-label-caps text-label-caps uppercase tracking-widest text-primary transition-colors hover:bg-secondary hover:text-on-secondary" type="submit">Consultar mis sellos</button>
              </form>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-margin py-space-3xl md:px-margin-tablet lg:px-margin-desktop" id="como-funciona">
          <div className="max-w-2xl"><span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">Cómo funciona</span><h2 className="mt-2 font-headline-lg text-headline-lg-mobile uppercase text-primary md:text-headline-lg">Un beneficio que acompaña tus visitas</h2></div>
          <div className="mt-space-2xl grid gap-space-md md:grid-cols-3">{steps.map(([number, title, text]) => <article className="border-t-2 border-secondary pt-space-md" key={number}><span className="font-label-caps text-label-caps tracking-widest text-secondary">{number}</span><h3 className="mt-space-md font-title-lg text-title-lg text-primary">{title}</h3><p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">{text}</p></article>)}</div>
        </section>

        <section className="bg-surface-container-low px-margin py-space-3xl md:px-margin-tablet lg:px-margin-desktop" id="preguntas">
          <div className="mx-auto max-w-3xl"><span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">Preguntas frecuentes</span><h2 className="mt-2 font-headline-lg text-headline-lg-mobile uppercase text-primary md:text-headline-lg">Reglas claras para disfrutarlo</h2><div className="mt-space-xl space-y-space-md">{[['¿Los sellos se transfieren?', 'La tarjeta es personal y se gestiona desde el panel del estudio.'], ['¿Qué citas cuentan?', 'Las citas completadas que cumplan las condiciones de la campaña activa.'], ['¿Perdiste tu enlace?', 'Escríbenos por WhatsApp para verificar tus datos y ayudarte a recuperarlo.']].map(([question, answer]) => <details className="border-b border-surface-container pb-space-md" key={question}><summary className="cursor-pointer font-title-lg text-title-lg text-primary">{question}</summary><p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">{answer}</p></details>)}</div></div>
        </section>

        <section className="bg-primary px-margin py-space-2xl text-center text-on-primary md:px-margin-tablet lg:px-margin-desktop"><h2 className="font-headline-lg text-headline-lg-mobile uppercase text-surface-bright md:text-headline-lg">¿Tienes dudas sobre tu tarjeta?</h2><p className="mx-auto mt-space-md max-w-xl font-body-lg text-body-lg text-primary-fixed-dim">Te atendemos por WhatsApp o Instagram.</p><div className="mt-space-lg flex justify-center gap-space-md"><a className="flex items-center gap-2 bg-secondary px-5 py-3 font-label-caps text-label-caps uppercase text-on-secondary" href={siteConfig.whatsapp} rel="noopener noreferrer" target="_blank"><FaWhatsapp aria-hidden="true" />WhatsApp</a><a className="flex items-center gap-2 border border-primary-fixed-dim px-5 py-3 font-label-caps text-label-caps uppercase text-surface-bright" href={siteConfig.instagram} rel="noopener noreferrer" target="_blank"><FaInstagram aria-hidden="true" />Instagram</a></div></section>
      </div>
    </PageShell>
  )
}
