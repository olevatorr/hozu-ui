import { readFileSync } from 'node:fs'
const css = readFileSync(process.argv[2], 'utf8')
const block = (sel) => { const i = css.indexOf(sel); return css.slice(css.indexOf('{', i) + 1, css.indexOf('\n}', i)) }
const parse = (src) => Object.fromEntries([...src.matchAll(/--color-([a-z-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]))
const base = parse(block('@theme {')), join = { ...base, ...parse(block('[data-theme="joinery"]')) }
const ok = (s) => { const m = s.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)/); return m ? [+m[1], +m[2], +m[3]] : null }
const pick = (v, mode) => { const m = v.match(/^light-dark\((oklch\([^)]*\)),\s*(oklch\([^)]*\))\)$/); return ok(m ? m[mode === 'light' ? 1 : 2] : v) }
const toRgb = ([L, C, h]) => { const a = C * Math.cos(h * Math.PI / 180), b = C * Math.sin(h * Math.PI / 180); const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3; return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map((v) => Math.min(1, Math.max(0, v))).map((v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)) }
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const Y = (rgb) => { const [r, g, b] = rgb.map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
const wcag = (f, b) => { const [x, y] = [Y(f), Y(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
const apca = (f, b) => { const Ys = (c) => { const [r, g, bl] = c.map((v) => v ** 2.4); return 0.2126729 * r + 0.7151522 * g + 0.072175 * bl }; const cl = (y) => (y > 0.022 ? y : y + (0.022 - y) ** 1.414); const yt = cl(Ys(f)), yb = cl(Ys(b)); let s; if (yb > yt) { s = (yb ** 0.56 - yt ** 0.57) * 1.14; s = s < 0.1 ? 0 : s - 0.027 } else { s = (yb ** 0.65 - yt ** 0.62) * 1.14; s = s > -0.1 ? 0 : s + 0.027 } return Math.round(s * 100) }
const mix = (a, b, t) => a.map((v, i) => v * t + b[i] * (1 - t))
const pairs = [
  ['ink', 'canvas', 4.5, 'body text'], ['ink', 'surface', 4.5, 'card text'], ['ink-muted', 'surface', 4.5, 'secondary text'], ['ink-muted', 'surface-sunken', 4.5, 'secondary on sunken (table footer, dialog foot)'],
  ['ink-faint', 'surface', 4.5, 'placeholder / disabled (exempt)'], ['on-accent', 'accent', 4.5, 'primary button'], ['accent-text', 'surface', 4.5, 'link / accent text'], ['accent-text', 'accent-subtle', 4.5, 'accent badge'],
  ['on-danger', 'danger', 4.5, 'destructive button'], ['danger-text', 'surface', 4.5, 'error text'], ['danger-text', 'danger-subtle', 4.5, 'danger badge'], ['success-text', 'success-subtle', 4.5, 'success badge'],
  ['warning-text', 'warning-subtle', 4.5, 'warning badge'], ['info-text', 'info-subtle', 4.5, 'info badge'], ['canvas', 'ink', 4.5, 'current pill / list link (text-canvas on bg-ink)'],
  ['line-strong/40', 'surface', 3, 'input border at 40 % (first version)'], ['line-strong', 'surface', 3, 'input / button border (non-text 1.4.11), fixed'], ['focus', 'surface', 3, 'focus ring (non-text)'], ['line', 'surface', 1, 'divider (decorative)'],
]
const rows = []
for (const [theme, t] of [['Grain', base], ['Joinery', join]]) for (const mode of ['light', 'dark']) for (const [fg, bg, min, use] of pairs) {
  const b = toRgb(pick(t[bg], mode)); let f
  if (fg.includes('/')) { const [n, a] = fg.split('/'); f = mix(toRgb(pick(t[n], mode)), b, +a / 100) } else f = toRgb(pick(t[fg], mode))
  const w = wcag(f, b), ap = apca(f, b)
  rows.push(`| ${theme} | ${mode} | \`${fg}\` on \`${bg}\` | ${use} | ${w.toFixed(2)} | ${ap} | ${min === 1 ? 'n/a' : w >= min ? 'pass' : (fg === 'ink-faint' ? 'exempt' : '**fail**')} |`)
}
console.log(rows.join('\n'))
