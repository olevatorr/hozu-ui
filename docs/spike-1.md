# Spike 1: the kit on two real screens (2026-10-09)

What the owner asked (decisions.md): Grain and Joinery themes plus the phase-① components, one real screen from each
trial app redone with them, measurements, and three open points (Q5 bound dialog, the `?notice=` URL, anchor
positioning). Hozu 0.26.4, Node 22.22.2, Chrome 154. Everything ran on copies in the session's scratch directory; the
trial apps, the framework repository and the database were not written to. No dev server was started (`hozu get`,
`browse`, `check`, `build`, `export` and `@hozu/testing` only).

## Result in one table

| Question | Answer |
|---|---|
| Does the kit build and run in real apps? | Yes. 23 components and `theme.css` (`kit/`, 727 lines) installed into both copies; `hozu check`: 0 errors, contracts and lock unchanged (25/25, 6/6). One warning left: HZ076 on `Dialog`'s `m-auto` (a false positive, F7). |
| Less code? | Admin orders list: 132 → 107 lines, and 28 references to the app's shared class constants gone. Storefront catalogue: 204 → 107 lines (−48 %). |
| Off-system styling in the redone screens | 0 raw palette colours (admin had 12 inline plus those in `styles.ts`; the store 29 colour utilities on its own tokens). 0 HZ026 under the closed token set, 0 HZ072, 0 `!` overrides. |
| Calm? | `hozu browse` reported no flash and no layout shift, before and after, on both scripted journeys; the storefront journey also passes with `--js off`. |
| Theming is one attribute? | Yes: `data-theme="grain" \| "joinery"` and `data-mode="light" \| "dark"` on the screen's root re-skin it (8 screenshots below). It also exposed what a partly migrated app breaks (§4). |
| Contrast | All text pairs pass WCAG 2 AA in both themes and modes. The first version's control borders (`line-strong` at 40 %) failed WCAG 1.4.11 in 3 of 4 combinations and were fixed. |
| Q5: machine-bound dialog through a component | **Works.** One `Dialog` serves both forms (native `commandfor`, or `open` bound to a machine state). Recommend: decide yes. |
| `?notice=` URL | Cache key = the canonical URL: one extra entry per notice value; tracking parameters and invalid values do not multiply entries. **But a computed `noindex` is silently ignored** (framework bug, below). |
| Anchor positioning | Chrome 154 and Playwright's WebKit build (`Version/27.2`) place the menu identically (4 px under its trigger, two menus with one anchor name kept apart by `anchor-scope`). Safari 26.5 is installed but could not be automated (safaridriver's remote automation is off); Firefox is not installed. |

## 1. Setup
- **Kit:** `kit/` in this repository: `theme.css`, `kit.ts` and 13 modules with 23 components (`Button`, `LinkButton`,
  `Input`, `Field`, `Badge`, `Card`, `PageHeader`, `Metric`, `Dialog`, `DropdownMenu`, `MenuItem`, `EmptyState`,
  `Problem`, `Notice`, `NavBar`, `NavLink`, `Pagination`, `Table`, `Th`, `Td`, `Tr`, `Icon`). Installed with
  `tools/install-kit.sh` (what `hozu add kit … --from official` would do: `hozu add kit kit`, copy the files, `--sync`).
  Kit id `kit`, because both apps already own a kit `ui`.
- **Admin screen:** the orders list (`/shop/orders`): status tabs with counts, a GET search form, bulk selection into a
  machine, a table, pagination, notices. Its data comes from the Go service, which was not started; the copy reads
  the same rows from MySQL with a read-only port of the Go query (`SELECT` only), and the bulk mutation is a
  stand-in that writes nothing.
- **Storefront screen:** the catalogue (`/shop`, `/shop/:category`): breadcrumb and display title, category pills,
  sort / price / colour / stock filters as links in the URL, product grid, numbered pages. Read-only by nature.
- Sources of the redone screens: `spike/admin-orders-list.ts`, `spike/store-catalogue.ts`.

## 2. Measurements

### Code
Non-blank lines of the screen's view (the store's count includes its two option lists).

| | Admin before | Admin after | Store before | Store after |
|---|---|---|---|---|
| Lines | 132 (+ shared constants in `ui/styles.ts`) | 107 | 204 | 107 |
| `class:` attributes written in the screen | 20 (+ 28 uses of `s.*` constants) | 16 | 28 | 10 |
| Utility classes written in the screen | 58 (+ those behind `s.*`) | 50 | 112 | 37 |
| Colour utilities | 12 raw palette (`zinc-*`, `rose-*`) | 7, all roles (`ink-muted`, `line`, `accent`) | 29 on the store's tokens | 6, all roles |
| `ui.use` | 14 | 35 | 1 | 17 |
| HZ026 / HZ072 / `!` | n/a | 0 / 0 / 0 | n/a | 0 / 0 / 0 |

