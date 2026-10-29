import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { FaBan, FaCheck, FaGift, FaLink, FaPen, FaPlus, FaStamp } from 'react-icons/fa'
import { siteConfig } from '../../data/site'
import { todayInTimeZone } from '../../lib/dates'
import {
  addLoyaltyStamp,
  createLoyaltyCampaign,
  fetchCompletedAppointments,
  fetchLoyaltyOverview,
  issueLoyaltyCard,
  loyaltyCardUrl,
  mapLoyaltyError,
  redeemLoyaltyReward,
  revokeLoyaltyCard,
  setLoyaltyCampaignActive,
  updateLoyaltyCampaign,
} from '../../lib/loyalty'
import type {
  LoyaltyAppointment,
  LoyaltyCard,
  LoyaltyCampaign,
  LoyaltyOverview,
} from '../../lib/loyalty'

const emptyOverview: LoyaltyOverview = { campaigns: [], clients: [], cards: [], transactions: [] }

function dateLabel(value: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: siteConfig.timeZone,
  }).format(new Date(value))
}

export default function AdminLoyaltyManager() {
  const [overview, setOverview] = useState(emptyOverview)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showCampaignForm, setShowCampaignForm] = useState(false)
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null)
  const [campaignName, setCampaignName] = useState('')
  const [rewardDescription, setRewardDescription] = useState('')
  const [stampGoal, setStampGoal] = useState(8)
  const [startsOn, setStartsOn] = useState('')
  const [endsOn, setEndsOn] = useState('')
  const [clientQuery, setClientQuery] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [consentConfirmed, setConsentConfirmed] = useState(false)
  const [cardQuery, setCardQuery] = useState('')
  const [appointmentChoices, setAppointmentChoices] = useState<Record<string, LoyaltyAppointment[]>>({})
  const [selectedAppointments, setSelectedAppointments] = useState<Record<string, string>>({})
  const [loadingAppointments, setLoadingAppointments] = useState<string | null>(null)
  const [copyMessage, setCopyMessage] = useState<string | null>(null)

  const loadOverview = useCallback(async () => {
    try {
      setOverview(await fetchLoyaltyOverview())
      setLoadError(null)
    } catch (error) {
      setLoadError(mapLoyaltyError(error))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetchLoyaltyOverview()
      .then((data) => {
        if (active) {
          setOverview(data)
          setLoadError(null)
        }
      })
      .catch((error: unknown) => {
        if (active) setLoadError(mapLoyaltyError(error))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const campaignById = useMemo(
    () => new Map(overview.campaigns.map((campaign) => [campaign.id, campaign])),
    [overview.campaigns],
  )
  const clientById = useMemo(
    () => new Map(overview.clients.map((client) => [client.id, client])),
    [overview.clients],
  )
  const usedAppointmentIds = useMemo(
    () => new Set(overview.transactions.map((transaction) => transaction.appointment_id).filter(Boolean)),
    [overview.transactions],
  )
  const today = todayInTimeZone(siteConfig.timeZone)
  const availableCampaigns = overview.campaigns.filter((campaign) =>
    campaign.active && (!campaign.starts_on || campaign.starts_on <= today) && (!campaign.ends_on || campaign.ends_on >= today),
  )
  const availableClients = overview.clients.filter((client) =>
    `${client.full_name} ${client.phone}`.toLowerCase().includes(clientQuery.trim().toLowerCase()),
  )
  const visibleCards = overview.cards.filter((card) => {
    const client = clientById.get(card.client_id)
    const campaign = campaignById.get(card.campaign_id)
    return `${client?.full_name ?? ''} ${client?.phone ?? ''} ${campaign?.name ?? ''}`
      .toLowerCase()
      .includes(cardQuery.trim().toLowerCase())
  })
  const activeCards = overview.cards.filter((card) => card.status === 'active')
  const readyRewards = activeCards.filter((card) => card.stamps >= (campaignById.get(card.campaign_id)?.stamp_goal ?? Infinity)).length
  const redeemedCount = overview.transactions.filter((transaction) => transaction.event_type === 'redeemed').length

  function beginCampaignEdit(campaign: LoyaltyCampaign) {
    setEditingCampaignId(campaign.id)
    setCampaignName(campaign.name)
    setRewardDescription(campaign.reward_description)
    setStampGoal(campaign.stamp_goal)
    setStartsOn(campaign.starts_on ?? '')
    setEndsOn(campaign.ends_on ?? '')
    setShowCampaignForm(true)
    setActionError(null)
    setMessage(null)
  }

  function resetCampaignForm() {
    setEditingCampaignId(null)
    setCampaignName('')
    setRewardDescription('')
    setStampGoal(8)
    setStartsOn('')
    setEndsOn('')
    setShowCampaignForm(false)
  }

  async function handleSaveCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (startsOn && endsOn && endsOn < startsOn) {
      setActionError('La fecha de finalización debe ser igual o posterior a la fecha de inicio.')
      return
    }
    setSaving(true)
    setActionError(null)
    setMessage(null)
    try {
      const campaignValues = {
        name: campaignName,
        rewardDescription,
        stampGoal,
        startsOn: startsOn || null,
        endsOn: endsOn || null,
      }
      if (editingCampaignId) {
        await updateLoyaltyCampaign(editingCampaignId, campaignValues)
      } else {
        await createLoyaltyCampaign(campaignValues)
      }
      setMessage(editingCampaignId ? 'Campaña actualizada.' : 'Campaña creada.')
      resetCampaignForm()
      await loadOverview()
    } catch (error) {
      setActionError(mapLoyaltyError(error))
    } finally {
      setSaving(false)
    }
  }

  async function handleIssueCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedClientId || !selectedCampaignId || !consentConfirmed) return
    setSaving(true)
    setActionError(null)
    setMessage(null)
    try {
      const { token } = await issueLoyaltyCard(selectedClientId, selectedCampaignId)
      const link = loyaltyCardUrl(token)
      setMessage(`Tarjeta creada. Enlace para la clienta: ${link}`)
      setClientQuery('')
      setSelectedClientId('')
      setConsentConfirmed(false)
      await loadOverview()
    } catch (error) {
      setActionError(mapLoyaltyError(error))
    } finally {
      setSaving(false)
    }
  }

  async function handleCampaignStatus(campaign: LoyaltyCampaign) {
    setSaving(true)
    setActionError(null)
    setMessage(null)
    try {
      await setLoyaltyCampaignActive(campaign.id, !campaign.active)
      setMessage(campaign.active ? 'Campaña pausada.' : 'Campaña activada.')
      await loadOverview()
    } catch (error) {
      setActionError(mapLoyaltyError(error))
    } finally {
      setSaving(false)
    }
  }

  async function showCompletedAppointments(card: LoyaltyCard) {
    setLoadingAppointments(card.id)
    setActionError(null)
    setMessage(null)
    try {
      const completed = await fetchCompletedAppointments(card.client_id)
      const unused = completed.filter((appointment) => !usedAppointmentIds.has(appointment.id))
      setAppointmentChoices((current) => ({ ...current, [card.id]: unused }))
      setSelectedAppointments((current) => ({ ...current, [card.id]: unused[0]?.id ?? '' }))
      if (unused.length === 0) setMessage('No hay citas completadas sin sello para esta clienta.')
    } catch (error) {
      setActionError(mapLoyaltyError(error))
    } finally {
      setLoadingAppointments(null)
    }
  }

  async function handleAddStamp(card: LoyaltyCard) {
    const appointmentId = selectedAppointments[card.id]
    if (!appointmentId) return
    setSaving(true)
    setActionError(null)
    setMessage(null)
    try {
      await addLoyaltyStamp(card.id, appointmentId)
      setMessage('Sello registrado para la cita completada.')
      setAppointmentChoices((current) => ({ ...current, [card.id]: [] }))
      await loadOverview()
    } catch (error) {
      setActionError(mapLoyaltyError(error))
      await loadOverview()
    } finally {
      setSaving(false)
    }
  }

  async function handleRedeem(card: LoyaltyCard, campaign: LoyaltyCampaign) {
    if (!window.confirm(`Confirma que entregaste a la clienta: ${campaign.reward_description}`)) return
    setSaving(true)
    setActionError(null)
    setMessage(null)
    try {
      await redeemLoyaltyReward(card.id)
      setMessage('Canje registrado. La tarjeta inicia un nuevo ciclo de sellos.')
      await loadOverview()
    } catch (error) {
      setActionError(mapLoyaltyError(error))
    } finally {
      setSaving(false)
    }
  }

  async function handleRevoke(card: LoyaltyCard) {
    if (!window.confirm('¿Revocar esta tarjeta? La clienta dejará de verla y no podrá acumular ni canjear sellos.')) return
    setSaving(true)
    setActionError(null)
    setMessage(null)
    try {
      await revokeLoyaltyCard(card.id)
      setMessage('Tarjeta revocada.')
      await loadOverview()
    } catch (error) {
      setActionError(mapLoyaltyError(error))
    } finally {
      setSaving(false)
    }
  }

  async function handleShare(token: string, clientName: string) {
    const url = loyaltyCardUrl(token)
    try {
      if (navigator.share) {
        await navigator.share({ title: `Tarjeta de fidelidad · ${siteConfig.brand}`, text: `Tarjeta de ${clientName}`, url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopyMessage(`Enlace copiado para ${clientName}.`)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      setActionError('No pudimos compartir el enlace. Copia la dirección desde la vista de la tarjeta.')
    }
  }

  return (
    <section className="py-space-lg md:py-space-xl" aria-labelledby="loyalty-heading">
      <div className="flex flex-col gap-space-md sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-label-caps text-[10px] uppercase tracking-widest text-secondary">Visitas que cuentan</span>
          <h1 id="loyalty-heading" className="mt-space-sm font-headline-lg text-headline-lg-mobile uppercase leading-tight text-primary md:text-headline-lg">
            Fidelización
          </h1>
          <p className="mt-space-sm max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Administra campañas, registra visitas completadas y entrega recompensas desde la tarjeta de cada clienta.
          </p>
        </div>
        <button
          className="flex min-h-11 w-fit items-center justify-center gap-2 bg-primary px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          disabled={saving}
          onClick={() => {
            if (editingCampaignId || showCampaignForm) resetCampaignForm()
            else setShowCampaignForm(true)
          }}
          type="button"
        >
          <FaPlus aria-hidden="true" />
          {editingCampaignId ? 'Cancelar edición' : showCampaignForm ? 'Cerrar formulario' : 'Nueva campaña'}
        </button>
      </div>

      <div className="mt-space-lg grid grid-cols-1 gap-space-sm sm:grid-cols-3">
        <Metric label="Tarjetas activas" value={activeCards.length} />
        <Metric label="Recompensas listas" value={readyRewards} />
        <Metric label="Canjes registrados" value={redeemedCount} />
      </div>

      {message && <p className="mt-space-md break-words border-l-2 border-emerald-600 bg-emerald-50 px-3 py-3 font-body-sm text-body-sm text-emerald-950" role="status">{message}</p>}
      {actionError && <p className="mt-space-md border-l-2 border-error bg-error-container px-3 py-3 font-body-sm text-body-sm text-on-error-container" role="alert">{actionError}</p>}
      {copyMessage && <p className="mt-space-sm font-body-sm text-body-sm text-on-surface-variant" role="status">{copyMessage}</p>}

      {showCampaignForm && (
        <form className="mt-space-lg border border-surface-container bg-surface-container-lowest p-space-md sm:p-space-lg" onSubmit={(event) => void handleSaveCampaign(event)}>
          <h2 className="font-title-lg text-title-lg uppercase text-primary">{editingCampaignId ? 'Editar campaña' : 'Crear campaña'}</h2>
          {editingCampaignId && <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">Los cambios de premio, sellos y vigencia también se aplican a las tarjetas de esta campaña.</p>}
          <div className="mt-space-md grid grid-cols-1 gap-space-md md:grid-cols-2">
            <Field label="Nombre de la campaña">
              <input className={inputClass} maxLength={80} minLength={2} onChange={(event) => setCampaignName(event.target.value)} required value={campaignName} />
            </Field>
            <Field label="Sellos para obtener el premio">
              <input className={inputClass} max={50} min={2} onChange={(event) => setStampGoal(Number(event.target.value))} required type="number" value={stampGoal} />
            </Field>
            <Field className="md:col-span-2" label="Recompensa que recibirá la clienta">
              <textarea className={`${inputClass} min-h-20 resize-y`} maxLength={240} minLength={2} onChange={(event) => setRewardDescription(event.target.value)} required value={rewardDescription} />
            </Field>
            <Field label="Inicio (opcional)">
              <input className={inputClass} onChange={(event) => setStartsOn(event.target.value)} type="date" value={startsOn} />
            </Field>
            <Field label="Fin (opcional)">
              <input className={inputClass} min={startsOn || undefined} onChange={(event) => setEndsOn(event.target.value)} type="date" value={endsOn} />
            </Field>
          </div>
          <p className="mt-space-sm font-body-sm text-body-sm text-on-surface-variant">La clienta podrá acumular un sello por cada cita completada. Cada cita solo puede dar un sello.</p>
          <button className="mt-space-md min-h-11 bg-secondary px-5 py-2.5 font-label-caps text-label-caps uppercase text-on-secondary transition-colors hover:bg-tertiary-container disabled:opacity-50" disabled={saving} type="submit">
            {saving ? 'Guardando…' : editingCampaignId ? 'Guardar cambios' : 'Guardar campaña'}
          </button>
        </form>
      )}

      <div className="mt-space-xl border-y border-surface-container py-space-lg">
        <h2 className="font-title-lg text-title-lg uppercase text-primary">Campañas</h2>
        {overview.campaigns.length === 0 && !loading ? (
          <p className="mt-space-md border border-surface-container bg-surface-container-lowest p-space-md font-body-md text-body-md text-on-surface-variant">Aún no hay campañas. Crea una para emitir las primeras tarjetas.</p>
        ) : (
          <div className="mt-space-md grid grid-cols-1 gap-space-sm lg:grid-cols-2">
            {overview.campaigns.map((campaign) => (
              <article key={campaign.id} className="flex flex-col gap-space-sm border border-surface-container bg-surface-container-lowest p-space-md sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="font-title-md text-title-md text-primary">{campaign.name}</h3>
                    <span className="font-label-caps text-[10px] uppercase text-on-surface-variant">{campaign.active ? 'Activa' : 'Pausada'}</span>
                  </div>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{campaign.stamp_goal} sellos · {campaign.reward_description}</p>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{campaignCardsCount(overview.cards, campaign.id)} tarjetas emitidas</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button className="flex min-h-11 items-center gap-2 border border-surface-container px-3 py-2 font-label-caps text-[10px] uppercase text-primary transition-colors hover:border-secondary disabled:opacity-50" disabled={saving} onClick={() => beginCampaignEdit(campaign)} type="button">
                    <FaPen aria-hidden="true" /> Editar
                  </button>
                  <button className="min-h-11 border border-surface-container px-3 py-2 font-label-caps text-[10px] uppercase text-primary transition-colors hover:border-secondary disabled:opacity-50" disabled={saving} onClick={() => void handleCampaignStatus(campaign)} type="button">
                    {campaign.active ? 'Pausar' : 'Activar'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="mt-space-xl">
        <h2 className="font-title-lg text-title-lg uppercase text-primary">Emitir tarjeta</h2>
        <form className="mt-space-md grid grid-cols-1 gap-space-md border border-surface-container bg-surface-container-lowest p-space-md sm:p-space-lg lg:grid-cols-[1.1fr_1fr_auto] lg:items-end" onSubmit={(event) => void handleIssueCard(event)}>
          <Field label="Busca una clienta por nombre o teléfono">
            <input autoComplete="off" className={inputClass} onChange={(event) => { setClientQuery(event.target.value); setSelectedClientId('') }} placeholder="Nombre o teléfono" value={clientQuery} />
            <select aria-label="Clienta" className={`${inputClass} mt-2`} onChange={(event) => setSelectedClientId(event.target.value)} required value={selectedClientId}>
              <option value="">Selecciona una clienta</option>
              {availableClients.slice(0, 50).map((client) => <option key={client.id} value={client.id}>{client.full_name} · {client.phone}</option>)}
            </select>
          </Field>
          <Field label="Campaña">
            <select className={inputClass} onChange={(event) => setSelectedCampaignId(event.target.value)} required value={selectedCampaignId}>
              <option value="">Selecciona una campaña</option>
              {availableCampaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name} · {campaign.stamp_goal} sellos</option>)}
            </select>
          </Field>
          <div className="lg:col-span-3">
            <label className="flex min-h-11 items-start gap-3 font-body-sm text-body-sm text-primary">
              <input checked={consentConfirmed} className="mt-1 h-4 w-4 accent-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary" onChange={(event) => setConsentConfirmed(event.target.checked)} type="checkbox" />
              <span>La clienta fue informada sobre el uso de sus datos y aceptó participar en este programa de sellos.</span>
            </label>
            <button className="mt-space-sm min-h-11 bg-primary px-5 py-2.5 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50" disabled={saving || !selectedClientId || !selectedCampaignId || !consentConfirmed} type="submit">
              {saving ? 'Creando…' : 'Emitir tarjeta'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-space-xl">
        <div className="flex flex-col gap-space-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-title-lg text-title-lg uppercase text-primary">Tarjetas emitidas</h2>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Los sellos se registran después de una cita completada.</p>
          </div>
          <label className="flex w-full flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant sm:max-w-xs">
            Buscar tarjeta
            <input className={inputClass} onChange={(event) => setCardQuery(event.target.value)} placeholder="Nombre, teléfono o campaña" type="search" value={cardQuery} />
          </label>
        </div>

        {loading && <p className="mt-space-md border border-surface-container bg-surface-container-lowest p-space-md font-body-md text-body-md text-on-surface-variant" role="status">Cargando campañas y tarjetas…</p>}
        {!loading && loadError && (
          <div className="mt-space-md border border-error/30 bg-error-container p-space-lg text-center">
            <p className="font-body-md text-body-md text-on-error-container">{loadError}</p>
            <button className="mt-space-md min-h-11 bg-primary px-4 py-2 font-label-caps text-label-caps uppercase text-on-primary" onClick={() => { setLoading(true); void loadOverview() }} type="button">Reintentar</button>
          </div>
        )}
        {!loading && !loadError && visibleCards.length === 0 && (
          <p className="mt-space-md border border-surface-container bg-surface-container-lowest p-space-lg font-body-md text-body-md text-on-surface-variant">
            {overview.cards.length === 0 ? 'Todavía no se han emitido tarjetas.' : 'No hay tarjetas que coincidan con la búsqueda.'}
          </p>
        )}
        {!loading && !loadError && visibleCards.length > 0 && (
          <div className="mt-space-md space-y-space-md">
            {visibleCards.map((card) => {
              const client = clientById.get(card.client_id)
              const campaign = campaignById.get(card.campaign_id)
              const goal = campaign?.stamp_goal ?? 0
              const ready = goal > 0 && card.stamps >= goal
              const campaignEligible = Boolean(campaign?.active && (!campaign.starts_on || campaign.starts_on <= today) && (!campaign.ends_on || campaign.ends_on >= today))
              const usedCount = overview.transactions.filter((transaction) => transaction.card_id === card.id).length
              const appointments = appointmentChoices[card.id]
              const cardTransactions = overview.transactions
                .filter((transaction) => transaction.card_id === card.id)
                .slice(0, 5)
              return (
                <article key={card.id} className={`border bg-surface-container-lowest p-space-md sm:p-space-lg ${card.status === 'active' ? 'border-surface-container' : 'border-outline-variant opacity-70'}`}>
                  <div className="flex flex-col gap-space-md lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-space-sm">
                        <div className="min-w-0">
                          <h3 className="break-words font-title-md text-title-md text-primary">{client?.full_name ?? 'Clienta no disponible'}</h3>
                          <p className="mt-1 break-all font-body-sm text-body-sm text-on-surface-variant">{client?.phone ?? ''} · {campaign?.name ?? 'Campaña retirada'}</p>
                        </div>
                        <span className="font-label-caps text-[10px] uppercase text-on-surface-variant">{card.status === 'active' ? (ready ? 'Recompensa lista' : 'Activa') : 'Revocada'}</span>
                      </div>
                      <div className="mt-space-md flex flex-wrap items-center gap-2" aria-label={`${card.stamps} de ${goal} sellos`}>
                        {Array.from({ length: goal }, (_, index) => (
                          <span key={index} aria-hidden="true" className={`flex h-8 w-8 items-center justify-center border ${index < card.stamps ? 'border-secondary bg-secondary text-on-secondary' : 'border-outline-variant text-on-surface-variant'}`}>
                            {index < card.stamps ? <FaCheck className="text-[12px]" /> : <FaStamp className="text-[13px]" />}
                          </span>
                        ))}
                        <span className="ml-1 font-body-sm text-body-sm text-primary">{card.stamps}/{goal}</span>
                      </div>
                      <p className="mt-space-sm break-words font-body-sm text-body-sm text-on-surface-variant">Premio: {campaign?.reward_description ?? 'No disponible'} · Canjes: {card.rewards_redeemed} · Movimientos: {usedCount}</p>
                      <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Emitida {dateLabel(card.issued_at)}</p>
                      {card.status === 'active' && !campaignEligible && <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">La campaña está pausada o fuera de vigencia; no se pueden acumular sellos ahora.</p>}
                      {cardTransactions.length > 0 && (
                        <details className="mt-space-sm border-t border-surface-container pt-space-sm">
                          <summary className="min-h-11 cursor-pointer py-2 font-label-caps text-[10px] uppercase text-on-surface-variant focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2">
                            Ver últimos movimientos
                          </summary>
                          <ol className="space-y-1 pb-2 font-body-sm text-body-sm text-on-surface-variant">
                            {cardTransactions.map((transaction) => (
                              <li key={transaction.id} className="flex flex-wrap justify-between gap-x-3 gap-y-1">
                                <span>{transactionLabel(transaction.event_type)}{transaction.event_type === 'stamp' ? ` · ${transaction.stamps_after}/${goal}` : ''}</span>
                                <time dateTime={transaction.created_at}>{dateLabel(transaction.created_at)}</time>
                              </li>
                            ))}
                          </ol>
                        </details>
                      )}

                      {card.status === 'active' && appointments && (
                        <div className="mt-space-md grid grid-cols-1 gap-space-sm sm:grid-cols-[minmax(0,1fr)_auto]">
                          <select aria-label={`Cita completada de ${client?.full_name ?? 'clienta'}`} className={inputClass} disabled={appointments.length === 0} onChange={(event) => setSelectedAppointments((current) => ({ ...current, [card.id]: event.target.value }))} value={selectedAppointments[card.id] ?? ''}>
                            <option value="">{appointments.length ? 'Selecciona una cita completada' : 'Sin citas disponibles para sello'}</option>
                            {appointments.map((appointment) => <option key={appointment.id} value={appointment.id}>{dateLabel(appointment.starts_at)}</option>)}
                          </select>
                          <button className="min-h-11 bg-secondary px-4 py-2 font-label-caps text-[10px] uppercase text-on-secondary transition-colors hover:bg-tertiary-container disabled:cursor-not-allowed disabled:opacity-50" disabled={saving || !selectedAppointments[card.id]} onClick={() => void handleAddStamp(card)} type="button">Registrar sello</button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-space-sm lg:w-48 lg:justify-end">
                      {card.status === 'active' && (
                        <>
                          <button aria-label={`Compartir tarjeta de ${client?.full_name ?? 'clienta'}`} className="flex min-h-11 items-center gap-2 border border-surface-container px-3 py-2 font-label-caps text-[10px] uppercase text-primary transition-colors hover:border-secondary" onClick={() => void handleShare(card.public_token, client?.full_name ?? 'la clienta')} type="button">
                            <FaLink aria-hidden="true" /> Compartir
                          </button>
                          <button className="flex min-h-11 items-center gap-2 border border-surface-container px-3 py-2 font-label-caps text-[10px] uppercase text-primary transition-colors hover:border-secondary disabled:cursor-not-allowed disabled:opacity-50" disabled={saving || ready || !campaignEligible} onClick={() => void showCompletedAppointments(card)} type="button">
                            <FaStamp aria-hidden="true" /> {loadingAppointments === card.id ? 'Buscando…' : 'Añadir sello'}
                          </button>
                          {ready && campaign && (
                            <button className="flex min-h-11 items-center gap-2 bg-primary px-3 py-2 font-label-caps text-[10px] uppercase text-on-primary transition-colors hover:bg-secondary disabled:opacity-50" disabled={saving} onClick={() => void handleRedeem(card, campaign)} type="button">
                              <FaGift aria-hidden="true" /> Registrar canje
                            </button>
                          )}
                          <button className="flex min-h-11 items-center gap-2 border border-outline-variant px-3 py-2 font-label-caps text-[10px] uppercase text-on-surface-variant transition-colors hover:border-error hover:text-error disabled:opacity-50" disabled={saving} onClick={() => void handleRevoke(card)} type="button">
                            <FaBan aria-hidden="true" /> Revocar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

function campaignCardsCount(cards: LoyaltyCard[], campaignId: string): number {
  return cards.filter((card) => card.campaign_id === campaignId).length
}

function transactionLabel(type: LoyaltyOverview['transactions'][number]['event_type']): string {
  const labels: Record<typeof type, string> = {
    issued: 'Tarjeta emitida',
    stamp: 'Sello registrado',
    redeemed: 'Recompensa canjeada',
    revoked: 'Tarjeta revocada',
  }
  return labels[type]
}

const inputClass = 'min-h-11 w-full border border-surface-container bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-primary outline-none transition-colors focus-visible:border-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-1'

function Field({ children, className = '', label }: { children: ReactNode; className?: string; label: string }) {
  return <label className={`flex min-w-0 flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant ${className}`}>{label}{children}</label>
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-l-2 border-secondary bg-surface-container-lowest p-space-md">
      <p className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">{label}</p>
      <p className="mt-1 font-headline-md text-headline-md text-primary">{value}</p>
    </div>
  )
}
