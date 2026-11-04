import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { mapAdminError } from '../../lib/admin'
import { normalizeSiteContent } from '../../lib/siteContent'
import type { SiteContent } from '../../lib/siteContent'
import { supabase } from '../../lib/supabase'
import AdminModal from './AdminModal'

type FieldDefinition = {
  label: string
  path: string[]
  multiline?: boolean
  placeholder?: string
}

type FieldGroup = {
  title: string
  description: string
  fields: FieldDefinition[]
}

const fieldGroups: FieldGroup[] = [
  {
    title: 'Marca',
    description: 'Nombre y descripción institucional que aparecen en el encabezado y pie.',
    fields: [
      { label: 'Nombre', path: ['brand', 'name'] },
      { label: 'Descriptor', path: ['brand', 'descriptor'] },
      { label: 'Descripción', path: ['brand', 'description'], multiline: true },
      { label: 'Ubicación', path: ['brand', 'location'] },
    ],
  },
  {
    title: 'Portada',
    description: 'Primera impresión de la página de inicio.',
    fields: [
      { label: 'Antetítulo', path: ['hero', 'eyebrow'] },
      { label: 'Título', path: ['hero', 'title'] },
      { label: 'Acento del título', path: ['hero', 'titleAccent'] },
      { label: 'Descripción', path: ['hero', 'description'], multiline: true },
      { label: 'Botón principal', path: ['hero', 'primaryCta'] },
      { label: 'Botón secundario', path: ['hero', 'secondaryCta'] },
      { label: 'Imagen', path: ['hero', 'image'], placeholder: '/images/salon.jpg' },
      { label: 'Texto alternativo de la imagen', path: ['hero', 'imageAlt'] },
      { label: 'Etiqueta', path: ['hero', 'badge'] },
      { label: 'Título de la tarjeta', path: ['hero', 'cardTitle'] },
      { label: 'Año', path: ['hero', 'year'] },
    ],
  },
  {
    title: 'Servicios',
    description: 'Encabezado de la sección de especialidades.',
    fields: [
      { label: 'Antetítulo', path: ['services', 'eyebrow'] },
      { label: 'Título', path: ['services', 'title'] },
      { label: 'Descripción', path: ['services', 'description'], multiline: true },
    ],
  },
  {
    title: 'Especialista',
    description: 'Texto de la sección de filosofía y acompañamiento.',
    fields: [
      { label: 'Antetítulo', path: ['specialist', 'eyebrow'] },
      { label: 'Título', path: ['specialist', 'title'] },
      { label: 'Descripción', path: ['specialist', 'description'], multiline: true },
      { label: 'Imagen', path: ['specialist', 'image'], placeholder: '/images/salon.jpg' },
      { label: 'Texto alternativo de la imagen', path: ['specialist', 'imageAlt'] },
      { label: 'Cita', path: ['specialist', 'quote'], multiline: true },
      { label: 'Firma de la cita', path: ['specialist', 'quoteAuthor'] },
    ],
  },
  {
    title: 'Galería',
    description: 'Encabezado del portafolio fotográfico.',
    fields: [
      { label: 'Antetítulo', path: ['gallery', 'eyebrow'] },
      { label: 'Título', path: ['gallery', 'title'] },
      { label: 'Descripción', path: ['gallery', 'description'], multiline: true },
    ],
  },
  {
    title: 'Opiniones',
    description: 'Textos de la sección de reseñas moderadas.',
    fields: [
      { label: 'Antetítulo', path: ['testimonials', 'eyebrow'] },
      { label: 'Título', path: ['testimonials', 'title'] },
      { label: 'Descripción', path: ['testimonials', 'description'], multiline: true },
      { label: 'Texto sin opiniones', path: ['testimonials', 'emptyText'] },
    ],
  },
  {
    title: 'Reservas',
    description: 'Llamado a la acción final.',
    fields: [
      { label: 'Antetítulo', path: ['bookingCta', 'eyebrow'] },
      { label: 'Título', path: ['bookingCta', 'title'] },
      { label: 'Descripción', path: ['bookingCta', 'description'], multiline: true },
      { label: 'Botón principal', path: ['bookingCta', 'primaryCta'] },
      { label: 'Botón secundario', path: ['bookingCta', 'secondaryCta'] },
      { label: 'Nota', path: ['bookingCta', 'note'], multiline: true },
    ],
  },
  {
    title: 'Pie de página',
    description: 'Resumen y nota legal del pie.',
    fields: [
      { label: 'Frase corta', path: ['footer', 'tagline'] },
      { label: 'Descripción', path: ['footer', 'description'], multiline: true },
      { label: 'Nota', path: ['footer', 'note'], multiline: true },
    ],
  },
  {
    title: 'SEO',
    description: 'Título y descripción para buscadores y redes sociales.',
    fields: [
      { label: 'Título', path: ['seo', 'title'] },
      { label: 'Descripción', path: ['seo', 'description'], multiline: true },
      { label: 'Imagen social', path: ['seo', 'image'], placeholder: 'https://…' },
    ],
  },
]