- The admin screen got shorter but not by much: a table without `spec` needs a `ui.use(Th)` / `ui.use(Td)` per cell
  (16 of the 35 uses). That is the measured cost of not having F2.
- The status badge needed a `fn` (`statusTone`) because the data carries colour names (`tone: 'violet'`) while the
  kit's `Badge` takes intents (`info`, `success`, …). A kit with intents pushes "which status means what" into one
  mapping, which is right, but every app with colour-named data pays it once.

### The closed token set on the whole app (what migration costs)
`theme.css` resets Tailwind's palette, radii, shadows and fonts. In a partly migrated app that is all-or-nothing, so
the spike ran it in a "legacy" mode (the reset lines removed) and measured the strict mode with `hozu check --json`:

| | HZ026 diagnostics | Class occurrences | Distinct classes | Files | In the redone screen |
|---|---|---|---|---|---|
| Admin | 1 544 | 4 547 | 162 | 19 | 0 |
| Storefront | 417 | 690 | 53 | 11 | 0 |

- HZ026's "Did you mean" is a string match and misleads on token names: `text-alert` → "`text-left`", `text-paper` →
  "`text-base`", `border-stone` → "`border-none`", `text-white` → "`text-line`". Evidence for F6 (suggest by
  property and role).
- CSS written outside classes is not covered: `app.css` reading `var(--color-zinc-50)` breaks silently under the reset.

### Flashes, layout shift, errors (`hozu browse`)
| Journey | Before | After |
|---|---|---|
| Admin: tab "To fulfil" → select two orders → "Mark as processing" (notice appears) → search "Johnson" → "Next" | no flash, no shift, no errors | same |
| Store: sort → price band → in stock → clear filters → category | no flash, no shift, no errors | same; `--js off` same |

