# Spike 2: re-checking spike 1 on Hozu 0.27.0 (2026-10-10)

Hozu 0.27.0 (ADR 0079) shipped the framework changes spike 1 asked for. Same rules as spike 1: scratch copies only,
the trial apps, the framework repository and the database read-only, no dev server.

## Upgrade
Both copies (admin and storefront, each with the kit installed in its partial-migration mode) were upgraded with
`npx -y -p @hozu/cli@0.27.0 hozu migrate`, then only the printed `next:` lines (`npm install`, `npx hozu migrate`).

First run (admin; the storefront's is identical):
```
hozu migrate 0.26.4 → 0.27.0: rewrite
  0.26 → 0.27:
    - no source change
    - head.render may compute noindex (e.g. noindex: search.notice !== null); a computed type is HZ014 (ADR 0079)
    - HZ072 compares shorthands with longhands (p-8 against px-3 py-2); HZ076 accepts m-auto on a dialog or popover root
    - HZ094 warns when two stylesheets define one @theme variable with different values
    - HZ026 lists the project’s colours for a colour utility it does not know; hozu add kit syncs every kit’s tv.ts
  rewrote 0 files
  @hozu/adapter-node: ^0.26.4 → ^0.27.0
  @hozu/adapter-static: ^0.26.4 → ^0.27.0
  @hozu/cli: ^0.26.4 → ^0.27.0
  @hozu/core: ^0.26.4 → ^0.27.0
  @hozu/css: ^0.26.4 → ^0.27.0
  @hozu/data: ^0.26.4 → ^0.27.0
  @hozu/runtime-server: ^0.26.4 → ^0.27.0
  @hozu/schema-zod: ^0.26.4 → ^0.27.0
  @hozu/transform: ^0.26.4 → ^0.27.0
  @hozu/variants: ^0.26.4 → ^0.27.0
  @hozu/bundle: ^0.26.4 → ^0.27.0
  @hozu/dev: ^0.26.4 → ^0.27.0
  @hozu/testing: ^0.26.4 → ^0.27.0
  saved the old IR to .hozu/migrate-0.27.json
next: npm install   # installs Hozu 0.27.0
next: npx hozu migrate   # again: compares the IR with the old one and runs hozu check
Migrate never writes hozu.lock.json and never deletes a contract.
```
Second run (admin):
```
hozu migrate 0.27.0 → 0.27.0: verify
  0.26 → 0.27:
    - no source change
    - head.render may compute noindex (e.g. noindex: search.notice !== null); a computed type is HZ014 (ADR 0079)
    - HZ072 compares shorthands with longhands (p-8 against px-3 py-2); HZ076 accepts m-auto on a dialog or popover root
    - HZ094 warns when two stylesheets define one @theme variable with different values
    - HZ026 lists the project’s colours for a colour utility it does not know; hozu add kit syncs every kit’s tv.ts
  the IR equals the old one after the declared mapping
  updated .claude/skills/hozu
  hozu check: ok · types ok · 0 errors, 1 warnings
next: Done. Commit the migration; hozu.lock.json was not touched.
Migrate never writes hozu.lock.json and never deletes a contract.
```
Second run (storefront):
```
hozu migrate 0.27.0 → 0.27.0: verify
  0.26 → 0.27:
    - no source change
    - head.render may compute noindex (e.g. noindex: search.notice !== null); a computed type is HZ014 (ADR 0079)
    - HZ072 compares shorthands with longhands (p-8 against px-3 py-2); HZ076 accepts m-auto on a dialog or popover root
    - HZ094 warns when two stylesheets define one @theme variable with different values
    - HZ026 lists the project’s colours for a colour utility it does not know; hozu add kit syncs every kit’s tv.ts
  the IR equals the old one after the declared mapping
  updated .claude/skills/hozu
  hozu check: ok · types ok · 0 errors, 3 warnings
next: Done. Commit the migration; hozu.lock.json was not touched.
Migrate never writes hozu.lock.json and never deletes a contract.
```
No hand edit was needed. The scratch app used for Q5, `?notice=` and the anchor test (`spike-ui`) took the same two
steps and ended with `hozu check: ok · types ok · 0 errors, 0 warnings`.

## Results

| Item | 0.26.4 (spike 1) | 0.27.0 |
|---|---|---|
| HZ076 on `Dialog`'s `m-auto` (S16) | warning on every install | **gone** (`spike-ui`: 0 warnings; the admin and storefront warnings left are HZ094 below) |
| Caller `p-8` on `Button` (S5) | passed silently, no effect | **`HZ072 "p-8" sets padding, which kit.Button owns`**, fix "declare a variant … or write `p-8!`" |
| The store's `--color-ink` clash (the dark header, spike 1 §4.1) | no diagnostic | **`kit/theme.css:11:1 warning HZ094 --color-ink is defined by 2 stylesheets with different values; kit/theme.css wins`**, cause names `app.css:10 (#1b2420)` and `kit/theme.css:11 (light-dark(…))`; also `--font-display` (Fraunces) and `--font-sans`. The admin gets one: `--font-sans` (Inter) |
| A colour typo (`text-alert`) | "Did you mean `text-left`?" | cause: *"If "text-alert" is meant as a colour, this project's colours for it are text-accent, text-accent-subtle, text-accent-text, text-canvas, text-danger, text-danger-subtle, text-danger-text, text-down, text-focus, text-info-subtle, text-info-text, text-ink, text-ink-faint, text-ink-muted, text-line, text-line-strong."*; no misleading suggestion |
| `noindex: search.notice !== null` | silently ignored | **works**: `/list?notice=saved` (and with `utm_source`) carries `<meta name="robots" content="noindex">`; `/list` and `/list?notice=bogus` do not. Cache key and canonical unchanged from spike 1 |
| A second kit stales the first (HZ078) | `ui/tv.ts` stale after installing `kit` | **fixed**: `hozu add kit extra --sync` printed `edited extra/tv.ts` and `edited kit/tv.ts`; `--color-brand` is in both; no HZ078 |

## Notes for the kit
- **HZ026's colour list stops at 16 names**, alphabetically: `text-success-text`, `text-warning-text`, `text-on-accent`
  and the surfaces are not listed. With the kit's 30 colour roles, the right one is shown only when it sorts early
  (`text-danger-text` here, by luck). A suggestion for the framework: rank by similarity of the name's role
  (`alert` → `danger`) or print all roles of the namespace.
- **HZ094 is the install mode's report.** The partial-migration install now gets the token clashes for free;
  `hozu add kit --from official` can print the HZ094 lines and suggest `project({ accept })` for intended overrides
  (the store's `--font-display` is one the owner should decide: decision 6 says system fonts).
- HZ094's line numbers point into the installed `kit/theme.css`; in the partial-migration mode that file lacks the
  four reset lines, so the numbers differ from `kit/theme.css` in this repository by four.
- **After the owner's decision B** (decisions.md): the store's fonts move to `features/site/brand.css` (imported after
  the kit) with two accepted HZ094 entries, `--color-ink` is fixed by removing the store's copy, and the kit defaults to
  `color-scheme: light` (dark only with `data-mode`); the store copy checks `0 errors, 0 warnings (2 accepted)`, the
  journey has no flash, shift or error, and Fraunces is back (`img/store-brand-fonts.png`). Not covered by HZ094: the
  kit's `html { background }` rule silently replaces the store's paper background (a plain CSS rule, not `@theme`).
