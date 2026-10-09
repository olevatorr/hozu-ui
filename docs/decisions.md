# Decisions

## 2026-10-09: the proposal's eight questions

The owner accepted the proposal's direction ([proposal.md](proposal.md) §8): 「UI 的問題都照你建議」.

| # | Question | Decision |
|---|---|---|
| 1 | `spec` next to `variant` | They coexist at first. Merge them only if the spike shows overlap; principle 1 (one canonical form) is the test. |
| 2 | Contrast strictness | Errors inside the kit's own components, warnings in apps. WCAG 2 AA is the threshold; APCA is shown for reference. |
| 3 | Trend colours | No global red-up / green-down default. The kit offers the semantic tokens `up` / `down` only, and each app chooses their colours. |
| 4 | Themes in the first version | Two: A "Grain" (default; first named "Ledger", renamed below) and B "Joinery", to prove that theming is one attribute. |
| 5 | Machine-bound dialog passing `open` through a component | Verify in the spike, then decide. |
| 6 | Fonts | System fonts only. |
| 7 | Where the official source lives | In the separate hozu-ui repository for now; it moves into the framework once it settles. |
| 8 | Agent guidance | The kit's own `hozu docs ui` topic. |

Spike 1 ([spike-1.md](spike-1.md)) answered 5 with evidence: one `Dialog` with an optional `open` serves both the native
and the machine-bound form.

## Licensing (2026-10-09, from the owner's question "could this UI infringe?")
1. Component code and class lists are written here, in Hozu's form. Nothing is copied from paid sources (Tailwind Plus
   / Catalyst, paid Tremor blocks, commercial templates). Open-source ideas may be borrowed; a class recipe close to an
   MIT source keeps its provenance in [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) (today: shadcn/ui for
   `Button`, `Input`, `Badge`).
2. The repository is MIT (`LICENSE`, Copyright (c) 2026 olevatorr). Icons: none shipped; a future set is Lucide (ISC)
   or Heroicons (MIT), with its licence in the notices.
3. Theme A is renamed **Grain** (it was "Ledger", a well-known company and trademark). "Joinery" stays. Grain belongs
   to Hozu's joinery vocabulary: the quiet, planed surface of the wood.
4. No theme imitates one product's distinctive look. Grain is a neutral data theme with its own accent and scale;
   Joinery derives from Hozu's own site (`site/DESIGN.md`).

## Icons (2026-10-09, the owner: 「Ok都照你建議」, option C)
1. **Standard icons are Lucide (ISC).** The kit copies only the path data of the icons an app uses, into
   `kit/icons/lucide.ts`, generated from the published `lucide-static` package by `scripts/lucide-icons.mjs` (23 icons
   today). `kit/icon.ts` draws one path; no JavaScript library ships. The export name is the Lucide name (no comments
   in the codebase), and `THIRD_PARTY_NOTICES.md` says that every export in that file is from Lucide and carries the
   licence text.
2. **Hozu's own icons are hand-drawn** in `kit/icons/hozu.ts` on Lucide's grid: `tenon` (logo, joint), `machine`,
   `contract`, `request`, `island`. The first draft of `lock` was replaced by Lucide's `lock` (below).
