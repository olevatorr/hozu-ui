# Proposal: the official Hozu UI kit

Status: proposal for the owner, 2026-10-09. Evidence: [research.md](research.md) (external, with sources) and
[spikes.md](spikes.md) (experiments on Hozu 0.26.4). Paths without a repository name are in the framework repository
(`Tenon/`).

## 1. Goals and non-goals

**Goals**
1. An agent that cannot see the screen builds a back office or a storefront that looks designed, by choosing
   components by **intent** (a destructive confirmation, a metric with a trend), not by colour or pixel.
2. The look survives agents: a theme change is one file; an off-system colour, radius or override is a build error
   or a counted exception, never a silent drift.
3. Phases ① and ② ship **0 B of client JavaScript** apart from the framework's own (native dialog, popover, anchor
   positioning, `details`, links for table state). Charts are the one declared client component.
4. Every state a data region can be in (first load, empty, failed, refreshing) has a kit answer, and the answers
   keep layout still (ADR 0067).
5. Traditional Chinese is a first-class target: CJK type, Taiwan's market colours, kit strings translatable.
6. Copy-into-the-app distribution that can still be upgraded (owner's decision).

**Non-goals**
- A React/Vue port, a web-component wrapper set, or a Figma library in this phase.
- A runtime npm dependency for the kit's components (the kit lives in the app's `ui/`).
- A global notice store, more than one machine per feature, or components that fetch (declined in ADR 0069 C and
  trial 0025; see §6 for notices).
- Phase ③ before its behaviour-layer ADR (owner's sequencing; ADR 0045 J).

## 2. Breakthrough ideas (only make sense in Hozu)

React kits learn a page by running it. Hozu knows the whole page at build time: every component use with its
variant and extra classes (`UseIR`, `packages/core/src/ir/types.ts:163`), every class on every element, every
token, every query's output JSON Schema with its `.meta()` (spike S12), every branch of every data region, and every
machine's states. The four ideas below spend that knowledge.

### Idea 1 — Record-time specs: views derived from the data schema

**What.** A component may declare a `spec`: structured, literal configuration evaluated at record time (columns of
a table, series of a chart, fields of a description list). Together with a kit helper that reads a query's output
schema, the column labels, alignment and number formats come from the schema the IR already holds:

```ts
// features/orders/model.ts: the schema is the single source of labels and formats
export const Order = z.object({
  id: z.string(),
  customer: z.string().meta({ title: '客戶' }),
  total: z.number().meta({ title: '金額', format: 'currency' }),
  placedAt: z.string().meta({ title: '下單時間', format: 'date-time' }),
  status: OrderStatus.meta({ title: '狀態' }),
})

// features/orders/views.ts
ui.query(listOrders, { page: search.page, sort: search.sort }, {
  ready: (rows) => ui.use(DataTable, {
    spec: { columns: columnsOf(Order, ['customer', 'total', 'placedAt', 'status']), currency: 'TWD' },
    props: { rows, sort: search.sort },
    slots: { empty: ui.use(EmptyState, { props: { title: '還沒有訂單' } }) },
  }),
  failed: { Unexpected: () => ui.use(Problem, { props: { title: '訂單載入失敗' } }) },
})
```

**Why it is new.** Schema-driven tables exist (admin generators, json-render), but they interpret a schema at run
time and ship the interpreter. Here the spec is expanded at record time into plain `ui.th`/`ui.td` nodes: the IR
equals a hand-written table, 0 B of JS, and every cell stays type-checked (`r[c.key]` with a literal key, spike S10).
A renamed field breaks the build, not the screen.

**How it works today.** Half of it already works: a constant column list `.map`s at record time in a view or a
`part()` (S10, S11), and `.meta({ title, format })` reaches the IR (S12). What does not work is the same inside a
component: a render is built with every prop as a reference, so `props.columns.map` is HZ059 (S8, S9). Today the
kit can ship `DataTable` as **parts** (`tableHead(columns)`, `tableBody(rows, columns)`), at the cost of HZ080 when
two features share them and of invisibility in the catalog.

**Framework change (F2).** `ui.component({ spec: schema, … })` and `ui.use(C, { spec: {…} })`: a literal-only,
schema-validated input that the render reads as plain JavaScript values (like a variant, but structured). The render
is recorded once per distinct spec, like a variant combination. `columnsOf(schema, keys)` is kit code (pure JS over a
Zod schema at record time), not framework code.

**Principles touched.** Principle 1 (one form per concept): `variant` becomes a special case of `spec` (a
string-valued spec that picks classes); the ADR must decide whether to keep both names or fold `variant` into `spec`
later. Principle 4 holds: the IR still holds no function. Principle 3 improves: columns name fields through the
schema's keys, which TypeScript checks against the row type.

**Risks.** Type inference for `r[c.key]` across a generic component (the column keys must be `keyof Row`); many
distinct specs grow the IR (bounded by real uses); agents might put data into `spec` (HZ071's logic extends: a
reference in `spec` is an error with the same fix).

### Idea 2 — The design check: the IR as a design linter

**What.** `hozu check` verifies design rules that today need a person looking at the screen, over **every element ×
every variant × every theme**, because all of them are static data:

| Rule | How the IR decides it | Severity |
|---|---|---|
| Text contrast ≥ WCAG 2 AA (4.5, or 3.0 for ≥ 18.66 px bold / 24 px) in light and dark | the element's text colour class and the nearest ancestor background class (or the component's own), resolved through the theme's `light-dark()` tokens; APCA Lc printed as a second number | error in the kit, warning in apps |
| Target size ≥ 24 × 24 px (WCAG 2.2 2.5.8) for buttons, links in toolbars, checkboxes | size classes (`h-*`, `size-*`, padding + line height) at each density | warning |
| Every form control has a name (label `for`, `aria-label`, or a `Field` wrapper) | the element tree and ids | error |
| At most one `intent: 'primary'` action per form, dialog and page header | `UseIR.variant` within one subtree | warning |
| A destructive action confirms (a `commandfor` dialog, or a mutation behind a second step) | `intent: 'destructive'` uses + their `on` / `commandfor` | warning |
| Numeric table cells and metrics use `tabular-nums` and align right | the cell classes + the row schema's `type: number` | warning |
| A list region renders something for `[]` | the `ready` branch of a query whose output is an array: a `ui.each` with no `length === 0` branch | warning |
| No CJK text under 12 px; no letter-spacing on `:lang(zh-Hant)` body text | text size classes + `site.locales` | warning |
| Off-system colour, radius, shadow | **already HZ026** once the kit resets Tailwind's defaults (spike S15) | error |

