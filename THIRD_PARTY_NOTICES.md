# Third-party notices

The kit under `kit/` is written for Hozu's authoring form (`ui.component`, `tv()`). No code was copied from any paid
source (Tailwind Plus / Catalyst, paid Tremor blocks, commercial templates).

## shadcn/ui (MIT)
Some Tailwind class recipes are close to shadcn/ui's, written again here in Hozu's form and on the kit's own tokens:

| Kit file | What resembles shadcn/ui |
|---|---|
| `kit/button.ts` | the base recipe of `buttonStyles` (inline-flex, centred, gap, nowrap, rounded, medium weight, colour transition, focus-visible outline, disabled opacity) and the `sm` / `md` / `icon` sizes |
| `kit/input.ts` | the input recipe (fixed height, rounded border, horizontal padding, small shadow, placeholder colour, focus ring, `aria-invalid` border) |
| `kit/badge.ts` | the small rounded badge shape (padding, text size, weight) |

Source: https://github.com/shadcn-ui/ui

```
MIT License

Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Ideas borrowed without code
Concepts, not code, from open documentation: role-named colour tokens (Radix Colors, GitHub Primer, daisyUI),
density by row height (IBM Carbon), layout primitives (Every Layout), loading and empty-state rules (Carbon, Polaris),
statechart components and the `data-part` contract (Zag.js). Sources are listed in `docs/research.md`.

## Icons: Lucide (ISC; icons derived from Feather: MIT)
- **Every export in `kit/icons/lucide.ts` is a Lucide icon**, taken from the published package `lucide-static`
  1.54.0 (`icon-nodes.json`) by `scripts/lucide-icons.mjs`, never redrawn. The export name is the Lucide icon name in
  camelCase (`external-link` → `externalLink`); a name that is a JavaScript reserved word gets the suffix `Icon`
  (`package` → `packageIcon`).
- The script only joins each icon's elements (`path`, `circle`, `rect`, `line`, `polyline`, `polygon`, `ellipse`) into
  one path string, so that `kit/icon.ts` can draw it with a single `<path>`; the geometry is unchanged
  (`scripts/icon-similarity.mjs` measures 0.00 between every export and its Lucide source).
- `kit/icons/hozu.ts` holds Hozu's own icons, drawn by hand for this kit on Lucide's grid (24 × 24, stroke 2, round
  caps and joins). They are covered by this repository's MIT licence, not by Lucide's.
- Source: https://github.com/lucide-icons/lucide. Licence, verbatim from the package:

```
ISC License

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

---

The following Lucide icons are derived from the Feather project:

airplay, alert-circle, alert-octagon, alert-triangle, aperture, arrow-down-circle, arrow-down-left, arrow-down-right, arrow-down, arrow-left-circle, arrow-left, arrow-right-circle, arrow-right, arrow-up-circle, arrow-up-left, arrow-up-right, arrow-up, at-sign, calendar, cast, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-down, chevrons-left, chevrons-right, chevrons-up, circle, clipboard, clock, code, columns, command, compass, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, crosshair, database, divide-circle, divide-square, dollar-sign, download, external-link, feather, frown, hash, headphones, help-circle, info, italic, key, layout, life-buoy, link-2, link, loader, lock, log-in, log-out, maximize, meh, minimize, minimize-2, minus-circle, minus-square, minus, monitor, moon, more-horizontal, more-vertical, move, music, navigation-2, navigation, octagon, pause-circle, percent, plus-circle, plus-square, plus, power, radio, rss, search, server, share, shopping-bag, sidebar, smartphone, smile, square, table-2, tablet, target, terminal, trash-2, trash, triangle, tv, type, upload, x-circle, x-octagon, x-square, x, zoom-in, zoom-out

The MIT License (MIT) (for the icons listed above)

Copyright (c) 2013-present Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
