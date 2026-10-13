import { part, ui } from '@hozu/core'
import { components } from '../../routes.ts'
import { Badge } from '../../ui/badge.ts'
import { Button } from '../../ui/button.ts'
import { Card } from '../../ui/card.ts'
import { Field } from '../../ui/field.ts'
import { Icon } from '../../ui/icon.ts'
import { plus } from '../../ui/icons/lucide.ts'
import { Input } from '../../ui/input.ts'
import { Metric } from '../../ui/metric.ts'
import { posterButton } from './chrome.ts'
import { devtoolsSection } from './devtools.ts'
import { Copy, site } from './model.ts'

const kicker = part((text: string, dark: boolean) =>
  ui.p(
    {
      class: `mb-5 font-code text-xs font-bold tracking-widest uppercase ${dark ? 'text-signal' : 'text-ember'}`,
    },
    [text],
  ),
)

const heading = part((id: string, first: string, accent: string) =>
  ui.h2(
    {
      id,
      class: 'text-4xl leading-[0.95] font-black tracking-tight text-balance uppercase md:text-6xl',
    },
    [first, ' ', ui.span({ class: 'text-signal' }, [accent])],
  ),
)

const command = part((text: string, copied: boolean, dark: boolean) =>
  ui.div(
    {
      class: `flex min-w-0 items-stretch border-4 bg-coal text-paper ${dark ? 'border-paper' : 'border-coal'}`,
    },
    [
      ui.span(
        {
          class: 'flex items-center pl-3 font-code text-sm text-signal select-none',
          'aria-hidden': 'true',
        },
        ['$'],
      ),
      ui.code(
        {
          class: 'min-w-0 flex-1 overflow-x-auto px-3 py-3 font-code text-sm whitespace-nowrap',
        },
        [text],
      ),
      ui.button(
        {
          type: 'button',
          'aria-label': copied ? 'Copied' : `Copy: ${text}`,
          class: 'shrink-0 bg-signal px-3 font-code text-xs font-bold text-coal uppercase hover:bg-paper',
          on: { click: ui.send(Copy, { text }) },
        },
        [copied ? 'Copied' : 'Copy'],
      ),
    ],
  ),
)

const point = part((title: string, body: string) =>
  ui.div({ class: 'border-t-4 border-coal pt-4' }, [ui.p({ class: 'font-black uppercase' }, [title]), ui.p({ class: 'mt-2 text-coal/80' }, [body])]),
)

const files: [string, string][] = [
  ['ui/', 'your copy of the kit'],
  ['├─ kit.ts', 'lists the components'],
  ['├─ button.ts', 'Button, LinkButton'],
  ['├─ field.ts · input.ts', 'forms'],
  ['├─ dialog.ts · menu.ts', 'overlays'],
  ['├─ …', 'one file per family'],
  ['├─ theme.css', 'colour roles, both themes'],
  ['├─ tv.ts', 'the class merger'],
  ['└─ kit.lock.json', 'what was installed, for --sync'],
]

