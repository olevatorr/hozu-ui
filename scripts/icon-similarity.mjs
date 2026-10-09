import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { absolute, shapeToPath } from './shapes.mjs'

const [modules, ...files] = process.argv.slice(2)
const SAMPLES = 64
const NEAR = 0.35
const REVIEW = 0.75

function tokens(d) {
  const out = []
  const re = /([a-zA-Z])|(-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?)/g
  let m
  while ((m = re.exec(d))) out.push(m[1] ?? Number(m[2]))
  return out
}

function arcPoints(x1, y1, rx, ry, phi, large, sweep, x2, y2) {
  if (!rx || !ry) return [[x2, y2]]
  const r = (phi * Math.PI) / 180, cos = Math.cos(r), sin = Math.sin(r)
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2
  const x1p = cos * dx + sin * dy, y1p = -sin * dx + cos * dy
  rx = Math.abs(rx); ry = Math.abs(ry)
  const l = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry)
  if (l > 1) { rx *= Math.sqrt(l); ry *= Math.sqrt(l) }
  const sign = large === sweep ? -1 : 1
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p
  const k = sign * Math.sqrt(Math.max(0, num / (rx * rx * y1p * y1p + ry * ry * x1p * x1p)))
  const cxp = (k * rx * y1p) / ry, cyp = (-k * ry * x1p) / rx
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2, cy = sin * cxp + cos * cyp + (y1 + y2) / 2
  const ang = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)
  const t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
  let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry)
  if (!sweep && dt > 0) dt -= 2 * Math.PI
  if (sweep && dt < 0) dt += 2 * Math.PI
  const pts = []
  for (let i = 1; i <= 16; i++) {
    const t = t1 + (dt * i) / 16
    pts.push([cx + rx * Math.cos(t) * cos - ry * Math.sin(t) * sin, cy + rx * Math.cos(t) * sin + ry * Math.sin(t) * cos])
  }
  return pts
}

export function polylines(d) {
  const t = tokens(d)
  const lines = []
  let line = null, x = 0, y = 0, sx = 0, sy = 0, cmd = '', px = 0, py = 0, i = 0
  const take = () => t[i++]
  const to = (pts) => { for (const p of pts) line.push(p);[x, y] = pts[pts.length - 1] }
  const bez = (p0, p1, p2, p3) => { const pts = []; for (let k = 1; k <= 12; k++) { const s = k / 12, u = 1 - s; pts.push([u * u * u * p0[0] + 3 * u * u * s * p1[0] + 3 * u * s * s * p2[0] + s * s * s * p3[0], u * u * u * p0[1] + 3 * u * u * s * p1[1] + 3 * u * s * s * p2[1] + s * s * s * p3[1]]) } return pts }
  while (i < t.length) {
    if (typeof t[i] === 'string') cmd = take()
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase(), ox = rel ? x : 0, oy = rel ? y : 0
    if (C === 'M') { const nx = take() + ox, ny = take() + oy; line = [[nx, ny]]; lines.push(line); x = sx = nx; y = sy = ny; cmd = rel ? 'l' : 'L'; px = x; py = y; continue }
    if (C === 'Z') { to([[sx, sy]]); px = x; py = y; continue }
    if (C === 'L') { to([[take() + ox, take() + oy]]) }
    else if (C === 'H') { to([[take() + ox, y]]) }
    else if (C === 'V') { to([[x, take() + oy]]) }
    else if (C === 'C') { const a = [take() + ox, take() + oy], b = [take() + ox, take() + oy], e = [take() + ox, take() + oy]; to(bez([x, y], a, b, e)); px = b[0]; py = b[1]; continue }
    else if (C === 'S') { const a = [2 * x - px, 2 * y - py], b = [take() + ox, take() + oy], e = [take() + ox, take() + oy]; to(bez([x, y], a, b, e)); px = b[0]; py = b[1]; continue }
    else if (C === 'Q') { const q = [take() + ox, take() + oy], e = [take() + ox, take() + oy]; to(bez([x, y], [x + (2 / 3) * (q[0] - x), y + (2 / 3) * (q[1] - y)], [e[0] + (2 / 3) * (q[0] - e[0]), e[1] + (2 / 3) * (q[1] - e[1])], e)); px = q[0]; py = q[1]; continue }
    else if (C === 'T') { const q = [2 * x - px, 2 * y - py], e = [take() + ox, take() + oy]; to(bez([x, y], [x + (2 / 3) * (q[0] - x), y + (2 / 3) * (q[1] - y)], [e[0] + (2 / 3) * (q[0] - e[0]), e[1] + (2 / 3) * (q[1] - e[1])], e)); px = q[0]; py = q[1]; continue }
    else if (C === 'A') { const rx = take(), ry = take(), phi = take(); let fl = take(), sw; if (fl > 1) { const s = String(fl); fl = +s[0]; sw = +s[1] } else sw = take(); const ex = take() + ox, ey = take() + oy; to(arcPoints(x, y, rx, ry, phi, fl, sw, ex, ey)) }
    else { i++ }
    px = x; py = y
  }
  return lines
}

