# Research: design systems for an AI-first, server-first kit (October 2026)

Scope: what the kit for Hozu should borrow and avoid. External claims carry a URL. "Unverified" marks a point that
this research found in one place only or where sources disagree. Claims about Hozu cite files in the framework
repository (`Tenon/`), and the scratch-app experiments are in [spikes.md](spikes.md).

## 1. What Hozu already gives a kit (and what it refuses)

| Fact | Where | What it means for a kit |
|---|---|---|
| One declaration `ui.component({ tag, styles, props, slots, children, events, extend, render })`, one call form `ui.use(C, { variant, props, slots, on, class, keys }, children)` | `docs/adr/0045-0-9-ui-components.md:740-825`, `packages/core/src/builders/component.ts:46-53` | The kit's API is fixed by the framework. A kit adds components and tokens, never a second call form. |
| `variant` is literal-only (HZ071); `props` may be references | ADR 0045 B (`:803-825`) | A look chosen in the view is a variant; a look that follows data is a prop styled through an attribute (`data-[tone=red]:…`, `aria-*:`). Both trial kits converged on this (`hozu-trial-admin/admin/ui/status-badge.ts`). |
| The render is closed: it reads only `props`, `slots`, `children`, `on`, `classes`; no routes, queries, messages (HZ070) | ADR 0045 C (`:826-840`) | A kit component cannot fetch, link or translate by itself. Links come in as `href` props, text as props or slots. |
| A render must build with every prop as a reference | spike S8 (HZ059) | **No structured configuration** (column lists, chart specs) inside a component. The biggest functional gap for phase ② (table, chart). |
| Property ownership: a caller's class may not set a property the component owns (HZ072), `!` is the counted escape; HZ079 forbids two classes setting one property on one element | ADR 0045 E, F (`:864-921`) | The kit's look cannot be eroded silently by agents. Spike S5 found one hole: shorthand vs longhand (`p-8` against owned `padding-inline`). |
| `tv()` runs at record time; 0 B of it ships | ADR 0045 D (`:841-863`) | Variant tables can be as large as needed; cost is build time only. |
| `hozu add kit <id> [--sync]` writes `kit.ts` and `tv.ts`; `--sync` regenerates the tailwind-merge block from `@theme` (HZ078 when stale) | `packages/cli/src/commands/kits.ts:102-160` | There is no `--from` source yet; `--sync` already means "regenerate tv.ts". The official kit needs a provenance mechanism (proposal F4). |
| Kits may ship a stylesheet: `ui.kit({ styles: URL })` | `component.ts:150`, ADR 0045 G4 | Tokens and themes travel with the kit. Spike S1, S15. |
| `ComponentIR` holds `owned`, `variants`, `defaults`, `sourceHash`; `UseIR` records each use's `added` and `overrides` | `packages/core/src/ir/types.ts:148-168` | Every use of every component, with its variant and extra classes, is data. React kits learn this only by running the app. |
| Ephemeral UI state stays native: `<details>`, popover, `<dialog>` with `command`/`commandfor`, `closedby`; a framework behaviour layer (roving tabindex, typeahead, focus return) is deferred to its own ADR | ADR 0045 C (`:838`), J (`:967-981`) | Phases ① and ② can be pure (0 B JS). Phase ③ waits for the behaviour ADR. |
| Kit-owned messages are deferred: text comes in as props or slots | ADR 0045 `:1011`, gate G5 | Built-in strings ("Close", "Next page") must be props today; a Traditional Chinese app has to pass every one. |
| Continuity: query regions settle instead of replacing, additions fade in (160 ms, 4 px), shared views keep still across pages, `hozu browse` reports flashes and layout shift | `docs/adr/0067-0-21-continuity.md:21-80` | The kit must not fight this: no own enter animations on data rows; skeletons must match the ready geometry (proposal idea 3). |
| Shortcuts belong to controls: `keys` on elements and on `ui.use` of a control root; `aria-keyshortcuts` written by the server; scoped per open dialog | `docs/adr/0073-0-26.md:62-88`, ADR 0077 | Kit controls take `keys` with no extra API. |
| Declined three times: a global toast/notice store, more than one machine per feature, kit components taking data objects | `docs/adr/0069-*.md:40-47`, `docs/trials/0025-cms-and-shop.md:159,229,319` | The kit must solve notices inside these rules (recipe in the proposal), not ask for a store. |
| Every query region must render `failed.Unexpected` (HZ004) | spike S14 | Error states are mandatory already; the kit should make the right one the easy one. |
| `popover` is typed `auto \| manual \| hint`; `interestfor` and `<selectedcontent>` are not in the DOM table | `packages/core/src/ir/dom-data.ts:795`, grep | Tooltips via `popover=hint` are expressible; interest invokers and the rich customizable select need the table extended. |

