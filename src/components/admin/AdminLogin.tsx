import { useState } from 'react'
import type { FormEvent } from 'react'
import { FaLock } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { mapAuthError, signInAdmin } from '../../lib/admin'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await signInAdmin(email.trim(), password)
    } catch (signInError) {
      setError(mapAuthError(signInError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center py-space-xl">
      <div className="border border-surface-container bg-surface-container-lowest p-space-lg shadow-sm sm:p-space-xl">
        <div className="flex h-11 w-11 items-center justify-center bg-secondary text-on-secondary">
          <FaLock aria-hidden="true" />
        </div>
        <span className="mt-space-md block font-label-caps text-label-caps uppercase tracking-widest text-secondary">
          Acceso restringido
        </span>
        <h1 className="mt-space-sm font-headline-md text-headline-md uppercase text-primary">Panel administrativo</h1>
        <p className="mt-space-sm font-body-md text-body-md leading-relaxed text-on-surface-variant">
          Ingresa con tu cuenta autorizada para gestionar las citas del estudio.
        </p>

        <form className="mt-space-lg space-y-space-md" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Correo electrónico
            <input
              autoComplete="username"
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none transition-colors focus:border-secondary"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
            Contraseña
            <input
              autoComplete="current-password"
              className="border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none transition-colors focus:border-secondary"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error && (
            <p className="border-l-2 border-error bg-error-container px-3 py-2 font-body-sm text-body-sm text-on-error-container" role="alert">
              {error}
            </p>
          )}

          <button
            className="w-full bg-primary px-5 py-3 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-space-md font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
          Solo personal autorizado. Si no recuerdas tu contraseña, restablécala desde el panel de Supabase.
        </p>

        <Link
          className="mt-space-md inline-block font-label-caps text-label-caps uppercase text-secondary underline decoration-secondary/40 underline-offset-4 transition-colors hover:text-primary"
          to="/"
        >
          Volver al sitio
        </Link>
      </div>
    </div>
  )
}