function resample(lines) {
  const segs = []
  let total = 0
  for (const l of lines) for (let k = 1; k < l.length; k++) { const len = Math.hypot(l[k][0] - l[k - 1][0], l[k][1] - l[k - 1][1]); if (len > 0) { segs.push([l[k - 1], l[k], len]); total += len } }
  if (!total) return lines.flat().slice(0, SAMPLES)
  const out = []
  let acc = 0, s = 0
  for (let n = 0; n < SAMPLES; n++) {
    const target = (total * (n + 0.5)) / SAMPLES
    while (s < segs.length - 1 && acc + segs[s][2] < target) { acc += segs[s][2]; s++ }
    const [a, b, len] = segs[s], f = Math.min(1, (target - acc) / len)
    out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f])
  }
  return out
}

const chamfer = (A, B) => {
  const one = (P, Q) => P.reduce((s, p) => s + Math.min(...Q.map((q) => Math.hypot(p[0] - q[0], p[1] - q[1]))), 0) / P.length
  return (one(A, B) + one(B, A)) / 2
}

const attrs = (s) => Object.fromEntries([...s.matchAll(/([a-zA-Z][\w:-]*)="([^"]*)"/g)].map((m) => [m[1], m[2]]))
function svgPath(svg) {
  const vb = (svg.match(/viewBox="([^"]+)"/) ?? [, '0 0 24 24'])[1].split(/[\s,]+/).map(Number)
  const parts = []
  for (const m of svg.matchAll(/<(path|circle|rect|line|polyline|polygon|ellipse)\b([^>]*)\/?>/g)) {
    const a = attrs(m[2])
    if (a.stroke === 'none' && a.fill === 'none') continue
    if (m[1] === 'path' && /^M0 0h24v24H0z$/i.test((a.d ?? '').trim())) continue
    try { parts.push(absolute(shapeToPath([m[1], a]))) } catch {}
  }
  return { d: parts.join(' '), vb }
}
const norm = (lines, vb) => lines.map((l) => l.map(([x, y]) => [((x - vb[0]) * 24) / vb[2], ((y - vb[1]) * 24) / vb[3]]))

const libraries = [
  ['Lucide', 'lucide-static/icons', ''],
  ['Feather', 'feather-icons/dist/icons', ''],
  ['Heroicons outline', 'heroicons/24/outline', ''],
  ['Heroicons solid', 'heroicons/24/solid', ''],
  ['Tabler outline', '@tabler/icons/icons/outline', ''],
  ['Material Symbols outlined', '@material-symbols/svg-400/outlined', '-fill.svg'],
]
const library = []
const unreadable = []
for (const [name, dir, skip] of libraries) {
  const full = join(modules, dir)
  if (!existsSync(full)) { console.log(`missing ${name} (${full})`); continue }
  let count = 0
  for (const f of readdirSync(full)) {
    if (!f.endsWith('.svg') || (skip && f.endsWith(skip))) continue
    const { d, vb } = svgPath(readFileSync(join(full, f), 'utf8'))
    if (!d) continue
    const pts = resample(norm(polylines(d), vb))
    if (!pts.length || pts.some((p) => !p.every(Number.isFinite))) { unreadable.push(`${name}:${f}`); continue }
    library.push({ lib: name, icon: f.replace(/\.svg$/, ''), pts })
    count++
  }
  console.log(`${name}: ${count} icons`)
}

const hand = {}
for (const file of files) for (const m of readFileSync(file, 'utf8').matchAll(/export const (\w+) = '([^']+)'/g)) hand[m[1]] = m[2]
let flagged = 0
let review = 0
for (const [name, d] of Object.entries(hand)) {
  const pts = resample(polylines(d))
  const best = library.map((e) => ({ ...e, dist: chamfer(pts, e.pts) })).filter((e) => Number.isFinite(e.dist)).sort((a, b) => a.dist - b.dist).slice(0, 3)
  const band = best[0].dist < NEAR ? 'NEAR' : best[0].dist < REVIEW ? 'look' : 'ok  '
  if (band === 'NEAR') flagged++
  if (band === 'look') review++
  console.log(`${band} ${name.padEnd(10)} ${best.map((b) => `${b.lib}:${b.icon} ${b.dist.toFixed(2)}`).join(' · ')}`)
}
console.log(`unreadable library files: ${unreadable.length}`)
console.log(`${Object.keys(hand).length} hand-drawn icons, ${library.length} library icons, ${flagged} near-identical (< ${NEAR} px mean nearest-point distance on the 24 px grid), ${review} to compare by eye (< ${REVIEW} px)`)
