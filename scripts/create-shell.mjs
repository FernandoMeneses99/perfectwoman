import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const indexPath = resolve('dist/index.html')
const outputPath = resolve('dist/__shell.html')

const html = readFileSync(indexPath, 'utf8')
const metaBlockPattern = /<title>[\s\S]*?<meta name="twitter:image:alt"[^>]*>/

if (!metaBlockPattern.test(html)) {
  throw new Error('No se encontró el bloque de metadatos en dist/index.html')
}

const shell = html.replace(
  metaBlockPattern,
  (block) => `<!--meta:start-->\n${block}\n<!--meta:end-->`,
)

writeFileSync(outputPath, shell, 'utf8')
console.log('shell de metadatos generado en dist/__shell.html')