function getPath(source: unknown, path: string[]): string {
  let current = source

  for (const key of path) {
    if (!current || typeof current !== 'object') {
      return ''
    }

    current = (current as Record<string, unknown>)[key]
  }

  return typeof current === 'string' ? current : ''
}

function setPath(source: SiteContent, path: string[], value: string): SiteContent {
  const [head, ...rest] = path

  if (rest.length === 0) {
    return { ...source, [head]: value }
  }

  const current = (source as unknown as Record<string, unknown>)[head]

  return {
    ...source,
    [head]: setPath(current as SiteContent, rest, value),
  }
}

function TextField({
  label,
  multiline = false,
  onChange,
  placeholder,
  value,
}: {
  label: string
  multiline?: boolean
  onChange: (value: string) => void
  placeholder?: string
  value: string
}) {
  const className =
    'mt-1 w-full border border-surface-container bg-surface-container-lowest px-3 py-2.5 font-body-md text-body-md text-primary outline-none focus:border-secondary'

  return (
    <label className="flex flex-col font-body-sm text-body-sm text-on-surface-variant">
      {label}
      {multiline ? (
        <textarea
          className={`${className} min-h-24 resize-y`}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      ) : (
        <input
          className={className}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      )}
    </label>
  )
}

export default function AdminContentManager() {
  const [content, setContent] = useState<SiteContent | null>(null)
  const [version, setVersion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function loadContent() {
    setLoading(true)
    setError(null)
    setSaved(false)

    try {
      const { data, error: loadError } = await supabase
        .from('site_content')
        .select('content, version')
        .eq('id', true)
        .maybeSingle()

      if (loadError) {
        throw new Error(loadError.message)
      }

      setContent(normalizeSiteContent(data?.content))
      setVersion(data?.version ?? 1)
    } catch (loadError) {
      setError(mapAdminError(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadContent()
  }, [])

  function updateField(path: string[], value: string) {
    setContent((current) => (current ? setPath(current, path, value) : current))
    setSaved(false)
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!content) {
      return
    }

    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const normalized = normalizeSiteContent(content)

      if (JSON.stringify(normalized).length > 240_000) {
        throw new Error('CONTENT_TOO_LARGE')
      }

      const { data, error: saveError } = await supabase
        .from('site_content')
        .update({ content: normalized })
        .eq('id', true)
        .select('version')
        .single()

      if (saveError) {
        throw new Error(saveError.message)
      }

      setContent(normalized)
      setVersion(data?.version ?? version + 1)
      setSaved(true)
      setConfirmOpen(false)
    } catch (saveError) {
      setError(
        saveError instanceof Error && saveError.message === 'CONTENT_TOO_LARGE'
          ? 'El contenido supera el tamaño máximo permitido.'
          : mapAdminError(saveError),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-space-lg py-space-lg md:py-space-xl">
      <div className="flex flex-col gap-space-md sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">
            Contenido
          </span>
          <h1 className="mt-space-sm font-headline-lg text-headline-lg-mobile uppercase leading-tight text-primary md:text-headline-lg">
            Textos del sitio
          </h1>
          <p className="mt-space-sm max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Edita los textos y las imágenes principales. Los cambios se publican al
            guardar y mantienen una versión anterior en el historial de la base de datos.
          </p>
        </div>
        <span className="w-fit border border-surface-container px-3 py-2 font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
          Versión {version}
        </span>
      </div>

      {error && (
        <p
          className="border-l-2 border-error bg-error-container px-3 py-2 font-body-sm text-body-sm text-on-error-container"
          role="alert"
        >
          {error}
        </p>
      )}

      {saved && (
        <p className="border-l-2 border-emerald-500 bg-emerald-50 px-3 py-2 font-body-sm text-body-sm text-emerald-900">
          Cambios guardados correctamente.
        </p>
      )}

      {loading || !content ? (
        <p className="font-body-md text-body-md text-on-surface-variant">
          Cargando contenido…
        </p>
      ) : (
        <form
          className="space-y-space-xl"
          data-admin-content-form
          onSubmit={handleSave}
        >
          {fieldGroups.map((group) => (
            <section
              className="border border-surface-container bg-surface-container-lowest p-space-lg shadow-sm"
              key={group.title}
            >
              <h2 className="font-headline-sm text-headline-sm uppercase text-primary">
                {group.title}
              </h2>
              <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                {group.description}
              </p>
              <div className="mt-space-md grid grid-cols-1 gap-space-md md:grid-cols-2">
                {group.fields.map((field) => (
                  <TextField
                    key={field.path.join('.')}
                    label={field.label}
                    multiline={field.multiline}
                    onChange={(value) => updateField(field.path, value)}
                    placeholder={field.placeholder}
                    value={getPath(content, field.path)}
                  />
                ))}
              </div>
            </section>
          ))}

          <section className="border border-surface-container bg-surface-container-lowest p-space-lg shadow-sm">
            <h2 className="font-headline-sm text-headline-sm uppercase text-primary">
              Métricas
            </h2>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              Valores destacados de la franja oscura. Puedes agregar o quitar filas.
            </p>
            <div className="mt-space-md space-y-space-sm">
              {content.metrics.map((metric, index) => (
                <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-[1fr_1fr_auto]" key={index}>
                  <TextField
                    label="Valor"
                    onChange={(value) => {
                      const metrics = content.metrics.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, value } : item,
                      )
                      setContent({ ...content, metrics })
                      setSaved(false)
                    }}
                    value={metric.value}
                  />
                  <TextField
                    label="Etiqueta"
                    onChange={(value) => {
                      const metrics = content.metrics.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, label: value } : item,
                      )
                      setContent({ ...content, metrics })
                      setSaved(false)
                    }}
                    value={metric.label}
                  />
                  <button
                    className="self-end border border-error/40 px-3 py-2.5 font-label-caps text-[10px] uppercase tracking-wider text-error transition-colors hover:border-error hover:bg-error-container disabled:opacity-50"
                    disabled={content.metrics.length <= 1}
                    onClick={() => {
                      setContent({
                        ...content,
                        metrics: content.metrics.filter((_, itemIndex) => itemIndex !== index),
                      })
                      setSaved(false)
                    }}
                    type="button"
                  >
                    Quitar
                  </button>
                </div>
              ))}
              <button
                className="border border-surface-container px-3 py-2 font-label-caps text-[10px] uppercase tracking-wider text-primary transition-colors hover:border-secondary"
                onClick={() => {
                  setContent({
                    ...content,
                    metrics: [...content.metrics, { value: '', label: '' }],
                  })
                  setSaved(false)
                }}
                type="button"
              >
                Agregar métrica
              </button>
            </div>
          </section>

          <section className="border border-surface-container bg-surface-container-lowest p-space-lg shadow-sm">
            <h2 className="font-headline-sm text-headline-sm uppercase text-primary">
              Lista de servicios del pie
            </h2>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              Separa cada servicio con una coma.
            </p>
            <div className="mt-space-md">
              <TextField
                label="Servicios"
                onChange={(value) => {
                  setContent({
                    ...content,
                    footer: {
                      ...content.footer,
                      services: value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean),
                    },
                  })
                  setSaved(false)
                }}
                value={content.footer.services.join(', ')}
              />
            </div>
          </section>

          <section className="border border-surface-container bg-surface-container-lowest p-space-lg shadow-sm">
            <h2 className="font-headline-sm text-headline-sm uppercase text-primary">
              Puntos de la especialista
            </h2>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              Tarjetas breves que acompañan la presentación.
            </p>
            <div className="mt-space-md space-y-space-md">
              {content.specialist.highlights.map((highlight, index) => (
                <div className="space-y-space-sm border border-surface-container p-space-md" key={index}>
                  <TextField
                    label="Título"
                    onChange={(value) => {
                      const highlights = content.specialist.highlights.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, title: value } : item,
                      )
                      setContent({
                        ...content,
                        specialist: { ...content.specialist, highlights },
                      })
                      setSaved(false)
                    }}
                    value={highlight.title}
                  />
                  <TextField
                    label="Descripción"
                    multiline
                    onChange={(value) => {
                      const highlights = content.specialist.highlights.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, description: value } : item,
                      )
                      setContent({
                        ...content,
                        specialist: { ...content.specialist, highlights },
                      })
                      setSaved(false)
                    }}
                    value={highlight.description}
                  />
                  <button
                    className="border border-error/40 px-3 py-2 font-label-caps text-[10px] uppercase tracking-wider text-error transition-colors hover:border-error hover:bg-error-container disabled:opacity-50"
                    disabled={content.specialist.highlights.length <= 1}
                    onClick={() => {
                      setContent({
                        ...content,
                        specialist: {
                          ...content.specialist,
                          highlights: content.specialist.highlights.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        },
                      })
                      setSaved(false)
                    }}
                    type="button"
                  >
                    Quitar punto
                  </button>
                </div>
              ))}
              <button
                className="border border-surface-container px-3 py-2 font-label-caps text-[10px] uppercase tracking-wider text-primary transition-colors hover:border-secondary"
                onClick={() => {
                  setContent({
                    ...content,
                    specialist: {
                      ...content.specialist,
                      highlights: [
                        ...content.specialist.highlights,
                        { title: '', description: '' },
                      ],
                    },
                  })
                  setSaved(false)
                }}
                type="button"
              >
                Agregar punto
              </button>
            </div>
          </section>

          <div className="flex flex-col gap-space-sm sm:flex-row sm:justify-end">
            <button
              className="bg-primary px-5 py-3 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={saving}
              onClick={() => setConfirmOpen(true)}
              type="button"
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      )}

      {confirmOpen && (
        <AdminModal
          busy={saving}
          eyebrow="Publicar"
          onClose={() => setConfirmOpen(false)}
          title="Confirmar cambios del sitio"
        >
          <p className="font-body-md text-body-md text-on-surface-variant">
            Los textos y las imágenes se actualizarán en la página pública para todas
            las visitas. ¿Deseas publicar esta versión?
          </p>
          <div className="mt-space-lg flex flex-col gap-space-sm sm:flex-row sm:justify-end">
            <button
              className="border border-surface-container px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:border-secondary hover:text-primary"
              disabled={saving}
              onClick={() => setConfirmOpen(false)}
              type="button"
            >
              Revisar
            </button>
            <button
              className="bg-primary px-4 py-2.5 font-label-caps text-label-caps uppercase text-on-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={saving}
              onClick={() => {
                const form = document.querySelector<HTMLFormElement>(
                  'form[data-admin-content-form]',
                )
                form?.requestSubmit()
              }}
              type="button"
            >
              {saving ? 'Publicando…' : 'Publicar'}
            </button>
          </div>
        </AdminModal>
      )}
    </div>
  )
}
