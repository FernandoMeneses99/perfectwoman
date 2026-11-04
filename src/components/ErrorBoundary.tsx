import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type ErrorBoundaryProps = {
  children: ReactNode
  resetKey?: string
}

type ErrorBoundaryState = {
  hasError: boolean
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error de interfaz:', error, info.componentStack)
  }

  componentDidUpdate(previous: ErrorBoundaryProps) {
    if (this.state.hasError && previous.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background px-margin py-space-3xl">
        <div className="w-full max-w-lg border border-surface-container bg-surface-container-lowest p-space-lg text-center shadow-sm">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
            Algo salió mal
          </span>
          <h1 className="mt-space-sm font-headline-md text-headline-md uppercase text-primary">
            No pudimos mostrar esta página
          </h1>
          <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">
            Recarga la página o vuelve al inicio. Si el problema continúa,
            escríbenos por WhatsApp.
          </p>
          <div className="mt-space-lg flex flex-col justify-center gap-space-sm sm:flex-row">
            <button
              className="border border-surface-container px-5 py-3 font-label-caps text-label-caps uppercase text-primary transition-colors hover:border-secondary"
              onClick={() => window.location.reload()}
              type="button"
            >
              Recargar
            </button>
            <Link
              className="bg-primary px-5 py-3 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary"
              to="/"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