### What the trial kits show (agents writing kits with no guidance)
- **Admin** (19 components, `hozu-trial-admin/admin/ui/`): solid basics, but the table, dialog, tabs links, pager links,
  bulk bar and search box stayed **raw class strings** in `styles.ts`, because a component could not express them
  (a table needs columns; a dialog's open state belongs to the feature's machine). `Button` and `LinkButton` copy the
  same classes. Every colour is a raw palette name (`emerald-700`, `zinc-300`): a theme change is a search-and-replace.
- **Store** (10 components, `hozu-trial-store/store/ui/`): a brand palette in `@theme` (`ink`, `clay`, `sand`), a
  shared `buttonStyles` for `Button` and `ButtonLink` (the better pattern), currency hard-coded to `USD`, and
  `ProductCard` with 12 flat props, the workaround for "kit components taking data objects" (declined).
- Both wrote `Field` with the same shape (label, control slot, hint, error with `errorId`), both used `data-[tone=…]`
  for data-driven colour, and neither had loading, empty or error components beyond one `Empty`.

## 2. Component libraries

| Library | State (2025–26) | Borrow | Avoid |
|---|---|---|---|
| **shadcn/ui** | Copy-in via a registry; CLI v4 (2026-03) with skills, `--dry-run/--diff`, `shadcn info --json`, `registry:base` (a whole design system as one item); Base UI the default since 2026-07, Radix and React Aria as alternatives; upgrades by an agent skill that keeps local changes and writes a report, not a codemod ([changelog](https://ui.shadcn.com/docs/changelog), [CLI v4](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4), [Base UI default](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default), [skills](https://ui.shadcn.com/docs/skills)) | Copy-in ownership; a design system as one installable unit; "project state as JSON + rules as text" for agents; dry-run diffs on upgrade | Rules that live only in skill prose (semantic colours only, `gap` not `space-y`) with nothing to check them. Hozu can make those rules diagnostics. |
| **Base UI / Radix Primitives** | Base UI 1.0 (2025-12), unstyled, 35 components ([releases](https://base-ui.com/react/overview/releases)) | Their accessibility contracts (keyboard maps, ARIA) as the spec for phase ③ | The React runtime. |
| **React Aria** | State (`react-stately`), behaviour hooks and rendering split per component; strong i18n for dates and numbers ([architecture](https://react-spectrum.adobe.com/architecture.html)) | The split: Hozu machines are the state layer, the kit maps state to attributes | Hooks as the authoring form. |
| **Zag.js / Ark UI** | One framework-agnostic state machine per component; `connect(state) → api.getTriggerProps()`; DOM contract `data-scope`, `data-part`, `data-state` ([Zag](https://zagjs.com/overview/introduction), [select](https://zagjs.com/components/react/select)); Ark v5 (2025-03) | **The closest model to Hozu.** A component's behaviour as a statechart and a fixed DOM attribute contract that CSS targets | Running the machine as per-component client JS: Hozu already ships a machine interpreter. |
| **Melt / Bits UI** | Builders that return attribute objects (Svelte 5) ([bits-ui](https://www.bits-ui.com/)) | Same idea as Hozu's `part()` inlined at record time | — |
| **daisyUI 5** | Tailwind 4 plugin, semantic classes, theme colours as CSS variables, `color-mix()`; radius tokens by role `rounded-box` / `rounded-field` / `rounded-selector` ([v5](https://daisyui.com/docs/v5/)) | Paired tokens (`primary` / `primary-content`); **radius by role** | Component classes (`.btn`) next to `tv()`: two naming systems for one look. Works in Hozu (lead's check), but not as the kit's basis. |
| **Tremor** | Bought by Vercel (2025-01), now free; Recharts + Radix; 300+ copy-in blocks incl. KPI cards ([blocks](https://blocks.tremor.so/blocks/kpi-cards)) | KPI card anatomy: label, value, delta badge, period, sparkline | Client-side charting for a KPI that could be SVG from the server. |
| **Catalyst** | Tailwind Plus, paid licence ([docs](https://catalyst.tailwindui.com/docs)) | A quality bar for class composition | Copying (licence). |
| **Pico** | Classless, styles semantic HTML ([pico](https://picocss.com/docs/classless)) | A `prose` treatment for `@hozu/content` Markdown | — |
| **Web Awesome / Material Web** | Web components | — | Need a client component wrapper each; runtime JS by default. |
| **Material 3 Expressive** | Spring motion tokens (spatial vs effects × fast/default/slow), shape morphing ([overview](https://www.androidauthority.com/google-material-3-expressive-features-changes-availability-supported-devices-3556392/)) | Motion tokens split by kind and speed | Shape morphing (JS). |
| **Fluent 2** | Global → alias → component tokens; state suffixes `colorBrandBackground`, `…Hover`, `…Pressed` ([tokens](https://fluent2.microsoft.design/color-tokens)) | Predictable state-suffixed names | Three tiers of names for agents to choose from. |
| **Carbon** | Table row heights xs 24 / sm 32 / md 40 / lg 48 / xl 64 px, toolbar and pagination match the rows; skeletons for data containers only, 1–3 s ([table style](https://carbondesignsystem.com/components/data-table/style/), [loading](https://carbondesignsystem.com/patterns/loading-pattern/)) | Density named by row height; "one density per surface" | — |
| **Primer** | Functional tokens `{property}-{role}-{modifier}`: `bgColor-default`, `fgColor-muted` ([token names](https://primer.style/product/primitives/token-names/)) | A grammar an agent can compose without a lookup | — |
| **Polaris** | Moved to web components (2025-10). Loading: real content for static parts, skeleton line counts match content, one CTA in an empty state ([loading](https://polaris.shopify.com/foundations/patterns/loading)) | The loading and empty-state rules | — |
| **Radix Colors / Geist** | 12 steps where **the step is the use**: 1–2 app background, 3–5 component backgrounds (normal/hover/active), 6–8 borders, 9 solid, 10 solid hover, 11 low-contrast text, 12 high-contrast text ([scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale), [Geist](https://vercel.com/geist/colors)) | Role-named tokens instead of raw ramp numbers | Exposing 12 numbered steps as utilities: an agent still has to pick a number. |
| **Braid (SEEK)** | Layout-only components (`Stack`, `Columns`, `Inline`, `Tiles`), components carry no outer margin ([layout](https://seek-oss.github.io/braid-design-system/foundations/layout/)) | Spacing owned by the parent; Hozu already warns on a component margin (HZ076) | — |
| **Every Layout** | Intrinsic layouts: Stack, Cluster, Sidebar, Switcher, Cover, Grid, Center, Reel ([plugin summary](https://tailwind-every-layout-plugin.netlify.app/layouts/)) | Layout primitives that need no breakpoints: agents cannot see the screen, so they should not choose breakpoints | — |
| **Panda CSS / StyleX** | `strictTokens` and `strictPropertyValues` make off-token values type errors ([Panda](https://panda-css.com/docs/concepts/writing-styles)); StyleX `defineVars`, typed vars ([StyleX](https://engineering.fb.com/2025/11/11/web/stylex-a-styling-library-for-css-at-scale/)) | "Lint by construction". Hozu gets the same effect from HZ026 with a closed `@theme` (spike S15), with no new rule | — |

## 3. Tokens and colour

| Topic | Finding | Decision for the kit |
|---|---|---|
| W3C DTCG format | First stable version 2025.10 (Community Group report, not a Recommendation); `$value`, `$type`; `.tokens.json` ([designtokens.org](https://www.designtokens.org/)) | Keep `@theme` as the only source (ADR 0045 D: "no new token format"); offer a DTCG **export** for Figma / Tokens Studio, never an import format. |
| Style Dictionary v5 | DTCG-based ([DTCG](https://styledictionary.com/info/dtcg/)) | Not needed: one output (CSS). |
| Tailwind 4 `@theme` | CSS-first, OKLCH default palette, `@utility`, namespace reset `--color-*: initial` ([v4](https://tailwindcss.com/blog/tailwindcss-v4)) | The kit's tokens are `@theme`; the default palette is **reset** so only semantic tokens exist (S15). |
| OKLCH + Harmonizer | Equal-lightness steps give equal contrast across hues ([Harmonizer](https://evilmartians.com/opensource/harmonizer)) | Status and chart colours share one lightness per step, so swapping hue never breaks contrast. |
| WCAG 2 vs APCA | APCA left the WCAG 3 draft (2023); WCAG 3 contrast undecided ([Roselli, 2026-04](https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html)) | WCAG 2 AA (4.5 / 3.0) is the gate; APCA is a second, advisory number. Spike: WCAG 2 passes dark muted text at 7.57 while APCA gives Lc −54. |
| `light-dark()` | Baseline 2024 with `color-scheme` ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/light-dark)) | Every colour token holds both modes; dark mode is `color-scheme`, not a second token set (S1). |
| Relative colour, `color-mix()` | `oklch(from var(--x) calc(l - .05) c h)` ([web.dev](https://web.dev/articles/baseline-in-action-color-theme)) | Hover/pressed derived by formula in the theme file. |
| `contrast-color()` | Chrome 147, Firefox 146, Safari 26 ([caniuse](https://caniuse.com/wf-contrast-color)) | Text on user-chosen colours (tags, avatars); never for brand pairs. |

## 4. The platform: what makes a 0-JS kit possible now

| Feature | Support (Oct 2026) | Use in the kit |
|---|---|---|
| Invoker commands `command` / `commandfor` | Baseline: Chrome 135, Firefox 144, Safari 26.2 ([explorer](https://web-platform-dx.github.io/web-features-explorer/features/invoker-commands/)) | Dialog, sheet, menu open/close with 0 JS; already typed in Hozu. |
| `popover` auto/manual | Baseline | Dropdown menu, popover panel (S3). |
| `popover="hint"` | Chrome 133, Firefox 149, not Safari ([explorer](https://web-platform-dx.github.io/web-features-explorer/features/popover-hint/)) | Tooltip, progressive. |
| `interestfor` | Chrome/Edge 142 only ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using_interest_invokers)) | Not in the contract yet; needs the DOM table. |
| Anchor positioning | Reported Baseline 2026-01 by web.dev; caniuse marks partial (**sources disagree**) ([web.dev](https://web.dev/blog/web-platform-01-2026), [caniuse](https://caniuse.com/css-anchor-positioning)) | Used with a fallback that is still usable unpositioned; worked in Chrome 154 (S3). |
| `<dialog closedby>` | Chrome 134, Firefox 141, not Safari | `closedby="any"` progressive; Escape still closes. |
| `@starting-style` + `transition-behavior: allow-discrete` | Baseline 2024 ([web.dev](https://web.dev/blog/baseline-entry-animations)) | Enter/leave of popovers and dialogs in CSS. |
| Container queries (size); style queries for custom properties | Size Baseline; style queries Baseline NA 2026-05 ([web.dev](https://web.dev/blog/web-platform-05-2026)) | Cards and KPI tiles adapt to their slot, not the viewport. |
| `field-sizing: content` | Baseline NA 2026-06 ([web.dev](https://web.dev/blog/web-platform-06-2026)) | Auto-growing textarea. |
| Customizable select (`appearance: base-select`, `::picker(select)`, `<selectedcontent>`) | Chrome 135, Safari 27; not Firefox ([summary](https://blakecrosley.com/blog/customizable-select-safari-27)) | Styled `Select` with native fallback (S4). |
| `<details name>` | Chrome 120, Firefox 130, Safari 17.2 ([MDN](https://developer.mozilla.org/en-US/blog/html-details-exclusive-accordions)) | Exclusive accordion, 0 JS. |
| `:user-invalid` | Baseline 2023 | Field errors after interaction, without JS. |
| `sibling-index()` | Chrome 138, Safari 26.2, Firefox 154 ([explorer](https://web-platform-dx.github.io/web-features-explorer/features/sibling-count/)) | Optional stagger; Hozu's own fade (ADR 0067 C3) stays the default. |
| CSS `if()`, `@function` | Chrome only | Avoid. |
| `text-autospace`, `word-break: auto-phrase` | autospace version numbers disputed; auto-phrase Chrome-only and Japanese only ([Chrome](https://developer.chrome.com/blog/css-i18n-features)) | `text-autospace` progressive for mixed CJK/Latin; do not rely on auto-phrase for Chinese. |

## 5. AI-first design systems

| Item | Finding | Lesson |
|---|---|---|
| **A2UI** (Google) | An agent sends JSON from a **closed catalog**; four messages `createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface`; flat adjacency list with an `id: "root"`; data bound by JSON Pointer ([v0.9](https://a2ui.org/specification/v0.9-a2ui/)) | External confirmation of Hozu's closed world. Its string paths break principle 3, so at most an export, never the internal form. |
| **json-render** (Vercel Labs) | A Zod catalog of components and actions constrains the LLM's JSON ([GitHub](https://github.com/vercel-labs/json-render)) | Catalog = schema. Hozu already has this in the IR. |
| **MCP Apps / MCP-UI** | UI resources in sandboxed iframes; components emit intents, the host acts ([SEP-1865](https://modelcontextprotocol.io/seps/1865-mcp-apps-interactive-user-interfaces-for-mcp)) | Intents out, state in the host: same as `on` → machine. |
| **Storybook MCP / component manifest** | A token-budgeted manifest of components, props, examples ([docs](https://storybook.js.org/docs/ai/mcp/overview)) | `hozu docs components` is this, derived from the IR; it lacks a "when to use" line (spike: `ui.Button <button> intent`). |
| **Figma Code Connect** | Per-component usage notes for LLMs ([help](https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect)) | Same lesson: one sentence of intent per component. |
| **Anthropic, "distributional convergence"** | Without direction, models pick the most common safe choices (Inter, purple gradients) ([blog](https://claude.com/blog/improving-frontend-design-through-skills)) | The kit's defaults must have a point of view, and the theme must be chosen, not inherited. |
| **Benchmarks** | DesignBench ([arXiv 2506.06251](https://arxiv.org/abs/2506.06251)), WebGen-Bench, Web-Bench; no public metric for design-system adherence was found | Hozu can measure adherence directly: overrides (`!`), HZ026/HZ072/HZ079 counts, raw elements where a kit component exists (ADR 0045 acceptance 6 already proposed these). |

## 6. Dashboards and data

| Need | Finding | Decision |
|---|---|---|
| Tables | TanStack Table v9: features registered before their API exists ([InfoQ](https://www.infoq.com/news/2026/07/tanstack-table-v9-beta/)); Carbon row heights | Sort, filter and page live in the route's `search` (flat scalars, HZ035, `topics/pages.md:10`); headers are links, so the table works without JS and every state has a URL. nuqs proves the model in React ([nuqs](https://nuqs.dev/)). |
| Density | Carbon 24–64 px rows; Material density steps of 4 dp, set for a whole surface ([M2](https://m2.material.io/design/layout/applying-density.html)) | One variable: `--spacing` per region (S2). |
| Charts | ECharts SSR to SVG string ([handbook](https://apache.github.io/echarts-handbook/en/how-to/cross-platform/server/)); Observable Plot needs jsdom; Unovis themed by CSS vars; uPlot canvas | Small charts (sparkline, bar list, meter) as server SVG through a `fn` path (`topics/views.md:44`) or `vars` widths: 0 JS. Interactive charts: the Chart.js client component (owner's decision; `examples/showcase`). |
| Loading / empty | Carbon and Polaris: skeleton only for data containers, same line count as content, one CTA in empty states | Idea 3: skeletons derived from the ready template. |
| Categorical colour | Okabe-Ito eight ([hex](https://scifig.ai/blog/okabe-ito-color-palette-hex-codes)); yellow on white 1.32:1 | Chart tokens `--color-chart-1..8` at equal OKLCH lightness, yellow last, plus direct labels. |
| Traditional Chinese | Stack `"PingFang TC", "Noto Sans TC", "Microsoft JhengHei"`, `:lang(zh-Hant)` ([guide](https://symbolfyi.com/guides/cjk-web-typography/)); CJK web fonts > 1 MB | System fonts by default; ≥ 12 px for CJK; body line height 1.7; no letter-spacing on Han text; `tabular-nums` for numbers. |
| Market colour convention | In Taiwan, red means up and green means down (the reverse of the US) | Trend tokens `--color-up` / `--color-down`, set by the theme, never "red" and "green" in a component. |

## 7. What to borrow, what to avoid (summary)
- **Borrow:** copy-in ownership with a provenance-aware upgrade (shadcn); role-named tokens (Radix, Primer, daisyUI);
  `light-dark()` + OKLCH; density as one variable (Carbon's surface rule); layout primitives without breakpoints
  (Every Layout, Braid); native invokers, popover, anchor, `details name`, base-select (0 JS); Zag's idea that a
  component's behaviour is a statechart with a fixed DOM contract; a one-line intent per component (Code Connect,
  Storybook manifests); loading/empty rules (Carbon, Polaris).
- **Avoid:** web components and React runtimes; rules that live only in prose; numbered colour ramps as utilities;
  per-component animations that compete with Hozu's derived fades; client-side charting for static numbers; string
  data paths (A2UI) inside the IR; neutral "safe" defaults that make every app look the same.
