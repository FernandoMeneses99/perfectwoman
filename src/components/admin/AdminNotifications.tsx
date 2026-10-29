import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { FaBell, FaBellSlash, FaTimes } from 'react-icons/fa'
import confirmationToneUrl from '../../../sound/confirmation-tone.wav'
import { siteConfig } from '../../data/site'
import { dateInTimeZone, formatDateLong, formatTime } from '../../lib/dates'
import { fetchAdminAppointment } from '../../lib/admin'
import type { AdminAppointment } from '../../lib/admin'
import { supabase } from '../../lib/supabase'

export const ADMIN_OPEN_AGENDA_EVENT = 'perfectwoman:open-agenda'
export const ADMIN_APPOINTMENT_CREATED_EVENT = 'perfectwoman:appointment-created'

const STORAGE_KEY = 'perfectwoman-admin-alerts'
const NOTIFICATION_DURATION_MS = 9000
const EXIT_DURATION_MS = 240

type NotificationPermissionState = NotificationPermission | 'unsupported'

type NotificationItem = {
  id: string
  title: string
  body: string
  leaving: boolean
}

type AdminNotificationsContextValue = {
  enabled: boolean
  soundReady: boolean
  permission: NotificationPermissionState
  toggle: () => void
  armSound: () => void
}

const AdminNotificationsContext = createContext<AdminNotificationsContextValue | null>(null)

function readPreference(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'on'
  } catch {
    return false
  }
}

function writePreference(enabled: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off')
  } catch {
    return
  }
}

function currentPermission(): NotificationPermissionState {
  return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
}

function newNotificationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function AdminNotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [enabled, setEnabled] = useState(readPreference)
  const [soundReady, setSoundReady] = useState(false)
  const [permission, setPermission] = useState<NotificationPermissionState>(currentPermission)
  const enabledRef = useRef(enabled)
  const toneRef = useRef<HTMLAudioElement | null>(null)
  const timersRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  useEffect(() => {
    const timers = timersRef.current

    return () => {
      for (const timer of timers.values()) {
        window.clearTimeout(timer)
      }
      toneRef.current?.pause()
    }
  }, [])

  const getTone = useCallback(() => {
    if (!toneRef.current) {
      const tone = new Audio(confirmationToneUrl)
      tone.preload = 'auto'
      tone.volume = 0.85
      toneRef.current = tone
    }

    return toneRef.current
  }, [])

  useEffect(() => {
    if (enabled) {
      getTone()
    }
  }, [enabled, getTone])

  const primeTone = useCallback(
    async (audible: boolean) => {
      const tone = getTone()
      const previousVolume = tone.volume

      tone.currentTime = 0
      tone.volume = audible ? 0.85 : 0

      try {
        await tone.play()
        setSoundReady(true)
        return true
      } catch {
        return false
      } finally {
        if (!audible) {
          tone.pause()
          tone.currentTime = 0
        }
        tone.volume = previousVolume
      }
    },
    [getTone],
  )

  const playTone = useCallback(() => {
    if (!enabledRef.current) {
      return
    }

    const tone = getTone()
    tone.currentTime = 0
    void tone
      .play()
      .then(() => setSoundReady(true))
      .catch(() => undefined)
  }, [getTone])

  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      return null
    }

    try {
      return await navigator.serviceWorker.register('/sw.js')
    } catch {
      return null
    }
  }, [])

  const showSystemNotification = useCallback(async (title: string, body: string) => {
    if (
      typeof Notification === 'undefined' ||
      Notification.permission !== 'granted' ||
      document.visibilityState === 'visible'
    ) {
      return
    }

    const options: NotificationOptions = {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'perfectwoman-new-booking',
    }

    try {
      const registration = await navigator.serviceWorker?.getRegistration('/')

      if (registration) {
        await registration.showNotification(title, options)
        return
      }

      new Notification(title, options)
    } catch {
      return
    }
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, leaving: true } : item)),
    )

    const timer = timersRef.current.get(id)

    if (timer) {
      window.clearTimeout(timer)
      timersRef.current.delete(id)
    }

    window.setTimeout(() => {
      setNotifications((current) => current.filter((item) => item.id !== id))
    }, EXIT_DURATION_MS)
  }, [])

  const pushNotification = useCallback(
    (appointment: AdminAppointment | null, fallbackCode?: string) => {
      const body = appointment
        ? `${appointment.client?.full_name ?? 'Nueva clienta'} reservó ${
            appointment.service?.name ?? 'un servicio'
          } · ${formatDateLong(
            dateInTimeZone(appointment.starts_at, siteConfig.timeZone),
            siteConfig.timeZone,
          )} a las ${formatTime(appointment.starts_at, siteConfig.timeZone)}`
        : `Llegó una reserva nueva${fallbackCode ? ` · ${fallbackCode}` : ''}.`

      const id = newNotificationId()
      const item: NotificationItem = {
        id,
        title: 'Nueva reserva',
        body,
        leaving: false,
      }

      setNotifications((current) => [...current.slice(-2), item])
      playTone()
      void showSystemNotification(`${siteConfig.brand} · Nueva reserva`, body)

      const timer = window.setTimeout(
        () => dismissNotification(id),
        NOTIFICATION_DURATION_MS,
      )
      timersRef.current.set(id, timer)
    },
    [dismissNotification, playTone, showSystemNotification],
  )

  const handleIncoming = useCallback(
    async (appointmentId: string, confirmationCode?: string) => {
      window.dispatchEvent(
        new CustomEvent(ADMIN_APPOINTMENT_CREATED_EVENT, {
          detail: { appointmentId },
        }),
      )

      try {
        pushNotification(await fetchAdminAppointment(appointmentId), confirmationCode)
      } catch {
        pushNotification(null, confirmationCode)
      }
    },
    [pushNotification],
  )

  useEffect(() => {
    const channel = supabase
      .channel('admin-appointment-alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'appointments' },
        (payload) => {
          const row = payload.new as {
            id?: string
            source?: string
            confirmation_code?: string
          }

          if (!row.id || row.source !== 'public') {
            return
          }

          void handleIncoming(row.id, row.confirmation_code)
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [handleIncoming])

  useEffect(() => {
    if (!enabled) {
      return
    }

    function unlockAudio() {
      void primeTone(false)
    }

    window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true })

    if (permission === 'granted') {
      void registerServiceWorker()
    }

    return () => {
      window.removeEventListener('pointerdown', unlockAudio)
    }
  }, [enabled, permission, primeTone, registerServiceWorker])

  const requestSystemPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      return
    }

    if (Notification.permission === 'granted') {
      setPermission('granted')
      void registerServiceWorker()
      return
    }

    if (Notification.permission !== 'default') {
      setPermission(Notification.permission)
      return
    }

    try {
      const nextPermission = await Notification.requestPermission()
      setPermission(nextPermission)

      if (nextPermission === 'granted') {
        void registerServiceWorker()
      }
    } catch {
      setPermission(currentPermission())
    }
  }, [registerServiceWorker])

  const armSound = useCallback(() => {
    void primeTone(true)
    void requestSystemPermission()
  }, [primeTone, requestSystemPermission])

  const toggle = useCallback(() => {
    if (enabledRef.current) {
      enabledRef.current = false
      setEnabled(false)
      writePreference(false)
      return
    }

    enabledRef.current = true
    setEnabled(true)
    writePreference(true)
    void primeTone(true)
    void requestSystemPermission()
  }, [primeTone, requestSystemPermission])

  const value = useMemo(
    () => ({ enabled, soundReady, permission, toggle, armSound }),
    [armSound, enabled, permission, soundReady, toggle],
  )

  return (
    <AdminNotificationsContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-margin sm:items-end sm:px-4">
        {notifications.map((item) => (
          <div
            key={item.id}
            aria-label={`${item.title}. ${item.body}`}
            className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-[22px] border border-white/70 bg-white/90 p-3 shadow-[0_18px_50px_rgba(18,14,20,0.22)] backdrop-blur-2xl ${
              item.leaving ? 'ios-notification-exit' : 'ios-notification-enter'
            }`}
            role="alert"
          >
            <div className="flex items-start gap-3">
              <img
                alt=""
                className="h-10 w-10 shrink-0 rounded-[11px] bg-primary object-contain p-1.5 shadow-sm"
                src="/favicon.svg"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate font-label-caps text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                    {siteConfig.brand}
                  </p>
                  <span className="shrink-0 font-body-sm text-[10px] text-zinc-400">ahora</span>
                </div>
                <p className="mt-0.5 font-body-md text-body-md font-semibold text-primary">
                  {item.title}
                </p>
                <p className="mt-0.5 line-clamp-2 font-body-sm text-body-sm text-zinc-600">
                  {item.body}
                </p>
                <button
                  className="mt-2.5 font-label-caps text-[10px] uppercase tracking-wider text-secondary underline decoration-secondary/40 underline-offset-4 transition-colors hover:text-primary"
                  onClick={() => {
                    window.dispatchEvent(new Event(ADMIN_OPEN_AGENDA_EVENT))
                    dismissNotification(item.id)
                  }}
                  type="button"
                >
                  Ver agenda
                </button>
              </div>
              <button
                aria-label="Cerrar notificación"
                className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                onClick={() => dismissNotification(item.id)}
                type="button"
              >
                <FaTimes className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminNotificationsContext.Provider>
  )
}

export function useAdminNotifications(): AdminNotificationsContextValue {
  const context = useContext(AdminNotificationsContext)

  if (!context) {
    throw new Error('useAdminNotifications must be used inside AdminNotificationsProvider')
  }

  return context
}

export function AdminAlertsButton() {
  const { enabled, soundReady, permission, toggle, armSound } = useAdminNotifications()
  const Icon = enabled ? FaBell : FaBellSlash
  const needsSound = enabled && !soundReady
  const label = !enabled ? 'Activar alertas' : needsSound ? 'Activar sonido' : 'Alertas activas'
  const title = !enabled
    ? 'Activa el sonido y las notificaciones del navegador para nuevas reservas.'
    : needsSound
      ? 'Activa el sonido de nuevas reservas.'
      : permission === 'denied'
        ? 'Sonido activo. Las notificaciones del navegador están bloqueadas.'
        : 'Sonido y notificaciones de nuevas reservas activos.'

  return (
    <button
      aria-label={title}
      aria-pressed={enabled}
      className="flex items-center gap-2 border border-surface-container px-3 py-2 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:border-secondary hover:text-primary"
      onClick={() => {
        if (needsSound) {
          armSound()
          return
        }

        toggle()
      }}
      title={title}
      type="button"
    >
      <Icon aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
      {enabled && (
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${
            soundReady ? 'bg-emerald-500' : 'bg-amber-400'
          }`}
        />
      )}
    </button>
  )
}