**Why it is new.** Design linters today read Figma files or source text (Stylelint, Figma lint) and cannot see which
background a text actually sits on, which variant is chosen, or the dark theme. Runtime auditors (axe) see one state
of one page. Hozu sees all states of all pages at build time, so "every Badge tone in dark mode passes AA" is a
proof, not a sample. The spike shows the value: the "Joinery" signal red passes as a fill but fails as text
(3.18:1), and a WCAG-2-passing dark muted grey is APCA Lc −54 (spikes.md, contrast table).

**How it works today.** The closed token set (S15) and HZ072/HZ079 already run. The contrast, size and naming rules
need the CSS stage (`@hozu/css`, where HZ072–HZ079 already resolve properties) plus the resolved token values.

**Framework change (F5).** New codes (HZ094 onward), each with a registry entry, rule, fix and mistake-catalog case
(CLAUDE.md workflow rules). Fixes name a token: "use `text-danger-text` (4.99:1) instead of `text-danger` (3.18:1)".

**Principles.** Principle 7 (structured diagnostics) is the vehicle. No principle bends.

**Risks.** False positives where the background is an image or a client component's canvas (skip elements under
those; say so in the cause). Ancestor backgrounds through `vars` or arbitrary values (resolve when literal, skip
otherwise). Rule creep: start with contrast, naming and empty lists; measure before adding more.

### Idea 3 — Calm data regions: skeletons and states derived from the ready template

**What.** A data region's `pending` is derived from its `ready` template, rendered with placeholder data and the
kit's `skeleton` treatment, so the skeleton has the ready geometry by construction and the swap shifts nothing:

```ts
ui.query(listOrders, input, {
  pending: ui.skeleton({ rows: 5 }),        // proposed F9: the ready branch with placeholder rows
  ready: (rows) => ordersTable(rows),
  failed: { Unexpected: () => ui.use(Problem, { props: { title: '訂單載入失敗' } }) },
})
```

**Why it is new.** In React a skeleton is a second, hand-drawn component that drifts from the real one; layout shift
is found by Lighthouse after the fact. Here the ready branch is data, so the skeleton is a projection of it, and
`hozu browse` already reports layout shift per step (ADR 0067 C2), so "0 shift on first load" becomes something an
agent proves.

**How it works today.** The pattern works with no framework change (S13): one `part` used as
`ready: (rows) => body(rows, '')` and `pending: body(sample, 'skeleton')`, with `skeleton` an `@utility` in the kit's
`tokens.css` that hides text behind bars. The kit ships the utility, `EmptyState` and `Problem`, and the
`patterns`-style recipe.

**Framework change (F9).** `ui.skeleton({ rows? })` as a `pending` value: the build renders the region's ready branch
with placeholder values (strings from `maxLength` / `examples` in the schema, numbers as `0,000`), `ui.each` repeated
`rows` times, under `class="skeleton"` and `aria-hidden`. Opt-in (principle 2), derived (principle 8).

