import { createContext, useContext } from 'react'
import {
  fallbackGallery,
  fallbackSiteContent,
} from './siteContent'
import type { GalleryItem, SiteContent } from './siteContent'

export type SiteContentContextValue = {
  content: SiteContent
  gallery: GalleryItem[]
  loading: boolean
}

export const SiteContentContext = createContext<SiteContentContextValue>({
  content: fallbackSiteContent,
  gallery: fallbackGallery,
  loading: false,
})

export function useSiteContent(): SiteContentContextValue {
  return useContext(SiteContentContext)
}
