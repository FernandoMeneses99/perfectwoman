import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { FaTimes } from 'react-icons/fa'

type AdminModalProps = {
  children: ReactNode
  eyebrow?: string
  title: string
  busy?: boolean
  onClose: () => void
}

export default function AdminModal({
  children,
  eyebrow,
  title,
  busy = false,
  onClose,
}: AdminModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busy) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [busy, onClose])

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-primary/60 px-margin py-space-lg"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose()
        }
      }}
      role="presentation"
    >
      <div
        aria-labelledby="admin-modal-title"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-surface-container bg-surface-container-lowest p-space-lg shadow-xl sm:p-space-xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-space-md">
          <div>
            {eyebrow && (
              <span className="font-label-caps text-[10px] uppercase tracking-widest text-secondary">
                {eyebrow}
              </span>
            )}
            <h2
              className="mt-1 font-headline-sm text-headline-sm uppercase text-primary"
              id="admin-modal-title"
            >
              {title}
            </h2>
          </div>
          <button
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-surface-container text-on-surface-variant transition-colors hover:border-secondary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={busy}
            onClick={onClose}
            type="button"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        <div className="mt-space-lg">{children}</div>
      </div>
    </div>
  )
}