export const Home = ui.view({
  machine: site,
  render: ({ ctx }) =>
    ui.main({ id: 'main', class: 'font-poster', 'data-poster': '' }, [
      ui.section(
        {
          'aria-labelledby': 'hero',
          class: 'relative overflow-hidden border-b-4 border-coal',
          'data-grid': '',
        },
        [
          ui.div(
            {
              class: 'mx-auto grid max-w-6xl gap-12 px-5 py-14 md:py-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center',
            },
            [
              ui.div({ class: 'min-w-0' }, [
                kicker('Hozu UI · the official kit', false),
                ui.h1(
                  {
                    id: 'hero',
                    class: 'text-5xl leading-[0.9] font-black tracking-tight uppercase sm:text-6xl md:text-7xl',
                    'data-rise': '',
                  },
                  [
                    ui.span({ class: 'block overflow-hidden' }, [ui.span({ class: 'block motion-safe:animate-rise' }, ['Components'])]),
                    ui.span({ class: 'block overflow-hidden' }, [ui.span({ class: 'block motion-safe:animate-rise' }, ['your AI'])]),
                    ui.span({ class: 'block overflow-hidden' }, [ui.span({ class: 'block text-signal motion-safe:animate-rise' }, ['can change.'])]),
                  ],
                ),
                ui.p({ class: 'mt-6 max-w-lg text-lg text-pretty' }, [
                  'Buttons, forms, tables and dialogs that live inside your app as plain files. Ask for a change in your own words, and your AI edits them like the rest of your code.',
                ]),
                ui.div({ class: 'mt-8 flex flex-wrap gap-3' }, [
                  posterButton(ui.link(components, null), 'See every component →', true),
                  posterButton('#devtools', 'Place one with DevTools', false),
                ]),
              ]),
              ui.div({ class: 'relative min-w-0', 'data-theme': ctx.theme }, [
                ui.img({
                  src: ui.asset(new URL('../../assets/peg-suit-hello.svg', import.meta.url)),
                  width: 210,
                  height: 250,
                  alt: 'Peg, the Hozu checker, in a suit and bow tie, waving',
                  class: 'pointer-events-none absolute -right-4 -bottom-3 z-10 hidden h-auto w-24 sm:block lg:-right-10',
                }),
                ui.div(
                  {
                    class: 'border-4 border-coal shadow-[10px_10px_0_var(--color-coal)]',
                  },
                  [
                    ui.div(
                      {
                        class: 'flex items-center justify-between bg-coal px-3 py-2 font-code text-xs text-paper',
                      },
                      [ui.span({}, ['ui/ · live']), ui.span({ class: 'text-signal uppercase' }, [ctx.theme])],
                    ),
                    ui.div({ class: 'grid gap-4 p-5 sm:p-7', 'data-stage': '' }, [
                      ui.div({ class: 'grid grid-cols-2 gap-3' }, [
                        ui.use(Metric, {
                          props: {
                            label: 'Revenue',
                            value: '$48,210',
                            delta: '+12.4%',
                            trend: 'up',
                            period: 'this month',
                          },
                        }),
                        ui.use(Metric, {
                          props: {
                            label: 'Open orders',
                            value: '27',
                            delta: '−3',
                            trend: 'down',
                            period: 'since Monday',
                          },
                        }),
                      ]),
                      ui.use(
                        Card,
                        {
                          props: {
                            title: 'New project',
                            description: 'Shown on invoices',
                          },
                          slots: {
                            actions: ui.use(Badge, {
                              props: {
                                tone: 'success',
                                label: 'Draft saved',
                              },
                            }),
                          },
                        },
                        [
                          ui.div({ class: 'grid gap-4' }, [
                            ui.use(Field, {
                              props: {
                                for: 'hero-name',
                                label: 'Project name',
                                errorId: 'hero-name-error',
                              },
                              slots: {
                                control: ui.use(Input, {
                                  props: {
                                    id: 'hero-name',
                                    name: 'name',
                                    value: 'Acme storefront',
                                    describedby: 'hero-name-error',
                                  },
                                }),
                              },
                            }),
                            ui.div({ class: 'flex flex-wrap justify-end gap-2' }, [
                              ui.use(Button, { variant: { intent: 'quiet' } }, ['Cancel']),
                              ui.use(
                                Button,
                                {
                                  variant: { intent: 'primary' },
                                  slots: {
                                    icon: ui.use(Icon, {
                                      props: { d: plus },
                                    }),
                                  },
                                },
                                ['Create'],
                              ),
                            ]),
                          ]),
                        ],
                      ),
                    ]),
                  ],
                ),
                ui.div(
                  {
                    role: 'group',
                    'aria-label': 'Theme of the preview',
                    class: 'mt-6 flex items-center gap-2 font-code text-xs font-bold uppercase',
                  },
                  [
                    ui.span({ class: 'mr-1 text-coal/70' }, ['Theme']),
                    ui.button(
                      {
                        type: 'button',
                        'aria-pressed': ctx.theme === 'grain',
                        class: 'border-4 border-coal px-3 py-1.5 aria-pressed:bg-coal aria-pressed:text-paper',
                        on: { click: ui.set(ctx.theme, 'grain') },
                      },
                      ['Grain'],
                    ),
                    ui.button(
                      {
                        type: 'button',
                        'aria-pressed': ctx.theme === 'joinery',
                        class: 'border-4 border-coal px-3 py-1.5 aria-pressed:bg-coal aria-pressed:text-paper',
                        on: { click: ui.set(ctx.theme, 'joinery') },
                      },
                      ['Joinery'],
                    ),
                  ],
                ),
              ]),
            ],
          ),
        ],
      ),

      ui.section({ 'aria-labelledby': 'install', class: 'border-b-4 border-coal' }, [
        ui.div({ class: 'mx-auto max-w-6xl px-5 py-16 md:py-24' }, [
          kicker('Install', false),
          heading('install', 'Two ways in.', 'Both take a minute.'),
          ui.div(
            {
              class: 'mt-10 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2',
            },
            [
              ui.div(
                {
                  class: 'grid min-w-0 content-start gap-4 border-4 border-coal bg-card p-5 shadow-[8px_8px_0_var(--color-coal)] sm:p-6',
                },
                [
                  ui.p({ class: 'text-xl font-black uppercase' }, ['A new app']),
                  ui.p({ class: 'text-coal/80' }, ['Start with the kit already in place.']),
                  command('npx create-hozu@next my-app --ui', ctx.copied === 'npx create-hozu@next my-app --ui', false),
                  ui.p({ class: 'text-sm text-coal/70' }, [
                    '@next is the Hozu 1.0 candidate. Without --ui, create-hozu asks whether to add the kit.',
                  ]),
                ],
              ),
              ui.div(
                {
                  class: 'grid min-w-0 content-start gap-4 border-4 border-coal bg-card p-5 shadow-[8px_8px_0_var(--color-coal)] sm:p-6',
                },
                [
                  ui.p({ class: 'text-xl font-black uppercase' }, ['An app you already have']),
                  ui.p({ class: 'text-coal/80' }, [
                    'The kit needs Hozu 1.0. Upgrade the app to the candidate first, then add the package and copy the kit into ui/.',
                  ]),
                  command(
                    'npx -p @hozu/cli@next hozu migrate',
                    ctx.copied === 'npx -p @hozu/cli@next hozu migrate',
                    false,
                  ),
                  command('npm install @hozu/variants@next', ctx.copied === 'npm install @hozu/variants@next', false),
                  command('npm install -D @hozu/ui-kit', ctx.copied === 'npm install -D @hozu/ui-kit', false),
                  command('npx hozu add kit ui --from official', ctx.copied === 'npx hozu add kit ui --from official', false),
                  ui.p({ class: 'text-sm text-coal/70' }, ['Or one at a time: npx hozu add component ui Button --from official']),
                ],
              ),
            ],
          ),
        ]),
      ]),

      devtoolsSection(false),

      ui.section({ 'aria-labelledby': 'files', class: 'border-b-4 border-coal' }, [
        ui.div({ class: 'mx-auto max-w-6xl px-5 py-16 md:py-24' }, [
          kicker('Your files', false),
          heading('files', 'It is your code.', 'Not a dependency.'),
          ui.div(
            {
              class: 'mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
            },
            [
              ui.pre(
                {
                  class: 'min-w-0 overflow-x-auto border-4 border-coal bg-coal p-5 font-code text-sm leading-relaxed text-paper',
                },
                [
                  ui.code({}, [
                    ...files.map(([path, note]) =>
                      ui.span({ class: 'block whitespace-pre' }, [path.padEnd(24, ' '), ui.span({ class: 'text-sand' }, [`# ${note}`])]),
                    ),
                  ]),
                ],
              ),
              ui.div({ class: 'grid content-start gap-6 sm:grid-cols-2' }, [
                point('Use one', 'Import it from ui/ and place it with ui.use. npx hozu docs ui tells your AI which one fits which need.'),
                point('Change every use', 'Edit the component’s own file: its styles, props and parts. Every page follows.'),
                point('Change one use', 'Add a class at that one place. hozu check counts where you override the component.'),
                point(
                  'Colours are roles',
                  'bg-surface, text-ink, bg-accent… The theme replaces the Tailwind palette, so a stray bg-blue-600 is reported.',
                ),
              ]),
            ],
          ),
        ]),
      ]),

      ui.section(
        {
          'aria-labelledby': 'updates',
          class: 'border-b-4 border-coal bg-card',
        },
        [
          ui.div(
            {
              class: 'mx-auto grid max-w-6xl gap-10 px-5 py-16 md:py-24 lg:grid-cols-2 lg:items-center',
            },
            [
              ui.div({ class: 'min-w-0' }, [kicker('Updates', false), heading('updates', 'Updates keep', 'your edits.')]),
              ui.div({ class: 'grid min-w-0 gap-4' }, [
                ui.p({ class: 'text-lg text-pretty' }, [
                  'The kit remembers each file as it was installed. A sync replaces the files you did not touch and lists the ones you changed, so nothing of yours is overwritten.',
                ]),
                command('npx hozu add kit ui --sync', ctx.copied === 'npx hozu add kit ui --sync', false),
              ]),
            ],
          ),
        ],
      ),

      ui.section({ 'aria-labelledby': 'themes', class: 'border-b-4 border-coal' }, [
        ui.div({ class: 'mx-auto max-w-6xl px-5 py-16 md:py-24' }, [
          kicker('Themes', false),
          heading('themes', 'Two themes.', 'Then make it yours.'),
          ui.div(
            {
              class: 'mt-10 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-3',
            },
            [
              point('Grain', 'Calm and rounded, for tools people use all day. The default.'),
              point('Joinery', 'Square corners, hard shadows and heavy type, like this site. data-theme="joinery" on any ancestor.'),
              point('Dark mode', 'Your call: data-mode="dark", or "system" to follow the device. Every role has both values.'),
            ],
          ),
        ]),
      ]),

      ui.section({ 'aria-labelledby': 'start', class: 'bg-signal' }, [
        ui.div(
          {
            class: 'mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-8 px-5 py-16 md:py-20',
          },
          [
            ui.h2(
              {
                id: 'start',
                class: 'text-4xl leading-[0.95] font-black tracking-tight uppercase md:text-6xl',
              },
              ['Pick a component.'],
            ),
            ui.div({ class: 'flex items-end gap-6' }, [
              ui.img({
                src: ui.asset(new URL('../../assets/peg-suit-present.svg', import.meta.url)),
                width: 250,
                height: 290,
                alt: 'Peg in a suit, presenting a button on a tray',
                class: 'h-auto w-32 md:w-40',
              }),
              posterButton(ui.link(components, null), 'Open the catalogue →', true),
            ]),
          ],
        ),
      ]),
    ]),
})