**Risks.** Placeholder text length versus real text (use schema `examples` when present); conditional branches in the
ready template (render the first branch); C1 means `pending` shows only before the first answer, so the value is in
streamed SSR and `runs: 'browser'` queries, which is exactly where it is visible.

### Idea 4 — Verified behaviour: component machines with contracts (phase ③)

**What.** A combobox, date picker or command palette declares its behaviour as a statechart (like Zag.js, research
§2), owned by the framework and run by the machine interpreter Hozu already ships. Its keyboard map and states are
in the IR, so the kit ships **contracts** for them (given / when / expect) and `hozu browse` keyboard steps as
acceptance, and the app's lock records which component machine version it uses.

**Why it is new.** Zag and React Aria test behaviour inside the library; the app gets no evidence. In Hozu the same
contracts that review an app's own transitions (`hozu check`, the lock) would cover the kit's widgets in that app,
and a sync that changes a widget's behaviour shows up as a lock diff for the owner to accept.

**How it works today.** It does not: a component "keeps no state of its own and has no hidden transition" (ADR 0045
C, `:837`), and behaviour beyond native is a client component (ADR 0045 J). Today phase ③ would be hand-written
client modules, unverified.

**Framework change (F10).** The behaviour-layer ADR the owner already asked for. It **bends ADR 0045 C** (a component
gains private, ephemeral state) and must keep "one machine per feature" for app state (component machines hold only
UI state: open, highlighted index, typed query; never data, never sent to the server). Stop-and-raise item.

**Risks.** Bytes (P7 budget 9 KiB, ADR 0064): the interpreter exists, but each component machine's IR ships to
pages that use it; a lazy chunk per machine, like `keys.js`. Scope creep into a general client-state system.

## 3. Architecture

### 3.1 Files in the app (after `hozu add kit ui --from official`)
```
ui/
  kit.ts          ui.kit({ id: 'ui', components: [...], styles: new URL('./theme.css', import.meta.url) })
  tv.ts           generated (tailwind-merge config between markers, HZ078)
  theme.css       @theme: the closed token set + [data-theme] blocks + [data-density] + @utility skeleton
  button.ts …     one module per component (buttonStyles shared by Button and LinkButton)
  kit.lock.json   provenance: { "from": "official@0.1.0", "files": { "button.ts": "<sha256 of the copied text>" } }
```

### 3.2 Tokens: a closed, role-named set
- **Reset, then define** (S15): `--color-*: initial; --radius-*: initial; --shadow-*: initial;` then only the
  roles below. An agent writing `bg-blue-600` gets HZ026; the app can still add tokens in its own `app.css` `@theme`
  (explicit, principle 2).
