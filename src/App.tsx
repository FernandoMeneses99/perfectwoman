import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import AdminPage from './pages/AdminPage'
import BookingPage from './pages/BookingPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import './App.css'

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

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<BookingPage />} path="/reservas" />
        <Route element={<PrivacyPolicyPage />} path="/politica-privacidad" />
        <Route element={<AdminPage />} path="/gestion-perfectwoman" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
