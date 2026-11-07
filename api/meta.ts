import { buildMetaTagBlock, resolvePublicMeta } from '../src/lib/publicMeta'

export const config = { runtime: 'edge' }

const shellCache = new Map<string, Promise<string>>()

function getShell(origin: string): Promise<string> {
  const cached = shellCache.get(origin)

  if (cached) return cached

  const pending = fetch(`${origin}/__shell.html`, {
    headers: { accept: 'text/html' },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`No se pudo cargar el shell (HTTP ${response.status})`)
      }

      return response.text()
    })
    .catch((error) => {
      shellCache.delete(origin)
      throw error
    })

  shellCache.set(origin, pending)
  return pending
}

function resolveRequestPath(request: Request): string {
  const url = new URL(request.url)
  const rewritePath = url.searchParams.get('__pm_path')

  if (rewritePath) return rewritePath
  if (url.pathname !== '/api/meta') return url.pathname

  return '/'
}

const metaBlockPattern = /<!--meta:start-->[\s\S]*?<!--meta:end-->/

function baseHeaders(noIndex: boolean): Record<string, string> {
  return {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'public, max-age=0, must-revalidate',
    'x-robots-tag': noIndex ? 'noindex, nofollow' : 'index, follow',
  }
}

export default async function handler(request: Request): Promise<Response> {
  const meta = resolvePublicMeta(resolveRequestPath(request))
  const origin = new URL(request.url).origin

  try {
    const shell = await getShell(origin)

    if (!metaBlockPattern.test(shell)) {
      throw new Error('El shell no contiene el bloque de metadatos')
    }

    const html = shell.replace(metaBlockPattern, buildMetaTagBlock(meta))

    return new Response(html, {
      status: 200,
      headers: baseHeaders(Boolean(meta.noIndex)),
    })
  } catch (error) {
    console.error('meta edge function:', error)

    const fallback = `<!doctype html>
<html lang="es-CO">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${buildMetaTagBlock({ ...meta, noIndex: true })}
</head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#fff7fa;color:#120e14;font-family:system-ui,sans-serif">
<main style="max-width:560px">
<h1 style="margin:0;font-size:32px;line-height:1.1;text-transform:uppercase">No pudimos cargar esta página</h1>
<p style="margin:16px 0 0;line-height:1.6;color:#4a454a">Intenta de nuevo en unos segundos o vuelve al inicio.</p>
<a href="/" style="display:inline-block;margin-top:24px;padding:12px 20px;background:#120e14;color:#fff;text-decoration:none;font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase">Ir al inicio</a>
</main>
</body>
</html>`

    return new Response(fallback, {
      status: 503,
      headers: baseHeaders(true),
    })
  }
}
