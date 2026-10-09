const n = (v) => Number(Number(v).toFixed(3)).toString()

export function shapeToPath([tag, a]) {
  if (tag === 'path') return a.d
  if (tag === 'circle') {
    const [cx, cy, r] = [+a.cx, +a.cy, +a.r]
    return `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0`
  }
  if (tag === 'ellipse') {
    const [cx, cy, rx, ry] = [+a.cx, +a.cy, +a.rx, +a.ry]
    return `M${n(cx - rx)} ${n(cy)}a${n(rx)} ${n(ry)} 0 1 0 ${n(2 * rx)} 0a${n(rx)} ${n(ry)} 0 1 0 ${n(-2 * rx)} 0`
  }
  if (tag === 'line') return `M${n(a.x1)} ${n(a.y1)}L${n(a.x2)} ${n(a.y2)}`
  if (tag === 'polyline' || tag === 'polygon') {
    const p = a.points.trim().split(/[\s,]+/).map(Number)
    let d = `M${n(p[0])} ${n(p[1])}`
    for (let i = 2; i < p.length; i += 2) d += `L${n(p[i])} ${n(p[i + 1])}`
    return tag === 'polygon' ? `${d}z` : d
  }
  if (tag === 'rect') {
    const x = +(a.x ?? 0), y = +(a.y ?? 0), w = +a.width, h = +a.height
    const rx = Math.min(+(a.rx ?? a.ry ?? 0), w / 2), ry = Math.min(+(a.ry ?? a.rx ?? 0), h / 2)
    if (!rx) return `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}z`
    return `M${n(x + rx)} ${n(y)}h${n(w - 2 * rx)}a${n(rx)} ${n(ry)} 0 0 1 ${n(rx)} ${n(ry)}v${n(h - 2 * ry)}a${n(rx)} ${n(ry)} 0 0 1 ${n(-rx)} ${n(ry)}h${n(-(w - 2 * rx))}a${n(rx)} ${n(ry)} 0 0 1 ${n(-rx)} ${n(-ry)}v${n(-(h - 2 * ry))}a${n(rx)} ${n(ry)} 0 0 1 ${n(rx)} ${n(-ry)}z`
  }
  throw new Error(`unsupported element ${tag}`)
}

const num = '-?(?:\\d+\\.?\\d*|\\.\\d+)(?:e-?\\d+)?'
export const absolute = (d) => d.trim().replace(new RegExp(`^m\\s*(${num})[\\s,]*(${num})\\s*`), (_, x, y, offset, all) => {
  const rest = all.slice(_.length)
  return `M${x} ${y}${rest && !/^[a-zA-Z]/.test(rest) ? 'l' : ''}`
})