3. **Similarity check:** `scripts/icon-similarity.mjs` normalises every path (absolute commands, curves and arcs
   flattened, 64 points spaced evenly along the strokes, scaled to the 24 px grid) and reports the mean
   nearest-point distance to every icon of Lucide 1.54.0, Feather 4.29.2, Heroicons 2.2.0 (outline and solid),
   Tabler 3.49.0 (outline) and Material Symbols 0.48.0 (outlined), installed in a scratch folder, not committed:
   12 163 icons. Calibration: each of the 23 Lucide exports finds its own source at 0.00; the same concept drawn by
   another library lands at 0.0–0.7 (e.g. Feather `download` 0.64, Heroicons `arrow-top-right-on-square` 0.40 for
   `external-link`). Bands: below 0.35 = near-identical (act), 0.35–0.75 = compare by eye.

   Result (2026-10-09):
   ```
   look tenon      Lucide:table-properties 0.73 · Tabler outline:dice-5 0.73 · Tabler outline:helicopter-landing 0.74
   look machine    Lucide:infinity 0.68 · Lucide:voicemail 0.68 · Feather:voicemail 0.70
   ok   contract   Tabler outline:text-wrap 0.80 · Tabler outline:align-left 0.86 · Tabler outline:list-search 0.96
   ok   request    Material Symbols outlined:hanami_dango 1.10 · Lucide:workflow 1.14 · Material Symbols outlined:diagonal_line 1.15
   look island     Material Symbols outlined:keyboard_capslock 0.73 · Tabler outline:sunset-2 0.96 · Tabler outline:christmas-tree 0.98
   NEAR lockFirstDraft Tabler outline:lock 0.34 · Tabler outline:lock-password 0.53 · Tabler outline:lock-down 0.55
   unreadable library files: 19
   6 hand-drawn icons, 12163 library icons, 1 near-identical (< 0.35 px mean nearest-point distance on the 24 px grid), 3 to compare by eye (< 0.75 px)
   ```
   - `lock` (first draft) was near-identical to Tabler's `lock` (0.34): **replaced** by Lucide's `lock`, licensed.
   - `tenon`, `machine` and `island` sit in the compare-by-eye band against unrelated icons (a table, an infinity
     sign, a voicemail glyph, a caps-lock arrow): the side-by-side in `img/icons-hozu-vs-lucide.png` shows different
     drawings of different things, so they stay.
   - `contract` and `request` are clear of every library.
4. **For the owner to judge the style:** `img/icons-hozu-vs-lucide.png` (the hand-drawn set, six Lucide icons, and
   the nearest library icons).

## 2026-10-09: after spike 1 (the owner: 「Ok都照你建議」)
| # | Question | Decision |
|---|---|---|
| 5 | Machine-bound dialog through a component | **Settled:** one `Dialog` (`kit/dialog.ts`). Without `open` it opens natively (`commandfor` / `command`); with `open: is([...])` and `on: { close }` it follows the machine. No separate bound component. |
| — | The five hand-drawn icons (`tenon`, `machine`, `contract`, `request`, `island`) | **Approved.** `island` may be revisited later. |

The framework changes the spike found go into the lead's 0.27 ADR, not into this repository.

## 2026-10-10: Hozu 0.27.0
Spike 2 ([spike-2.md](spike-2.md)) confirmed the fixes from ADR 0079 on the trial copies: HZ076 accepts `Dialog`'s
`m-auto`, HZ072 catches shorthand overrides, HZ094 reports the store's `--color-ink` clash, computed `noindex` works,
and installing a kit syncs every kit's `tv.ts`. Nothing in the decisions above changes. The kit's install mode
(proposal §3.4) relies on HZ094 for its clash report.

## 2026-10-10: an app's brand type over the kit (the owner: B)
- **The kit stays system-fonts-only** (decision 6). An app that has its own brand type overrides the kit
  explicitly: it defines `--font-sans` / `--font-display` in a stylesheet imported after the kit (a feature's
  `styles`; the project stylesheet is imported before kits) and records each intended override with
  `project({ accept: [{ code: 'HZ094', at: '--font-display', reason: '…' }] })`. HZ094 plus `accept` is the documented way.
- In the storefront copy: `features/site/brand.css` holds Inter and Fraunces, two accepted HZ094 entries
  ("The storefront's brand type overrides the kit's system stack"); `hozu check`: 0 warnings (2 accepted).
- **`--color-ink` was not a brand override**, so it was fixed instead of accepted: the store's own `#1b2420` was
  removed and the kit's `ink` role applies everywhere (as it already did, silently, since the kit won).
- **The dark header had a second cause**: the kit's `:root { color-scheme: light dark }` turned every unmigrated
  page dark when the OS was dark. The kit now defaults to `light`; `data-mode="dark"` or `"system"` opts in.
  Dark mode is the app's explicit choice (principle 2).
