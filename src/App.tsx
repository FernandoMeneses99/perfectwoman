import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import ErrorBoundary from './components/ErrorBoundary'
import SiteContentProvider from './components/SiteContentProvider'
import './App.css'

const AdminPage = lazy(() => import('./pages/AdminPage'))
const BookingPage = lazy(() => import('./pages/BookingPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))
const PublicLoyaltyCardPage = lazy(() => import('./pages/PublicLoyaltyCardPage'))
const LoyaltyClubPage = lazy(() => import('./pages/LoyaltyClubPage'))
const ReviewPage = lazy(() => import('./pages/ReviewPage'))

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.slice(1))

      if (element) {
        element.scrollIntoView()
        return
      }
    }

    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-margin text-center">
      <p className="font-body-md text-body-md text-on-surface-variant">Cargando…</p>
    </div>
  )
}

function AppRoutes() {
  const { pathname } = useLocation()

  return (
    <ErrorBoundary resetKey={pathname}>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<Home />} path="/" />
          <Route element={<BookingPage />} path="/reservas" />
          <Route element={<PrivacyPolicyPage />} path="/politica-privacidad" />
          <Route element={<PublicLoyaltyCardPage />} path="/fidelidad/:token" />
          <Route element={<LoyaltyClubPage />} path="/club-fidelidad" />
          <Route element={<ReviewPage />} path="/opinion/:token" />
          <Route element={<AdminPage />} path="/gestion-perfectwoman" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

function App() {
  return (
    <SiteContentProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </SiteContentProvider>
  )
}

export default App
