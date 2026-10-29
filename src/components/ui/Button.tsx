import type { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  href?: string
  className?: string
  ariaLabel?: string
  target?: string
  rel?: string
  onClick?: () => void
}

export default function Button({ children, href, className = '', ariaLabel, target, rel, onClick }: ButtonProps) {
  const base = 'font-label-caps text-label-caps uppercase tracking-widest transition-colors'
  if (href) {
    return (
      <a href={href} className={base + ' ' + className} aria-label={ariaLabel} target={target} rel={rel} onClick={onClick}>
        {children}
      </a>
    )
  }
  return (
    <button className={base + ' ' + className} aria-label={ariaLabel} onClick={onClick}>
      {children}
    </button>
  )
}
