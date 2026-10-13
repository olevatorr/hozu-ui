import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'

const from = new URL('../../kit/', import.meta.url)
const to = new URL('../ui/', import.meta.url)

rmSync(to, { recursive: true, force: true })
mkdirSync(to, { recursive: true })

for (const name of readdirSync(from)) {
  if (name.endsWith('.ts') && name !== 'tv.default.ts' && name !== 'previews.ts') cpSync(new URL(name, from), new URL(name, to))
}
cpSync(new URL('icons/', from), new URL('icons/', to), { recursive: true })
cpSync(new URL('theme.css', from), new URL('theme.css', to))
writeFileSync(new URL('tv.ts', to), readFileSync(new URL('tv.default.ts', from)))

const kitFile = new URL('kit.ts', to)
const kit = readFileSync(kitFile, 'utf8')
const renamed = kit.replace(/id: '[^']*'/, "id: 'ui'")
if (renamed === kit && !kit.includes("id: 'ui'")) throw new Error('ui/kit.ts: no kit id to set')
writeFileSync(kitFile, renamed)

console.log(`copied the kit into ${to.pathname}`)

const { version } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'))
writeFileSync(new URL('../features/site/kit-version.ts', import.meta.url), `export const kitVersion = '${version}'\n`)
