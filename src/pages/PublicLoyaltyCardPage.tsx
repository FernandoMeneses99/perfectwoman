import { useEffect, useState } from 'react'
import { FaCheck, FaGift, FaShareAlt, FaStamp } from 'react-icons/fa'
import { useParams } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import { siteConfig } from '../data/site'
import { fetchPublicLoyaltyCard } from '../lib/loyalty'
import type { PublicLoyaltyCard } from '../lib/loyalty'
import { usePageMeta } from '../lib/seo'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default function PublicLoyaltyCardPage() {
  const { token = '' } = useParams()
  const [result, setResult] = useState<{
    token: string
    loading: boolean
    card: PublicLoyaltyCard | null
    error: string | null
  }>({ token: '', loading: true, card: null, error: null })
  const [shareMessage, setShareMessage] = useState<string | null>(null)
  const current = result.token === token ? result : { token, loading: true, card: null, error: null }
  const publicCard = current.card

  usePageMeta({
    title: `Tarjeta de fidelidad · ${siteConfig.brand}`,
    description: 'Consulta el avance de tu tarjeta de fidelidad de Perfect Woman T.',
    path: `/fidelidad/${token}`,
    noIndex: true,
  })

  useEffect(() => {
    let active = true

    if (!uuidPattern.test(token)) {
      const timeout = window.setTimeout(() => {
        if (active) setResult({ token, loading: false, card: null, error: null })
      }, 0)
      return () => {
        active = false
        window.clearTimeout(timeout)
      }
    }

    fetchPublicLoyaltyCard(token)
      .then((result) => {
        if (active) setResult({ token, loading: false, card: result, error: null })
      })
      .catch(() => {
        if (active) setResult({ token, loading: false, card: null, error: 'No pudimos cargar la tarjeta. Revisa tu conexión e inténtalo de nuevo.' })
      })

    return () => {
      active = false
    }
  }, [token])

  async function shareCard() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: `Tarjeta de fidelidad · ${siteConfig.brand}`, url })
      } else {
        await navigator.clipboard.writeText(url)
        setShareMessage('Enlace copiado.')
      }
    } catch (shareError) {
      if (shareError instanceof Error && shareError.name === 'AbortError') return
      setShareMessage('No pudimos compartir el enlace desde este dispositivo.')
    }
  }

  return (
    <PageShell>
      <main className="mx-auto flex min-h-[72vh] w-full max-w-3xl flex-col justify-center px-margin py-space-xl md:px-margin-tablet lg:px-margin-desktop" aria-labelledby="card-page-title">
        <div className="mb-space-md text-center">
          <span className="font-label-caps text-[10px] uppercase tracking-widest text-secondary">Perfect Woman T</span>
          <h1 id="card-page-title" className="mt-space-sm font-headline-lg text-headline-lg-mobile uppercase leading-tight text-primary md:text-headline-lg">Tarjeta de fidelidad</h1>
        </div>

        {current.loading && <p className="border border-surface-container bg-surface-container-lowest p-space-lg text-center font-body-md text-body-md text-on-surface-variant" role="status">Cargando tarjeta…</p>}

        {!current.loading && current.error && (
          <div className="border border-error/30 bg-error-container p-space-lg text-center">
            <p className="font-body-md text-body-md text-on-error-container">{current.error}</p>
            <button className="mt-space-md min-h-11 bg-primary px-4 py-2 font-label-caps text-label-caps uppercase text-on-primary" onClick={() => window.location.reload()} type="button">Volver a intentar</button>
          </div>
        )}

        {!current.loading && !current.error && publicCard && (
          <article className="border border-surface-container bg-surface-container-lowest p-space-md sm:p-space-xl">
            <div className="border-b border-surface-container pb-space-md">
              <p className="font-body-sm text-body-sm text-on-surface-variant">Hola, {publicCard.client_first_name}</p>
              <h2 className="mt-1 break-words font-title-lg text-title-lg uppercase text-primary">{publicCard.campaign_name}</h2>
              <p className="mt-1 break-words font-body-md text-body-md text-on-surface-variant">Premio: {publicCard.reward_description}</p>
            </div>

            <div className="mt-space-lg" aria-label={`${publicCard.stamps} de ${publicCard.stamp_goal} sellos`}>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {Array.from({ length: publicCard.stamp_goal }, (_, index) => (
                  <span key={index} aria-hidden="true" className={`flex h-11 w-11 items-center justify-center border sm:h-12 sm:w-12 ${index < publicCard.stamps ? 'border-secondary bg-secondary text-on-secondary' : 'border-outline-variant text-on-surface-variant'}`}>
                    {index < publicCard.stamps ? <FaCheck aria-hidden="true" /> : <FaStamp aria-hidden="true" />}
                  </span>
                ))}
              </div>
              <p className="mt-space-md font-title-md text-title-md text-primary">{publicCard.stamps} de {publicCard.stamp_goal} sellos</p>
              {publicCard.stamps >= publicCard.stamp_goal ? (
                <p className="mt-space-sm flex items-center gap-2 border-l-2 border-secondary bg-surface-container-low px-3 py-3 font-body-md text-body-md text-primary" role="status">
                  <FaGift aria-hidden="true" className="shrink-0 text-secondary" />
                  Tu recompensa está lista. Muéstrale esta tarjeta al equipo.
                </p>
              ) : (
                <p className="mt-space-sm font-body-sm text-body-sm text-on-surface-variant">Cada cita completada suma un sello. Al completar la tarjeta podrás recibir tu recompensa.</p>
              )}
              {publicCard.rewards_redeemed > 0 && <p className="mt-space-sm font-body-sm text-body-sm text-on-surface-variant">Recompensas recibidas: {publicCard.rewards_redeemed}</p>}
            </div>

            <div className="mt-space-lg border-t border-surface-container pt-space-md">
              <button className="flex min-h-11 w-full items-center justify-center gap-2 bg-primary px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary" onClick={() => void shareCard()} type="button">
                <FaShareAlt aria-hidden="true" /> Compartir tarjeta
              </button>
              {shareMessage && <p className="mt-space-sm text-center font-body-sm text-body-sm text-on-surface-variant" role="status">{shareMessage}</p>}
              <p className="mt-space-sm text-center font-body-sm text-body-sm text-on-surface-variant">Guarda este enlace para volver a consultar tus sellos.</p>
            </div>
          </article>
        )}

        {!current.loading && !current.error && !publicCard && (
          <div className="border border-surface-container bg-surface-container-lowest p-space-lg text-center">
            <h2 className="font-title-lg text-title-lg uppercase text-primary">Tarjeta no disponible</h2>
            <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">El enlace no es válido o la tarjeta fue revocada. Si necesitas ayuda, contacta al estudio.</p>
            <a className="mt-space-md inline-flex min-h-11 items-center justify-center bg-primary px-5 py-2.5 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary" href={siteConfig.whatsapp} rel="noopener noreferrer" target="_blank">Escribir por WhatsApp</a>
          </div>
        )}
      </main>
    </PageShell>
  )
}