- **Colour roles** (Primer's grammar, Radix's "step is the use", daisyUI's pairs), each `light-dark(oklch(…),
  oklch(…))`:

| Group | Tokens | Use |
|---|---|---|
| Surfaces | `canvas`, `surface`, `surface-sunken`, `surface-raised` | page, cards, wells, overlays |
| Text | `ink`, `ink-muted`, `ink-faint` | primary, secondary, placeholder/disabled only |
| Lines | `line`, `line-strong`, `focus` | borders, dividers, focus ring |
| Overlay | `scrim` (does not flip with the mode) | dialog and sheet backdrops (spike S16: `ink/40` turns light grey in dark mode) |
| Action | `accent`, `on-accent`, `accent-subtle`, `accent-text` | primary action fill, its text, tinted background, accent as text |
| Status | `danger`, `warning`, `success`, `info`, each with `-subtle`, `-text`, `on-` | fills, tinted backgrounds, text-safe variants |
| Trend | `up`, `down`, `flat` | metric deltas; **Taiwan theme: up = red, down = green** |
| Data | `chart-1` … `chart-8` | categorical series, equal lightness, yellow last |

- **Other tokens:** `--radius-control`, `--radius-card`, `--radius-pill` (role-named, daisyUI); `--shadow-overlay`
  only (borders do elevation elsewhere); `--text-*` steps below; `--animate-*` limited to `skeleton` pulse and the
  overlay enter/leave (Hozu owns data motion, ADR 0067 C3).
- **Themes** are blocks in `theme.css`: `[data-theme=ledger]`, `[data-theme=joinery]`; dark is `color-scheme`, not a
  theme. **Density** is `[data-density=compact|comfortable]` setting `--spacing` (S2): no density variants anywhere.
- **Export:** `hozu …` can print the tokens as DTCG 2025.10 JSON for Figma (research §3); never imported back.

### 3.3 Variants and props: the kit's three rules
1. **Variants are intents, not looks:** `intent: 'primary' | 'secondary' | 'quiet' | 'destructive'`, `size: 'sm' | 'md'`.
   No colour names in variant values.
2. **Data-driven looks are props + attributes:** `tone` from data → `'data-tone': props.tone` and
   `data-[tone=danger]:bg-danger-subtle` (what both trial kits found; HZ071 enforces it).
3. **State through the attribute that announces it:** `aria-busy`, `aria-invalid`, `aria-current`, `aria-sort`,
   `aria-expanded`, `open` (ADR 0045 D). The kit adds Zag's contract where a component has parts:
   `data-part="trigger|panel|item"` on inner elements, so app CSS and DevTools target parts by name.

### 3.4 Distribution and sync
| Command | Today | Proposed (F4) |
|---|---|---|
| `hozu add kit ui` | empty `kit.ts` + `tv.ts` (`kits.ts:102`) | unchanged |
| `hozu add kit ui --from official [--theme ledger]` | — | copies the official kit's files, writes `kit.lock.json`, runs the tv sync, adds `@hozu/variants` |
| `hozu add component ui DataTable --from official` | — | copies one component (and the components it uses) |
| `hozu add kit ui --sync` | regenerates `tv.ts` (`kits.ts:115`) | also, when `kit.lock.json` exists: files whose hash equals the lock are replaced by the new version; files changed locally are left alone and listed under `todo` with a three-way diff path; `--dry-run` prints the plan |

- The official source is a versioned package read **at install time only** (`@hozu/ui-kit`, reserved in ADR 0045);
  nothing from it is imported at run time.
- A sync that changes a component's render shows in `hozu check` as changed `sourceHash`es
  (`types.ts:160`), and in phase ③ as a lock diff (idea 4).

### 3.5 How agents use it
- **Catalog with intent (F1):** `ui.component({ about: 'The one primary or secondary action of a form or toolbar.' })`
  printed by `hozu docs components` (today it prints `ui.Button <button> intent`, spike). A ≤ 4 KB topic `hozu docs ui`
  ships with the kit: the intent table ("a destructive confirmation → `ConfirmDialog`"), the token roles, the three
  rules above.
- **Guards:** HZ026 (closed tokens), HZ071 (variants literal), HZ072–HZ079 (ownership), HZ076 (no outer margin),
  the design check (idea 2). Overrides are counted per component by `hozu check` already (ADR 0045 E).
- **DevTools:** the Design panel maps values to theme utilities and shows tokens first in Builder (ADR 0058 B2), so a
  closed, role-named set makes a person's request read "use `accent`", not "use `#2563eb`".
- **Measures** (ADR 0045 acceptance 6, now possible): `!` overrides per change, raw `ui.button`/`ui.input` where a kit
  component exists, HZ026 count per change.

### 3.6 Text and i18n
- Today every kit string is a prop (`closeLabel`, `previousLabel`, with English defaults in the schema).
- **F3, kit messages** (ADR 0045 deferred G5): `ui.kit({ messages })` with `en` and `zh-Hant` built in, chosen by the
  page locale like feature messages (`topics/i18n.md`), so `Pagination` says 「上一頁」 without every caller passing it.

## 4. Components

Form: the real authoring form (ADR 0045 A, B). `F2` marks sketches that need `spec`. Every component below is pure
(0 B JS) unless marked client.

### Phase ① Basics (what both trial apps built)

