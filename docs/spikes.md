# Spikes (Hozu 0.26.4, 2026-10-09)

Scratch app: a fresh 0.26.4 app (`create-hozu`), Node 22.22.2, Chrome 154. `@hozu/variants@0.26.4` added, `hozu add
kit ui`, daisyUI removed from `app.css`. Commands: `npx hozu check`, `npx hozu get /`, `npx hozu build`,
`npx hozu render`, `npx hozu inspect`, `npx hozu browse`. No dev server was started. Nothing in the framework
repository was touched.

## Results

| # | What I tried | Result | Consequence for the kit |
|---|---|---|---|
| S1 | Kit tokens in `ui/tokens.css`, listed as `ui.kit({ styles })`: semantic colours as `light-dark(oklch(…), oklch(…))`, `--text-metric`, `[data-theme]` and `[data-density]` blocks | `hozu check` clean after `hozu add kit ui --sync`; the sync put `canvas, surface, ink, ink-muted, line, accent, on-accent, danger, on-danger` and `text: ['metric']` into `tv.ts`. Built CSS: `--color-surface:light-dark(oklch(100% 0 0),oklch(21% .006 250))` | Semantic OKLCH tokens with `light-dark()` work with no framework change. Every token addition needs `--sync` (HZ078 otherwise): that is a feature, the kit's sync can run it. |
| S2 | Density by one variable: `[data-density=compact] { --spacing: .2rem }` | Tailwind 4 emits `.px-3{padding-inline:calc(var(--spacing) * 3)}`, so every spacing, width, height and `size-*` utility in that subtree scales | Density modes need no component variants. Caveat: fixed layout widths (`w-64` sidebar) scale too; the kit uses `rem`/`ch` arbitrary values for layout columns. |
| S3 | Native popover menu: `popovertarget` + `popover: 'auto'`, CSS anchor positioning via arbitrary properties `[anchor-name:--menu]`, `[position-anchor:--menu]`, `[position-area:bottom_span-right]`, `[position-try-fallbacks:flip-block]`, `[anchor-scope:--menu]`, `transition-discrete`, `starting:open:opacity-0` | All pass HZ026. `hozu browse / --do 'click "Actions"'` opened the panel (`+ Edit`); the screenshot shows it anchored under its trigger | A dropdown is a pure component (0 B JS). `anchor-scope` keeps one fixed anchor name per component safe when it is used many times. |
| S4 | Customizable select: `class: '[appearance:base-select]'` on `ui.select` | Passes HZ026, renders the base appearance in Chrome 154 | Usable as progressive enhancement. `selectedcontent` is not in Hozu's tag table (`packages/core/src/ir/dom-data.ts`), so the richer form needs a framework change. |
| S5 | Caller override on a kit Button: `class: 'w-full bg-red-500 p-8'` | `HZ072 "bg-red-500" sets background-color, which ui.Button owns` and `HZ079 … "bg-red-500" always wins`. **`p-8` passed silently**, although the Button owns `padding-inline` / `padding-block` (from `px-3 py-2`): the shorthand `padding` is a different property name, and Tailwind sorts `p-*` before `px-*`, so `p-8` has no effect | A real gap in HZ072: owned properties should be compared after shorthand expansion. Reported in the proposal (framework change F7). |
| S6 | `hozu render ui.Button --variant intent=destructive` | Prints the HTML, the final class and `owned align-items background-color … padding-block padding-inline` | The owned list is the machine-readable contract the kit's docs and sync can use. |
| S7 | A kit `Table` whose prop is `rows: z.array(z.object({…}))`, rendered with `ui.each(props.rows, 'id', …)` and `ui.format.number(r.total, { style: 'currency', currency: 'TWD' })` | Clean; `hozu inspect ui.Table` prints `props rows: { id: string, name: string, total: number }[]`. `hozu get /` prints `王小明 NT$1,280.00` (site `lang: 'en'`) | Components can take arrays of rows. Each row shape is still written per component. |
| S8 | A **generic** kit `Grid` with `columns: z.array(Column)` as a prop and `props.columns.map(…)` in the render | `HZ059 The render of ui.Grid does not build under reference props: Method "map" cannot run on a reference` | A render is built with every prop as a reference, so a component cannot take structured configuration. |
| S9 | The same with `ui.each(props.columns, 'key', (c) => ui.td({}, [r[c.key]]))` | `HZ059 Reference "item.key" was evaluated as JavaScript` | Dynamic keys from a reference are impossible by design (good). |
| S10 | The same column list as a **module constant** in a view: `columns.map((c) => …)` and `r[c.key]` inside `ui.each(rows, …)` | Clean (types too, with `as const`); renders `客戶 金額 王小明 NT$1,280.00 …` | Record-time structured config works in views and in `part()`s (S11), not in components. This is the gap breakthrough idea 1 closes. |
| S11 | A `part((cols: readonly Col[]) => …)` called with the constant column list | Clean (ADR 0045 G evaluates literal operands at record time) | Today's workaround, but a part is invisible to the catalog and HZ080 warns when two features share it. |
| S12 | Query output schema with `.meta({ title: '金額', format: 'currency' })` | The IR keeps it: `"total":{"format":"currency","title":"金額","type":"number"}` (`hozu inspect site --json`) | Labels and formats can be derived from the schema the IR already stores (idea 1). |
| S13 | A same-geometry skeleton today: one `part((rows, cls) => ui.tbody({ class: cls }, [ui.each(rows, 'id', …)]))` used as `ready: (rows) => body(rows, '')` and `pending: body(sample, 'skeleton')`, where `skeleton` is an `@utility` in the kit's `tokens.css` | Clean; `--sync` added `classGroups: { skeleton: ['skeleton'] }` | The pending branch can render the ready template with sample rows, so the swap cannot shift layout. Idea 3 derives this. |
| S15 | A **closed token set**: the kit's `@theme` starts with `--color-*: initial;` and `--radius-*: initial;`, then defines only semantic colours and `--radius-control` / `--radius-card`. A view writes `text-blue-600 rounded-lg bg-surface rounded-card` | `HZ026 Classes "text-blue-600", "rounded-lg" produce no CSS`; `bg-surface` and `rounded-card` pass | Off-system colours and radii become build errors through an **existing** diagnostic, with no new rule. The fix text is generic ("Fix the class name"); a nearest-token suggestion is framework change F6. |
| S16 | The proposal's `Button`, `Metric` and `Dialog` sketches copied verbatim (minus the proposed `about`), used with zh-Hant text, a `commandfor` delete button and a `Mod+Enter` confirm | `hozu check`: 0 errors, **1 warning `HZ076 ui.Dialog sets its own outer margin with "m-auto"`**. `hozu browse / --do 'click "刪除"'` opened the modal (screenshot: centred, dark mode, red `+4.2%` as Taiwan's "up") | The sketches are real code. HZ076 is a false positive for a top-layer root: Tailwind's preflight removes the UA `margin: auto` of `dialog`, so centring needs it (framework change F7). `backdrop:bg-ink/40` turns into a light grey wash in dark mode, because `ink` flips: the kit needs a non-flipping `scrim` token. |
| S14 | A query without `failed` in a view | `TS2741` and `HZ004 … can fail with "Unexpected" but the view does not render it` | Every data region already must design its error state; the kit should give that state a component. |

