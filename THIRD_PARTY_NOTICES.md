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

## Icons
The kit ships no icon set. `kit/icon.ts` draws a path the caller passes; `kit/states.ts` uses the text character ✕.
The spike screen in `docs/spike-1.md` reused the trial app's own hand-drawn paths, which are not part of the kit. If
an icon set is added later, it will be Lucide (ISC) or Heroicons (MIT), with its licence here.
