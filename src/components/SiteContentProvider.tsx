import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  fallbackGallery,
  fallbackSiteContent,
  fetchPublicGallery,
  fetchPublicSiteContent,
} from '../lib/siteContent'
import type { GalleryItem, SiteContent } from '../lib/siteContent'
import { SiteContentContext } from '../lib/siteContentContext'

export default function SiteContentProvider({
  children,
}: {
  children: ReactNode
}) {
  const [content, setContent] = useState<SiteContent>(fallbackSiteContent)
  const [gallery, setGallery] = useState<GalleryItem[]>(fallbackGallery)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([fetchPublicSiteContent(), fetchPublicGallery()])
      .then(([nextContent, nextGallery]) => {
        if (active) {
          setContent(nextContent)
          setGallery(nextGallery)
        }
      })
      .catch(() => {
        // Keep the bundled fallback when the CMS is unavailable.
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <SiteContentContext.Provider value={{ content, gallery, loading }}>
      {children}
    </SiteContentContext.Provider>
  )
}