| Component | Tag | Variants | Props (runtime) | Slots / children / events | Notes |
|---|---|---|---|---|---|
| `Button` | `button` | `intent`, `size` | `type`, `name`, `value`, `disabled`, `busy`, `label` (aria), `commandfor`, `command` | `icon` slot, children, `press` | `keys` via `ui.use` |
| `LinkButton` | `a` | same `buttonStyles` | `href` (from `ui.link` at the use), `current` | `icon`, children | one look, two tags |
| `Input`, `Textarea` | `input`, `textarea` | `size` | `id`, `name`, `value`, `type`, `required`, `invalid`, `describedby`, `placeholder`, `autocomplete` | `input` | textarea `field-sizing-content` |
| `Select` | `select` | `size` | `id`, `name`, `required`, `invalid`, `disabled` | children (`ui.option`), `change` | `[appearance:base-select]` progressive (S4) |
| `Checkbox`, `Switch`, `Radio` | `label` | — | `name`, `value`, `checked`, `disabled`, `label` | `change` | Switch = checkbox + `role="switch"` |
| `Field` | `div` | `layout: stacked \| inline` | `for`, `label`, `hint`, `error`, `errorId`, `required` | `control` slot | error shown with `:user-invalid` too |
| `Badge` | `span` | `shape: pill \| square` | `tone` (data-driven), `label` | — | replaces Badge + StatusBadge |
| `Card` | `section` | `pad: normal \| none` | `title`, `description` | `actions`, children | container query root (`@container`) |
| `PageHeader` | `header` | — | `title`, `description` | `actions`, `breadcrumb` | one `primary` allowed (idea 2) |
| `Metric` (KPI) | `section` | `size` | `label`, `value` (formatted string today; F2: `spec.format`), `delta`, `trend: up \| down \| flat`, `period` | `spark` slot | trend colour from tokens, `tabular-nums` |
| `EmptyState` | `div` | — | `title`, `body` | `action` slot (one CTA) | Polaris rule |
| `Problem` | `div` | — | `title`, `body`, `code` | `action` (retry link) | for `failed` branches (HZ004) |
| `Notice` | `div` | `tone: info \| success \| warning \| danger` | `message` | `dismiss` event | `role="status"`; see §6 |
| `Dialog` | `dialog` | `size: sm \| md \| lg`, `side: center \| end` (sheet) | `id`, `open`, `title`, `description`, `closeLabel` | `footer`, children, `close` | native `commandfor` open; `ui.dialog({ open })` when bound |
| `ConfirmDialog` | `dialog` | `intent: destructive \| primary` | `id`, `title`, `body`, `confirmLabel`, `cancelLabel`, `busy` | `confirm` | the "destructive confirmation" intent |
| `Tabs` (link tabs) | `nav` | — | `label` | children of `Tab` | `Tab` = `a` with `current` → `aria-current` |
| `Avatar` | `span` | `size` | `name`, `src` | — | initials fallback, `contrast-color()` on a data colour |
| `Icon` | `svg` | `size` | `d` | — | path data from a constant set |
| `Skeleton` (utility) | — | — | — | — | `@utility skeleton` in `theme.css` (S13) |
| Layout: `Stack`, `Cluster`, `Sidebar`, `Switcher`, `Grid` | `div` | `gap: 1…8`, `align` | — | children | Every Layout; no breakpoints for agents to pick |

Sketches:

```ts
// ui/button.ts
export const buttonStyles = tv({
  base: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-50 aria-busy:cursor-wait',
  variants: {
    intent: {
      primary: 'bg-accent text-on-accent hover:bg-accent/90',
      secondary: 'border border-line bg-surface text-ink hover:bg-surface-sunken',
      quiet: 'text-ink-muted hover:bg-surface-sunken hover:text-ink',
      destructive: 'bg-danger text-on-danger hover:bg-danger/90',
    },
    size: { sm: 'h-8 px-3 text-sm', md: 'h-9 px-4 text-sm' },
  },
  defaultVariants: { intent: 'secondary', size: 'md' },
})

export const Button = ui.component({
  tag: 'button',
  styles: buttonStyles,
  about: 'An action in a form, dialog or toolbar; one primary per form.',          // F1
  props: z.object({
    type: z.enum(['button', 'submit']).default('button'),
    disabled: z.boolean().default(false),
    busy: z.boolean().default(false),
    label: z.string().optional(),
    commandfor: z.string().optional(),
    command: z.enum(['show-modal', 'close', 'request-close', 'toggle-popover', 'show-popover', 'hide-popover']).optional(),
  }),
  slots: ['icon'],
  children: true,
  events: ['press'],
  render: ({ props, slots, children, on }) =>
    ui.button({ type: props.type, disabled: props.disabled, 'aria-busy': props.busy, 'aria-label': props.label,
      commandfor: props.commandfor, command: props.command, on: { click: on.press } }, [slots.icon, ...children]),
})

// a use
ui.use(Button, { variant: { intent: 'primary' }, props: { type: 'submit', busy: is(['saving']) }, keys: ['Mod+s'] }, ['儲存'])
```

```ts
// ui/metric.ts
const styles = tv({
  slots: {
    base: '@container rounded-card border border-line bg-surface p-4',
    label: 'text-sm text-ink-muted',
    value: 'mt-1 text-metric font-semibold tabular-nums text-ink',
    foot: 'mt-2 flex items-center gap-2 text-sm text-ink-muted',
    delta: 'tabular-nums font-medium data-[trend=up]:text-up data-[trend=down]:text-down data-[trend=flat]:text-ink-muted',
  },
})

export const Metric = ui.component({
  tag: 'section',
  styles,
  props: z.object({
    label: z.string(),
    value: z.string(),
    delta: z.string().default(''),
    trend: z.enum(['up', 'down', 'flat']).default('flat'),
    period: z.string().default(''),
  }),
  slots: ['spark'],
  render: ({ props, slots, classes }) =>
    ui.section({ 'aria-label': props.label }, [
      ui.p({ class: classes.label }, [props.label]),
      ui.p({ class: classes.value }, [props.value]),
      ui.p({ class: classes.foot }, [
        props.delta !== '' && ui.span({ class: classes.delta, 'data-trend': props.trend }, [props.delta]),
        props.period,
      ]),
      slots.spark,
    ]),
})

// a use: the caller formats (ui.format is allowed in a view) and passes the spark as an SVG node
ui.use(Metric, { props: { label: '本月營收', value: ui.format.number(q.revenue, { style: 'currency', currency: 'TWD',
  maximumFractionDigits: 0 }), delta: ui.format.number(q.change, { style: 'percent', signDisplay: 'always' }),
  trend: q.trend, period: '較上月' }, slots: { spark: sparkSvg(q.history) } })
```

