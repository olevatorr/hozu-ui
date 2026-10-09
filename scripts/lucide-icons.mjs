import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { absolute, shapeToPath } from './shapes.mjs'

const [modules, out, ...names] = process.argv.slice(2)
const pkg = join(modules, 'lucide-static')
const nodes = JSON.parse(readFileSync(join(pkg, 'icon-nodes.json'), 'utf8'))
const version = JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8')).version
const reserved = new Set(['package', 'delete', 'default', 'function', 'class', 'import', 'export', 'new', 'return', 'switch', 'case', 'in', 'for', 'while', 'do', 'if', 'else', 'try', 'catch', 'finally', 'throw', 'var', 'let', 'const', 'void', 'with', 'yield', 'enum', 'interface', 'private', 'public', 'static', 'implements', 'protected'])
const camel = (s) => { const c = s.replace(/-([a-z0-9])/g, (_, x) => x.toUpperCase()); return reserved.has(c) ? `${c}Icon` : c }
const lines = names.sort().map((name) => {
  if (!nodes[name]) throw new Error(`Lucide has no icon "${name}"`)
  return `export const ${camel(name)} = '${nodes[name].map((node) => absolute(shapeToPath(node))).join('')}'`
})
writeFileSync(out, `${lines.join('\n')}\n`)
console.log(`lucide-static ${version}: ${names.length} icons → ${out}`)