### Contrast (WCAG 2 ratio, APCA Lc for reference; `tools/contrast.mjs` reads `kit/theme.css`)
| Grain | light | `ink` on `canvas` | body text | 16.82 | 101 | pass |
| Grain | light | `ink` on `surface` | card text | 17.71 | 105 | pass |
| Grain | light | `ink-muted` on `surface` | secondary text | 6.53 | 82 | pass |
| Grain | light | `ink-muted` on `surface-sunken` | secondary on sunken (table footer, dialog foot) | 5.90 | 75 | pass |
| Grain | light | `ink-faint` on `surface` | placeholder / disabled (exempt) | 4.28 | 70 | exempt |
| Grain | light | `on-accent` on `accent` | primary button | 6.25 | -84 | pass |
| Grain | light | `accent-text` on `surface` | link / accent text | 7.70 | 86 | pass |
| Grain | light | `accent-text` on `accent-subtle` | accent badge | 6.63 | 76 | pass |
| Grain | light | `on-danger` on `danger` | destructive button | 5.65 | -81 | pass |
| Grain | light | `danger-text` on `surface` | error text | 6.62 | 81 | pass |
| Grain | light | `danger-text` on `danger-subtle` | danger badge | 5.63 | 70 | pass |
| Grain | light | `success-text` on `success-subtle` | success badge | 5.85 | 73 | pass |
| Grain | light | `warning-text` on `warning-subtle` | warning badge | 5.96 | 74 | pass |
| Grain | light | `info-text` on `info-subtle` | info badge | 5.82 | 73 | pass |
| Grain | light | `canvas` on `ink` | current pill / list link (text-canvas on bg-ink) | 16.82 | -103 | pass |
| Grain | light | `line-strong/40` on `surface` | input border at 40 % (first version) | 1.56 | 26 | **fail** |
| Grain | light | `line-strong` on `surface` | input / button border (non-text 1.4.11), fixed | 3.64 | 64 | pass |
| Grain | light | `focus` on `surface` | focus ring (non-text) | 6.43 | 81 | pass |
| Grain | light | `line` on `surface` | divider (decorative) | 1.31 | 15 | n/a |
| Grain | dark | `ink` on `canvas` | body text | 16.78 | -97 | pass |
| Grain | dark | `ink` on `surface` | card text | 15.64 | -96 | pass |
| Grain | dark | `ink-muted` on `surface` | secondary text | 9.05 | -63 | pass |
| Grain | dark | `ink-muted` on `surface-sunken` | secondary on sunken (table footer, dialog foot) | 9.89 | -63 | pass |
| Grain | dark | `ink-faint` on `surface` | placeholder / disabled (exempt) | 4.97 | -37 | pass |
| Grain | dark | `on-accent` on `accent` | primary button | 9.74 | 66 | pass |
| Grain | dark | `accent-text` on `surface` | link / accent text | 10.57 | -71 | pass |
| Grain | dark | `accent-text` on `accent-subtle` | accent badge | 8.27 | -68 | pass |
| Grain | dark | `on-danger` on `danger` | destructive button | 6.70 | 49 | pass |
| Grain | dark | `danger-text` on `surface` | error text | 9.79 | -67 | pass |
| Grain | dark | `danger-text` on `danger-subtle` | danger badge | 7.81 | -64 | pass |
| Grain | dark | `success-text` on `success-subtle` | success badge | 8.30 | -69 | pass |
| Grain | dark | `warning-text` on `warning-subtle` | warning badge | 8.91 | -74 | pass |
| Grain | dark | `info-text` on `info-subtle` | info badge | 8.43 | -70 | pass |
| Grain | dark | `canvas` on `ink` | current pill / list link (text-canvas on bg-ink) | 16.78 | 96 | pass |
| Grain | dark | `line-strong/40` on `surface` | input border at 40 % (first version) | 1.61 | 0 | **fail** |
| Grain | dark | `line-strong` on `surface` | input / button border (non-text 1.4.11), fixed | 3.73 | -27 | pass |
| Grain | dark | `focus` on `surface` | focus ring (non-text) | 9.21 | -64 | pass |
| Grain | dark | `line` on `surface` | divider (decorative) | 1.33 | 0 | n/a |
| Joinery | light | `ink` on `canvas` | body text | 16.38 | 95 | pass |
| Joinery | light | `ink` on `surface` | card text | 17.80 | 101 | pass |
| Joinery | light | `ink-muted` on `surface` | secondary text | 6.94 | 81 | pass |
| Joinery | light | `ink-muted` on `surface-sunken` | secondary on sunken (table footer, dialog foot) | 5.53 | 66 | pass |
| Joinery | light | `ink-faint` on `surface` | placeholder / disabled (exempt) | 4.34 | 67 | exempt |
| Joinery | light | `on-accent` on `accent` | primary button | 5.15 | 40 | pass |
| Joinery | light | `accent-text` on `surface` | link / accent text | 5.42 | 72 | pass |
| Joinery | light | `accent-text` on `accent-subtle` | accent badge | 4.70 | 63 | pass |
| Joinery | light | `on-danger` on `danger` | destructive button | 5.65 | -81 | pass |
| Joinery | light | `danger-text` on `surface` | error text | 6.16 | 76 | pass |
| Joinery | light | `danger-text` on `danger-subtle` | danger badge | 5.63 | 70 | pass |
| Joinery | light | `success-text` on `success-subtle` | success badge | 5.40 | 71 | pass |
| Joinery | light | `warning-text` on `warning-subtle` | warning badge | 5.96 | 74 | pass |
| Joinery | light | `info-text` on `info-subtle` | info badge | 5.82 | 73 | pass |
| Joinery | light | `canvas` on `ink` | current pill / list link (text-canvas on bg-ink) | 16.38 | -96 | pass |
| Joinery | light | `line-strong/40` on `surface` | input border at 40 % (first version) | 2.62 | 49 | **fail** |
| Joinery | light | `line-strong` on `surface` | input / button border (non-text 1.4.11), fixed | 17.80 | 101 | pass |
| Joinery | light | `focus` on `surface` | focus ring (non-text) | 5.42 | 72 | pass |
| Joinery | light | `line` on `surface` | divider (decorative) | 1.52 | 23 | n/a |
| Joinery | dark | `ink` on `canvas` | body text | 16.04 | -94 | pass |
| Joinery | dark | `ink` on `surface` | card text | 14.87 | -94 | pass |
| Joinery | dark | `ink-muted` on `surface` | secondary text | 8.85 | -62 | pass |
| Joinery | dark | `ink-muted` on `surface-sunken` | secondary on sunken (table footer, dialog foot) | 9.93 | -63 | pass |
| Joinery | dark | `ink-faint` on `surface` | placeholder / disabled (exempt) | 4.86 | -36 | pass |
| Joinery | dark | `on-accent` on `accent` | primary button | 6.08 | 46 | pass |
| Joinery | dark | `accent-text` on `surface` | link / accent text | 7.46 | -55 | pass |
| Joinery | dark | `accent-text` on `accent-subtle` | accent badge | 5.89 | -51 | pass |
| Joinery | dark | `on-danger` on `danger` | destructive button | 6.70 | 49 | pass |
| Joinery | dark | `danger-text` on `surface` | error text | 9.59 | -67 | pass |
| Joinery | dark | `danger-text` on `danger-subtle` | danger badge | 7.81 | -64 | pass |
| Joinery | dark | `success-text` on `success-subtle` | success badge | 7.80 | -66 | pass |
| Joinery | dark | `warning-text` on `warning-subtle` | warning badge | 8.91 | -74 | pass |
| Joinery | dark | `info-text` on `info-subtle` | info badge | 8.43 | -70 | pass |
| Joinery | dark | `canvas` on `ink` | current pill / list link (text-canvas on bg-ink) | 16.04 | 94 | pass |
| Joinery | dark | `line-strong/40` on `surface` | input border at 40 % (first version) | 3.40 | -25 | pass |
| Joinery | dark | `line-strong` on `surface` | input / button border (non-text 1.4.11), fixed | 14.87 | -94 | pass |
| Joinery | dark | `focus` on `surface` | focus ring (non-text) | 6.67 | -50 | pass |
| Joinery | dark | `line` on `surface` | divider (decorative) | 1.40 | 0 | n/a |

