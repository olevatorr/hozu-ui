import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const kit = join(root, 'kit')
const files = {}
const sources = [
  ...readdirSync(kit).filter((f) => f.endsWith('.ts') && f !== 'kit.ts' && f !== 'tv.default.ts'),
  ...readdirSync(join(kit, 'icons')).map((f) => `icons/${f}`),
]
for (const file of sources.sort()) {
  const text = readFileSync(join(kit, file), 'utf8')
  const components = [...text.matchAll(/export const (\w+) = ui\.component\(/g)].map((m) => m[1])
  const dir = file.includes('/') ? file.slice(0, file.lastIndexOf('/') + 1) : ''
  const uses = [...text.matchAll(/from '\.\/([^']+)'/g)]
    .map((m) => (m[1].startsWith('../') ? m[1].slice(3) : dir + m[1]))
    .filter((f) => f !== 'tv.ts')
  const about = [...text.matchAll(/about: '([^']+)'/g)].map((m) => m[1])
  files[file] = { components, uses: [...new Set(uses)].sort(), ...(about.length ? { about } : {}) }
}
const catalog = {
  kit: 'kit.ts',
  styles: 'theme.css',
  tv: 'tv.default.ts',
  themes: ['grain', 'joinery'],
  files,
}
writeFileSync(join(root, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`)
console.log(`${Object.values(files).reduce((n, f) => n + f.components.length, 0)} components in ${sources.length} files`)