## Contrast of the candidate palettes (script in the scratch directory)
OKLCH → sRGB, WCAG 2 ratio and APCA Lc (SAPC 0.0.98G-4g constants). Selected rows:

| Palette / theme | Pair | WCAG 2 | APCA Lc |
|---|---|---|---|
| Grain light | ink on surface | 17.71 | 105 |
| Grain light | ink-muted (L 0.48) on surface | 6.53 | 82 |
| Grain light | ink-faint (L 0.58) on surface | **4.28** | 70 |
| Grain light | on-accent on accent (L 0.49 C 0.16 h 262) | 6.25 | −84 |
| Grain dark | ink-muted (L 0.73) on surface (L 0.20) | 7.57 | **−54** |
| Grain dark | ink-muted (L 0.78) on surface | 9.05 | −63 |
| Joinery light | signal red (L 0.64 C 0.22 h 35) as text on paper | **3.18** | 53 |
| Joinery light | signal-text (L 0.53) on paper | 4.99 | 67 |
| Console dark | ink-muted (L 0.68) on canvas | 6.86 | **−46** |

- WCAG 2 passes every dark-mode muted text above while APCA marks it weak: the known dark-mode overestimate of the
  WCAG 2 formula. The kit uses L ≥ 0.78 for muted text on dark surfaces.
- `ink-faint` is reserved for placeholders and disabled text (exempt from 1.4.3), and a check should enforce that.
- A signal red that works as a fill fails as text: the palette needs a separate `-text` step. A per-element contrast
  check (idea 2) catches exactly this class of mistake.
