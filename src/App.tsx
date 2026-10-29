import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import './App.css'

const AdminPage = lazy(() => import('./pages/AdminPage'))
const BookingPage = lazy(() => import('./pages/BookingPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))

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

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<Home />} path="/" />
          <Route element={<BookingPage />} path="/reservas" />
          <Route element={<PrivacyPolicyPage />} path="/politica-privacidad" />
          <Route element={<AdminPage />} path="/gestion-perfectwoman" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
