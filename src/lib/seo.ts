import { useEffect } from 'react'
import { siteConfig } from '../data/site'

type PageMeta = {
  title: string
  description: string
  path: string
  noIndex?: boolean
  image?: string
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.content = content
}

export function usePageMeta({ title, description, path, noIndex = false, image }: PageMeta) {
  useEffect(() => {
    const url = `${siteConfig.url}${path}`
    const socialImage = image ?? siteConfig.seoImage

    document.title = title
    setMeta('name', 'description', description)
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow')
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', socialImage)
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', socialImage)

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')

    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }

    canonical.href = url
  }, [description, image, noIndex, path, title])
}