```ts
// ui/dialog.ts: native, opened by a commandfor button (no JS) or bound with ui.dialog({ open }) in the caller's view
const styles = tv({
  slots: {
    base: 'm-auto w-[min(32rem,calc(100vw-2rem))] rounded-card border border-line bg-surface-raised p-0 text-ink shadow-overlay backdrop:bg-scrim opacity-0 transition-[opacity,display,overlay] transition-discrete open:opacity-100 starting:open:opacity-0',
    head: 'border-b border-line px-6 py-4', title: 'text-lg font-semibold', body: 'space-y-4 px-6 py-5',
    foot: 'flex justify-end gap-2 border-t border-line bg-surface-sunken px-6 py-3',
  },
  variants: { size: { sm: { base: 'w-[min(24rem,calc(100vw-2rem))]' }, md: {}, lg: { base: 'w-[min(48rem,calc(100vw-2rem))]' } } },
  defaultVariants: { size: 'md' },
})

export const Dialog = ui.component({
  tag: 'dialog',
  styles,
  props: z.object({ id: z.string(), title: z.string(), closeLabel: z.string().default('Close') }),
  slots: ['footer'],
  children: true,
  render: ({ props, slots, children, classes }) =>
    ui.dialog({ id: props.id, closedby: 'any', 'aria-labelledby': `${props.id}-title` }, [
      ui.header({ class: classes.head }, [ui.h2({ id: `${props.id}-title`, class: classes.title }, [props.title])]),
      ui.div({ class: classes.body }, children),
      ui.footer({ class: classes.foot }, [slots.footer]),
    ]),
})
```
(Built and opened in Chrome as written: spike S16, with one HZ076 warning that F7 removes. Open question Q5: a dialog bound to a machine passes `open` on the `dialog` element itself, which a caller cannot set
on a component root today; the sketch shows the native form. Either `Dialog` takes an `open` prop forwarded to
`ui.dialog({ open })`, or bound dialogs stay hand-written. To verify in the first spike.)

### Phase ② Dashboard

| Component | Tag | Key inputs | Behaviour |
|---|---|---|---|
| `AppShell` | `div` | slots `sidebar`, `header`, children | `Sidebar` layout (content first, sidebar ≥ 16rem, collapses below by intrinsic width); `data-hz-view` keeps it still across pages (ADR 0067 C4) |
| `NavItem` | `a` | `href`, `current`, `count`; slot `icon` | caller passes `current: current(orders) \|\| current(orderDetail)` (`topics/views.md:79-88`) |
| `Breadcrumb` | `nav` | children of `Crumb` (`a`, `href`, `current`) | `aria-current="page"` on the last |
| `DataTable` | `table` | today: parts `tableHead(columns)`, `tableBody(rows, columns)`; F2: `spec: { columns, currency }`, `props: { rows, sort }`, slot `empty` | header cells are `SortHeader` links: `ui.link(route, params, { sort: '-total' })` passed as `href`; `aria-sort` from `sort`; works without JS |
| `SortHeader` | `th` | `href`, `label`, `direction: ascending \| descending \| none`, `align` | `aria-sort`, an arrow icon by attribute |
| `FilterBar` | `form` | children (Select, Input, Checkbox); `method="get"` | each control's `name` is a `search` field; submit without JS; with JS `seed` + `replace` (SKILL.md "Filter / sort in the URL") |
| `Pagination` | `nav` | `summary`, `prevHref`, `nextHref`, labels | links only; `rel="prev/next"`; F3 for labels |
| `DropdownMenu` | `div` | `id`, `label`; children `MenuItem` (`button` or `a`) | `popover="auto"` + anchor positioning with `anchor-scope` (S3); 0 JS |
| `Tooltip` | `span` | `id`, `text`; child trigger | `popover="hint"` (Chrome, Firefox); F8 for `interestfor` |
| `Toolbar` | `div` | children, `label` | `role="toolbar"`; arrow-key roving needs phase ③ |
| `SegmentedControl` | `div` | radio group of links or radios | links for URL modes, radios inside a GET form |
| `DescriptionList` | `dl` | F2 `spec: { fields: fieldsOf(Order, [...]) }`, `props: { item }` | today: children `Detail` (`dt`/`dd`) |
| `Meter`, `Progress` | `meter`, `progress` | `value`, `min`, `max`, `low`, `high`, `optimum` | native, 0 JS |
| `BarList` | `ul` | `props: { items: { id, label, value, share }[] }` | width from `vars: { '--share': item.share }` with `w-[calc(var(--share)*1%)]` (`topics/views.md:42`) |
| `Sparkline` | `svg` | `d` from a `fn` (`topics/views.md:44`), `trend` | server SVG, 0 JS |
| `Chart` (client) | `div` | `spec` (F2) or `props: { type, labels, series }`; `load: 'visible'` | Chart.js client component as in `examples/showcase/features/site/components.ts:41`; tokens read from CSS variables so dark mode needs no redraw; children = a data table fallback |
| `ActivityFeed` | `ol` | `props: { items }` | `ui.each` keyed, so additions fade in by Hozu (ADR 0067 C3) |

