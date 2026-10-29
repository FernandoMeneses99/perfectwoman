import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import AdminDashboard from '../components/admin/AdminDashboard'
import AdminLogin from '../components/admin/AdminLogin'
import {
  ADMIN_OPEN_AGENDA_EVENT,
  AdminAlertsButton,
  AdminNotificationsProvider,
} from '../components/admin/AdminNotifications'
import AdminProfessionalsManager from '../components/admin/AdminProfessionalsManager'
import AdminScheduleManager from '../components/admin/AdminScheduleManager'
import AdminServicesManager from '../components/admin/AdminServicesManager'
import AdminShell from '../components/admin/AdminShell'
import AdminTabs from '../components/admin/AdminTabs'
import AdminUsersManager from '../components/admin/AdminUsersManager'
import type { AdminSection } from '../components/admin/AdminTabs'
import { siteConfig } from '../data/site'
import { fetchAdminProfile, mapAccessError, signOutAdmin } from '../lib/admin'
import type { AdminProfile } from '../lib/admin'
import { usePageMeta } from '../lib/seo'
import { supabase } from '../lib/supabase'

export default function AdminPage() {
  usePageMeta({
    title: `Panel administrativo · ${siteConfig.brand}`,
    description: 'Panel administrativo de Perfect Woman T.',
    path: '/gestion-perfectwoman',
    noIndex: true,
  })

  const [session, setSession] = useState<Session | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [checkingAccess, setCheckingAccess] = useState(false)
  const [accessError, setAccessError] = useState<string | null>(null)
  const [accessRefreshKey, setAccessRefreshKey] = useState(0)
  const [signingOut, setSigningOut] = useState(false)
  const [section, setSection] = useState<AdminSection>('agenda')

  const userId = session?.user.id
  const userEmail = session?.user.email ?? null

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return
      }

      setSession(data.session)
      setCheckingSession(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setCheckingSession(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    function openAgenda() {
      setSection('agenda')
    }

    window.addEventListener(ADMIN_OPEN_AGENDA_EVENT, openAgenda)

    return () => {
      window.removeEventListener(ADMIN_OPEN_AGENDA_EVENT, openAgenda)
    }
  }, [])

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setAccessError(null)
      setCheckingAccess(false)
      return
    }

    let active = true
    setCheckingAccess(true)
    setAccessError(null)

    fetchAdminProfile(userId)
      .then((nextProfile) => {
        if (active) {
          setProfile(nextProfile)
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setAccessError(mapAccessError(error))
        }
      })
      .finally(() => {
        if (active) {
          setCheckingAccess(false)
        }
      })

    return () => {
      active = false
    }
  }, [userId, accessRefreshKey])

  async function handleSignOut() {
    setSigningOut(true)

    try {
      await signOutAdmin()
    } catch {
      // The auth listener still clears the local session when possible.
    } finally {
      setSigningOut(false)
    }
  }

  if (checkingSession) {
    return (
      <AdminShell>
        <AdminLoading text="Verificando sesión…" />
      </AdminShell>
    )
  }

  if (!session) {
    return (
      <AdminShell>
        <AdminLogin />
      </AdminShell>
    )
  }

  if (checkingAccess) {
    return (
      <AdminShell email={userEmail} onSignOut={() => void handleSignOut()} signingOut={signingOut}>
        <AdminLoading text="Verificando permisos…" />
      </AdminShell>
    )
  }

  if (accessError) {
    return (
      <AdminShell email={userEmail} onSignOut={() => void handleSignOut()} signingOut={signingOut}>
        <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
          <h1 className="font-headline-md text-headline-md uppercase text-primary">No pudimos verificar tu acceso</h1>
          <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">{accessError}</p>
          <div className="mt-space-lg flex flex-wrap justify-center gap-space-sm">
            <button
              className="bg-primary px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary"
              onClick={() => setAccessRefreshKey((value) => value + 1)}
              type="button"
            >
              Reintentar
            </button>
            <button
              className="border border-surface-container px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:border-secondary hover:text-primary"
              onClick={() => void handleSignOut()}
              type="button"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </AdminShell>
    )
  }

  if (!profile) {
    return (
      <AdminShell email={userEmail} onSignOut={() => void handleSignOut()} signingOut={signingOut}>
        <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">Acceso restringido</span>
          <h1 className="mt-space-sm font-headline-md text-headline-md uppercase text-primary">Tu cuenta no tiene permisos</h1>
          <p className="mt-space-sm font-body-md text-body-md leading-relaxed text-on-surface-variant">
            Iniciaste sesión como {userEmail}, pero este usuario no está activo en la lista de administración.
          </p>
          <button
            className="mt-space-lg border border-surface-container px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:border-secondary hover:text-primary"
            onClick={() => void handleSignOut()}
            type="button"
          >
            Cerrar sesión
          </button>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminNotificationsProvider>
      <AdminShell
        adminName={profile.display_name}
        alerts={<AdminAlertsButton />}
        email={profile.email}
        onSignOut={() => void handleSignOut()}
        signingOut={signingOut}
      >
        <div className="mx-auto w-full max-w-7xl px-margin pb-space-xl md:px-margin-tablet lg:px-margin-desktop">
          <div className="pt-space-md">
            <AdminTabs active={section} onChange={setSection} />
          </div>

          {section === 'agenda' && <AdminDashboard />}
          {section === 'horarios' && <AdminScheduleManager />}
          {section === 'servicios' && <AdminServicesManager />}
          {section === 'equipo' && <AdminProfessionalsManager />}
          {section === 'admins' && <AdminUsersManager />}
        </div>
      </AdminShell>
    </AdminNotificationsProvider>
  )
}

function AdminLoading({ text }: { text: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-center">
      <p className="font-body-lg text-body-lg text-on-surface-variant">{text}</p>
    </div>
  )
}
