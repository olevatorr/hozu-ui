import { part, ui } from '@hozu/core'

const step = part((n: string, title: string, body: string) =>
  ui.li({ class: 'border-4 border-paper p-5' }, [
    ui.p({ class: 'font-code text-xs font-bold text-signal' }, [n]),
    ui.p({ class: 'mt-2 text-lg leading-tight font-black uppercase' }, [title]),
    ui.p({ class: 'mt-2 text-paper/85' }, [body]),
  ]),
)

const shot = part((src: ReturnType<typeof ui.asset>, alt: string, caption: string) =>
  ui.figure({ class: 'grid min-w-0 gap-3' }, [
    ui.img({
      src,
      width: 1600,
      height: 1000,
      alt,
      class: 'h-auto w-full border-4 border-paper shadow-[8px_8px_0_var(--color-signal)]',
    }),
    ui.figcaption({ class: 'font-code text-xs text-paper/75' }, [caption]),
  ]),
)

const mdLine = part((text: string, kind: string) =>
  ui.span(
    {
      class: `block ${kind === 'h' ? 'font-bold text-signal' : kind === 'k' ? 'text-sand' : 'text-paper/60'}`,
    },
    [text === '' ? ' ' : text],
  ),
)

const request: [string, string][] = [
  ['# Hozu request: A button that adds a task', 'h'],
  ['', ''],
  ['Page `/` · 1280 × 800', 'n'],
  ['', ''],
  ['## 1. Add <ui.Button> { intent: \'primary\' } after <h1 "Tasks">', 'h'],
  ['- Want: A button that adds a task', 'k'],
  ['- Where: `features/tasks/views.ts:13:12` (view `tasks.Board`)', 'k'],
  [
    "- Mind: import it from `ui/button.ts`; place `ui.use(Button, { variant: { intent: 'primary' } }, [...])` after it, as a sibling; `hozu docs ui` lists its props and slots.",
    'k',
  ],
  ['- Locate: `hozu why /features/tasks/views/Board/root/children/0/children/0`', 'k'],
  ['', ''],
  ['Run `hozu check` after the edits.', 'n'],
]

const title = 'text-4xl leading-[0.95] font-black tracking-tight text-balance uppercase md:text-7xl'
const headline = ['Place it on your page. ', ui.span({ class: 'text-signal' }, ['Your AI builds it.'])]

export const devtoolsSection = part((page: boolean) =>
  ui.section(
    {
      id: 'devtools',
      'aria-labelledby': 'devtools-title',
      class: 'bg-coal font-poster text-paper',
      'data-poster': '',
    },
    [
      ui.div({ class: 'mx-auto max-w-6xl px-5 py-16 md:py-28' }, [
        ui.p(
          {
            class: 'mb-5 font-code text-xs font-bold tracking-widest text-signal uppercase',
          },
          ['With Hozu DevTools'],
        ),
        page ? ui.h1({ id: 'devtools-title', class: title }, headline) : ui.h2({ id: 'devtools-title', class: title }, headline),
        ui.p({ class: 'mt-6 max-w-2xl text-lg text-paper/85 text-pretty' }, [
          'DevTools knows Hozu UI. Drag a component from the kit onto your running page, see it where it will land, and say what it is for. Your agent gets a request with the file, the line and the exact call to write.',
        ]),
        ui.ol({ class: 'mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4' }, [
          step(
            '01',
            'Open Assets',
            'Run npx hozu dev, open DevTools, then Assets. It docks beside your page. Hozu UI comes first: every component and variant, with examples.',
          ),
          step('02', 'Drag it in', 'Drag a variant onto the page. It shows where it would land before you let go. Click it later to edit, or drag it again.'),
          step('03', 'Say why', 'Write a note in your words. Or change a component itself: one request edits it everywhere it is used.'),
          step('04', 'Hand it over', 'Copy for AI or Save request. Your agent installs what is missing, places it, then runs hozu check.'),
        ]),
        ui.div({ class: 'mt-14' }, [
          shot(
            ui.asset(new URL('../../assets/dt-assets.webp', import.meta.url)),
            'Hozu DevTools Assets docked beside a task list page: the Hozu UI kit first, with Button in each intent and size',
            'Assets docks beside your page: every component and variant, drawn from your app.',
          ),
        ]),
        ui.div(
          {
            class: 'mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-2',
          },
          [
            shot(
              ui.asset(new URL('../../assets/dt-place.webp', import.meta.url)),
              'A primary Button dragged under the Tasks heading: the page shows it in place, labelled Place after Heading Tasks',
              'While you drag, the page shows the component where it would land.',
            ),
            shot(
              ui.asset(new URL('../../assets/dt-request.webp', import.meta.url)),
              'The placed Button marked Pending on the page, and the Changes panel with one item: Add ui.Button intent primary after the Tasks heading, its note, and Copy for AI',
              'It stays on the page as Pending until your agent has built it. Copy for AI, or Save request.',
            ),
          ],
        ),
        ui.div(
          {
            class: 'mt-16 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start',
          },
          [
            ui.div({}, [
              ui.h3({ class: 'text-2xl font-black uppercase md:text-3xl' }, ['What your agent reads']),
              ui.p({ class: 'mt-3 text-paper/80' }, [
                'Plain Markdown: where, what for, and the call to write. If the component is not in your app yet, the request says to install it first.',
              ]),
            ]),
            ui.pre(
              {
                class:
                  'min-w-0 overflow-x-auto border-4 border-paper p-5 font-code text-xs leading-relaxed break-words whitespace-pre-wrap sm:text-sm',
              },
              [ui.code({}, [...request.map(([text, kind]) => mdLine(text, kind))])],
            ),
          ],
        ),
      ]),
    ],
  ),
)

export const DevToolsPage = ui.view({
  render: () => ui.main({ id: 'main' }, [devtoolsSection(true)]),
})