### Phase ③ Advanced interaction (after the behaviour-layer ADR, idea 4)
`Combobox` (typeahead, listbox, `aria-activedescendant`), `DatePicker` (calendar grid, `Intl` week start, ROC year
option for zh-TW), `CommandPalette` (a `dialog` + combobox, `Mod+k` on its trigger via `keys`), `Toolbar` roving
focus, `Menu` with arrow keys and typeahead, `Toast` queue (only if the notice recipe proves too weak, §6).
Accessibility specs: the WAI-ARIA APG patterns, React Aria and Base UI keyboard maps (research §2).

## 5. Visual direction (three options)

| | **A. Ledger** (recommended default) | **B. Joinery** | **C. Instrument** |
|---|---|---|---|
| For | back offices, finance and data dashboards | storefronts, content, marketing; Hozu's own brand | developer and ops consoles, dense monitoring |
| Mood | a well-kept ledger: quiet neutrals, one ink-blue accent, numbers first | the site's Swiss poster (`site/DESIGN.md`): paper, ink, signal red, hard lines | dark-first instrument panel, monospace numerals |
| Base text | 14 px / 20 (UI), 16 / 28 prose (CJK 1.75) | 16 px / 26, display 900 uppercase for page titles only | 13 px / 20, 12 px minimum (CJK 13) |
| Type scale (px) | 12 · 13 · 14 · 16 · 20 · 24 · 32 (metric 28 / 32) | 13 · 16 · 20 · 28 · 40 · 64 | 11 · 12 · 13 · 15 · 18 · 22 |
| Fonts (no external files) | `system-ui, -apple-system, "Segoe UI", "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif`; numbers `tabular-nums` | `"Helvetica Neue", Arial, "PingFang TC", "Noto Sans TC", sans-serif`; `ui-monospace` for figures | sans as A; `ui-monospace, "SF Mono", Menlo, monospace` for every number |
| Density | comfortable (`--spacing .25rem`, control 36 px), compact (`.2rem`, control 29 px, rows 32 px) | comfortable only | compact default, comfortable optional |
| Radius | control 6 px, card 8 px, pill for badges | 0–2 px everywhere | 4 px |
| Elevation | 1 px `line` borders; one overlay shadow | 1 px `ink` lines; overlays get an offset shadow `4px 4px 0 ink` | borders only; overlays get a `line-strong` ring |
| Neutrals (OKLCH) | hue 255, chroma ≤ 0.014; canvas L 0.982 / dark 0.16 | paper `oklch(0.947 0.014 85)` (`#f1ede4`), ink `oklch(0.17 0.003 30)` | hue 285, canvas dark L 0.145 |
| Accent | ink-blue `oklch(0.49 0.16 262)` / dark `oklch(0.79 0.12 262)` | signal red `#fb3a0e` as fill, `oklch(0.53 0.2 33)` as text | violet `oklch(0.68 0.16 292)` |
| Status | danger h 27, warning h 75, success h 155, all at one lightness per step | pass green `#2fa36b` | as A, dark-tuned |
| Contrast (spike) | ink 17.7:1; muted 6.5:1 (light), 9.1:1 at L 0.78 (dark); accent text 6.4:1 | ink 16.4:1; signal as text 3.18:1 → `signal-text` 4.99:1 | muted 6.9:1 but APCA −46 → raise to L ≥ 0.76 |
| Motion | 120 ms colour, overlays 160 ms enter / 120 ms leave; Hozu's data fades unchanged | the site's rise and shake for marketing pages only | none beyond Hozu's fades |

**Recommendation:** ship **A. Ledger** as the default and **B. Joinery** as the second theme in the same release.
Two themes over one closed token set prove that theming works (an agent switches `data-theme`, nothing else), Ledger
fits phase ② and the owner's finance context (Taiwan trend colours as the `zh-Hant` default, Q3), and Joinery ties
the kit to Hozu's own brand. C waits for demand.