- After the fix every text pair passes AA, and every non-text control boundary passes 3:1.
- Two pairs pass WCAG 2 with a weak APCA value: Joinery's primary button (ink on signal red, 5.15 : 1, Lc 40) and
  Grain's dark destructive button (6.70 : 1, Lc 49). Under decision 2 they pass; they are the first candidates if APCA
  ever becomes the gate.
- The fixed failure is the case idea 2 (the design check) exists for: a 40 % border looked fine on screen and in
  review and failed only in a computed table.

## 3. The three open points

### Q5: a machine-bound dialog through a component (`spike/q5-*.ts`)
- One `Dialog` with `open: z.boolean().optional()` and an event `close`:
  - **without `open`** it is the native form: a `Button` with `commandfor` / `command: 'show-modal'` opens it, no
    machine, works with `--js off` too;
  - **with `open: is(['editing'])`** and `on: { close: ui.send(Cancel, {}) }` it follows the machine: "Edit name"
    opens it, `Mod+Enter` on the submit inside it saves and closes it (`keys` scoped to the open dialog, ADR 0077),
    Escape closes it through `close` → `Cancel`, and `browse` reports focus back on a button.
- HZ005 asked for `ignore` lists exactly as it does for a hand-written `ui.dialog({ open })` (compared on the same
  machine): the component adds no new rule and loses no check.
- **Recommendation:** decide yes. Keep one `Dialog` (the spike first had a separate `BoundDialog`; principle 1
  removed it).

### `?notice=` in the URL (`spike/notice-list.ts`, `@hozu/testing`)
| Request | Cache | Canonical |
|---|---|---|
| `/list` | miss | `/list` |
| `/list?notice=saved` | miss (own entry) | `/list?notice=saved` |
| `/list?notice=bogus` | hit (`/list`'s entry) | `/list` |
| `/list?utm_source=x&notice=saved` | hit (the `saved` entry) | `/list?notice=saved` |

- Bounded: one extra cache entry per enum value. Invalid values and tracking parameters fall back to the canonical.
- **Bug:** `head: { render: (_d, _p, _l, search) => ({ title: …, noindex: search.notice !== null }) }` renders the
  computed title but **never the noindex** (no `<meta name="robots">`, no diagnostic); a literal `noindex: true` works.
  So today a notice URL is an indexable duplicate with a self-canonical.
- Recommendation for the framework (F14): either evaluate `noindex` like `title`, or mark a search field as
  transient (`notice` excluded from the canonical URL and the cache key, page noindexed while present). The second
  is the better design: a notice is not a different page.

### Anchor positioning
| Engine | `anchor-name` / `position-area` / `anchor-scope` | Popover, invokers, `closedby`, `base-select`, `field-sizing` | Menu geometry |
|---|---|---|---|
| Chrome 154 (`hozu browse` and Playwright) | yes / yes / yes | all yes | panel top 258 px under trigger bottom 254 px, left edges equal |
| WebKit `Version/27.2` (Playwright build) | yes / yes / yes | all yes | identical |
| Safari 26.5 (installed) | not run: safaridriver needs "Allow remote automation", which was not turned on | | |
| Firefox | not installed | | |

Screenshots: `img/anchor-chrome.png`, `img/anchor-webkit.png`.

## 4. What the spike found that the proposal did not expect
1. **Kit tokens silently override app tokens with the same name.** The store defines `--color-ink` and
   `--font-display`; after the install the kit's values won everywhere, with no diagnostic. In dark mode the store's
   own (unmigrated) header turned light-on-light (`img/store-shop-grain-dark.png`). Needs a check (F11).
2. **Installing a kit stales every other kit's `tv.ts`** (HZ078 on the app's `ui` kit): the merge config is per
   design system, not per kit. The install must sync all kits.
