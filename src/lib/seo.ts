import { useEffect } from 'react'
import { siteConfig } from '../data/site'

type PageMeta = {
  title: string
  description: string
  path: string
  noIndex?: boolean
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

export function usePageMeta({ title, description, path, noIndex = false }: PageMeta) {
  useEffect(() => {
    const url = `${siteConfig.url}${path}`

    document.title = title
    setMeta('name', 'description', description)
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow')
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', siteConfig.seoImage)
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', siteConfig.seoImage)

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')

    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }

    canonical.href = url
  }, [description, noIndex, path, title])
}