## 6. Notices without a global store (the trial's most repeated ask)
Declined three times on principle (ADR 0069 C). Two forms, both inside the rules:
- **Same page:** the feature's `notice` field set in `done`, cleared by `after` (`topics/recipes.md:114`), rendered by
  `Notice` in a fixed `aria-live` slot of `AppShell`.
- **After a navigation** (save, then go to the list): the transition navigates to `ui.link(list, null, { notice:
  'saved' })`; the list route declares `search: { notice: z.enum(['saved', 'deleted']).nullable().default(null) }`;
  the view renders `Notice` from `search.notice` with the text from its messages, and a dismiss link (or a `replace`
  effect on a timer) drops the parameter. It is a URL (principle-compatible, works without JS, testable with
  `hozu browse`), and the canonical URL without it stays the cached one.
- To verify in the first spike: the cache key and `noindex` for URLs carrying `notice`.

## 7. Framework changes needed

| # | Change | Phase | Principle / decision touched | Size |
|---|---|---|---|---|
| F1 | `about` sentence on `ui.component`, printed by `hozu docs components` and `inspect` | ① | none (AI-first reading, ADR 0045 motivation) | small |
| F2 | `spec`: literal-only structured component input, read at record time (idea 1) | ② | principle 1 (`variant` vs `spec`), ADR 0045 B | medium; own ADR |
| F3 | Kit messages (`ui.kit({ messages })`) | ① or ② | ADR 0045 G5 (deferred) | medium |
| F4 | `hozu add kit/component --from official`, `kit.lock.json`, `--sync` updating untouched files, `--dry-run` | ① | principle 2 (explicit: provenance file, listed `todo`s) | medium, CLI only |
| F5 | Design check codes (idea 2): contrast, control names, empty list branch, one primary, target size, CJK size | ①→② | principle 7 vehicle; new codes need registry, rule, fix, mistake case | medium–large |
| F6 | HZ026 fix suggests the nearest token (`text-blue-600` → `text-accent-text`) | ① | none | small |
| F7 | HZ072 compares owned properties after shorthand expansion (`p-8` vs `padding-inline`, spike S5); HZ076 accepts `m-auto` on a `dialog` / `[popover]` root, whose margin centres it in the top layer (spike S16) | ① | ADR 0045 E (two false results) | small |
| F8 | DOM table: `interestfor` attribute, `selectedcontent` element | ② | none (typed attributes) | small |
| F9 | `ui.skeleton()` as a derived `pending` (idea 3) | ② | principle 8 (derived), principle 2 (opt-in) | medium |
| F10 | Behaviour layer: component machines with contracts (idea 4) | ③ | **bends ADR 0045 C** (stateless components); P7 budget | large; ADR first |

None of F1–F9 bends a CLAUDE.md principle. F10 does, and is raised here rather than designed.

## 8. Open questions for the owner
1. **`spec` (F2):** accept a second literal-only input next to `variant`, or plan to fold `variant` into `spec`
   (one form) in the same ADR?
2. **Design check strictness (F5):** errors inside the kit and warnings in apps, or errors everywhere for contrast?
   And WCAG 2 AA as the gate with APCA printed alongside (recommended), or APCA as a gate?
3. **Trend colours:** Taiwan convention (red up) as the default in `zh-Hant` apps, a theme switch, or a per-app
   choice in `hozu add kit --trend east|west`?
4. **Theme set:** Ledger + Joinery in the first release (recommended), or one theme first?
5. **Bound dialogs:** may a component forward `open` to its `dialog` root (`ui.dialog({ open })`), or do machine-bound
   dialogs stay hand-written?
6. **Fonts:** system stacks only (no downloads, as the site does), or an optional self-hosted Latin face for
   Ledger's numbers?
7. **Where the official source lives:** this repository published as `@hozu/ui-kit` (install-time only), or inside the
   framework monorepo next to `create-hozu`?
8. **Kit topic:** a `hozu docs ui` topic shipped by the kit (outside the framework's skill), or a row in the
   framework's `components` topic?

## 9. Recommended first step
A two-day spike in a scratch app, no framework change, that decides the uncertain parts before any ADR:
1. Write `theme.css` (Ledger + Joinery, closed token set) and eight phase-① components (`Button`, `LinkButton`,
   `Input`, `Field`, `Badge`, `Card`, `Metric`, `Dialog`) plus `EmptyState`, `Problem` and the `skeleton` utility.
2. Rebuild one screen of each trial app with them (admin's orders list with a dialog, the store's product grid), and
   measure: lines changed, HZ026/HZ072 count, `!` overrides, `hozu browse` shift and flashes, contrast table for both
   themes and both modes.
3. Verify Q5 (bound dialog), the notice-in-URL recipe (cache key), and anchor positioning in Safari 26 / Firefox.
4. From the result, write the first ADR: F1 + F4 + F6 + F7 (small, phase ①), with F2 and F5 as the next ADR.
