import {
  FaCalendarAlt,
  FaClock,
  FaCut,
  FaStar,
  FaUserShield,
  FaUserTie,
  FaStamp,
} from 'react-icons/fa'

export type AdminSection =
  | 'agenda'
  | 'horarios'
  | 'servicios'
  | 'equipo'
  | 'fidelidad'
  | 'opiniones'
  | 'admins'

type AdminTabsProps = {
  active: AdminSection
  onChange: (section: AdminSection) => void
}

const tabs: Array<{
  id: AdminSection
  label: string
  icon: typeof FaCalendarAlt
}> = [
  { id: 'agenda', label: 'Agenda', icon: FaCalendarAlt },
  { id: 'horarios', label: 'Horarios', icon: FaClock },
  { id: 'servicios', label: 'Servicios', icon: FaCut },
  { id: 'equipo', label: 'Equipo', icon: FaUserTie },
  { id: 'fidelidad', label: 'Fidelidad', icon: FaStamp },
  { id: 'opiniones', label: 'Opiniones', icon: FaStar },
  { id: 'admins', label: 'Admins', icon: FaUserShield },
]

export default function AdminTabs({ active, onChange }: AdminTabsProps) {
  return (
    <nav
      aria-label="Secciones del panel"
      className="flex flex-wrap gap-1 border-b border-surface-container"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const selected = active === tab.id

        return (
          <button
            key={tab.id}
            aria-current={selected ? 'page' : undefined}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 font-label-caps text-[10px] uppercase tracking-wider transition-colors sm:px-4 ${
              selected
                ? 'border-secondary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
            onClick={() => onChange(tab.id)}
            type="button"
          >
            <Icon aria-hidden="true" />
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