3. **The theme must reach `<html>`.** A view cannot set attributes on `html` or `body`, so a dark screen sat on a light
   page background. Solved in CSS without a framework change: `theme.css` applies `[data-theme]` / `[data-mode]` also
   to `:root:has([data-theme=…])` and paints `html` with `canvas`.
4. **`aria-current` styling:** the admin's tabs styled `aria-[current=true]`, which never matches on the address
   itself (Hozu writes `"page"` there): the original "To fulfil" tab was never highlighted on its own page
   (`img/admin-orders-before.png`). The kit's `aria-[current]` fixes it, a small proof that a kit removes a class of
   agent mistakes.
5. **HZ076 false positives** on `m-auto` (a top-layer `dialog`) and, in the first version, on `-mb-px` (a tab
   overlapping its bar; the kit now draws the bar line with an inset shadow).
6. **Strict tokens are all-or-nothing.** A kit needs an install mode for partly migrated apps (the spike's "legacy"
   mode) and a count of what is left (the table above).

## 5. Screenshots
| | Grain light | Grain dark | Joinery light | Joinery dark |
|---|---|---|---|---|
| Admin orders | `img/admin-orders-grain-light.png` | `img/admin-orders-grain-dark.png` | `img/admin-orders-joinery-light.png` | `img/admin-orders-joinery-dark.png` |
| Storefront | `img/store-shop-grain-light.png` | `img/store-shop-grain-dark.png` | `img/store-shop-joinery-light.png` | `img/store-shop-joinery-dark.png` |

Before: `img/admin-orders-before.png`, `img/store-shop-before.png`. Q5: `img/q5-bound-dialog.png`.

## 6. Recommendation

### Changes to the proposal
- **Q5 decided by evidence:** one `Dialog` with an optional `open` and a `close` event (§3).
- **Decision 1 (spec / variant):** no overlap found. Variants picked looks (`intent`, `look`, `align`); the one place
  that wanted structured literal input was the table (16 cell uses). Keep both; F2 stays the way to remove the cell
  boilerplate.
- **Tokens:** add an install mode for partly migrated apps (no reset until HZ026 is at 0 outside the kit), the
  `:root:has()` rules and `html` canvas, and a non-text `line-strong` at 100 % for control borders.
- **Badge** takes intents; the recipe "map data colour names to intents in one `fn`" goes into `hozu docs ui`.
- **Component count:** phase ① is 23 components, not 8: tables, navigation links and states were needed by both
  screens.

### Framework changes, in the order the spike proved them
| Order | Change | Evidence |
|---|---|---|
| 1 | **F7**: HZ076 accepts `m-auto` on a `dialog` / `[popover]` root; HZ072 compares after shorthand expansion | every kit install shows the HZ076 warning; S5 |
| 2 | **F11 (new)**: a diagnostic when two stylesheets (kit, app) define the same `@theme` variable with different values | §4.1, the store's dark header |
| 3 | **F14 (new)**: `noindex` computed from `search` is ignored without a diagnostic; better, transient search fields | §3 |
| 4 | **F4**: `--from official` with an install mode, syncing every kit's `tv.ts`, and the leftover HZ026 count | §2, §4.2, §4.6 |
| 5 | **F6**: HZ026 suggestions by property and token role, not by spelling | §2 |
| 6 | **F2**: `spec` for tables (then charts) | 16 of 35 uses on the admin screen are cells |

Icons were settled after the spike (decisions.md, "Icons"): Lucide path data in `kit/icons/lucide.ts`, Hozu's own in
`kit/icons/hozu.ts`; the admin screen now uses `externalLink` and `packageIcon` instead of the trial app's paths.

Not proven necessary by this spike: F1 (`about`), F3 (kit messages), F5 (the design check as diagnostics; its value
was shown by the border failure, but a script found it), F8, F9, F10.
