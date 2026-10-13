import { part, ui } from '@hozu/core'
import { components, home } from '../../routes.ts'
import { Badge } from '../../ui/badge.ts'
import { Button, LinkButton } from '../../ui/button.ts'
import { Card } from '../../ui/card.ts'
import { Dialog } from '../../ui/dialog.ts'
import { Field } from '../../ui/field.ts'
import { Icon } from '../../ui/icon.ts'
import { contract, island, machine, request, tenon } from '../../ui/icons/hozu.ts'
import {
  arrowDown,
  arrowUp,
  check,
  chevronDown,
  chevronLeft,
  chevronRight,
  chevronUp,
  circleAlert,
  download,
  ellipsis,
  externalLink,
  funnel,
  inbox,
  info,
  lock,
  menu,
  minus,
  packageIcon,
  pencil,
  plus,
  search,
  trash,
  x,
} from '../../ui/icons/lucide.ts'
import { Input } from '../../ui/input.ts'
import { DropdownMenu, MenuItem } from '../../ui/menu.ts'
import { Metric } from '../../ui/metric.ts'
import { NavBar, NavLink, Pagination } from '../../ui/nav.ts'
import { PageHeader } from '../../ui/page-header.ts'
import { EmptyState, Notice, Problem } from '../../ui/states.ts'
import { Table, Td, Th, Tr } from '../../ui/table.ts'
import { site } from './model.ts'
import { type Row, specs } from './specs.ts'

type Node = ReturnType<typeof ui.div>

const index: [string, [string, string][]][] = [
  [
    'Actions',
    [
      ['button', 'Button'],
      ['link-button', 'LinkButton'],
    ],
  ],
  [
    'Forms',
    [
      ['input', 'Input'],
      ['field', 'Field'],
    ],
  ],
  [
    'Data display',
    [
      ['badge', 'Badge'],
      ['card', 'Card'],
      ['metric', 'Metric'],
      ['table', 'Table'],
    ],
  ],
  [
    'Feedback',
    [
      ['notice', 'Notice'],
      ['empty-state', 'EmptyState · Problem'],
    ],
  ],
  [
    'Navigation',
    [
      ['nav', 'NavBar · NavLink'],
      ['pagination', 'Pagination'],
    ],
  ],
  [
    'Overlays',
    [
      ['dialog', 'Dialog'],
      ['dropdown-menu', 'DropdownMenu'],
    ],
  ],
  ['Layout', [['page-header', 'PageHeader']]],
  ['Icons', [['icon', 'Icon']]],
]

const cell = part((label: string, node: Node) =>
  ui.div({ class: 'grid min-w-0 content-start justify-items-start gap-2' }, [
    ui.p(
      {
        class: 'font-mono text-[0.6875rem] tracking-wide text-ink-muted uppercase',
      },
      [label],
    ),
    node,
  ]),
)

const props = part((rows: Row[]) =>
  ui.div({ class: 'min-w-0 overflow-x-auto border-4 border-coal bg-card' }, [
    ui.ul(
      {
        class: 'divide-y-2 divide-coal/15 sm:hidden',
        'aria-label': 'Props, variants and slots',
      },
      [
        ...rows.map(([name, kind, values, fallback]) =>
          ui.li({ class: 'grid gap-1 px-4 py-3' }, [
            ui.p({ class: 'flex flex-wrap items-baseline gap-x-3' }, [
              ui.span({ class: 'font-code text-[0.8125rem] font-bold' }, [name]),
              ui.span({ class: 'font-code text-xs text-ember' }, [kind]),
            ]),
            ui.p({ class: 'text-sm text-coal/85' }, [values]),
            ui.p({ class: 'font-code text-xs text-coal/70' }, [`default: ${fallback}`]),
          ]),
        ),
      ],
    ),
    ui.table({ class: 'hidden w-full text-left text-sm sm:table' }, [
      ui.thead(
        {
          class: 'bg-coal font-code text-xs tracking-widest text-paper uppercase',
        },
        [
          ui.tr({}, [
            ui.th({ scope: 'col', class: 'px-4 py-2.5 font-bold' }, ['Name']),
            ui.th({ scope: 'col', class: 'px-4 py-2.5 font-bold' }, ['Kind']),
            ui.th({ scope: 'col', class: 'px-4 py-2.5 font-bold' }, ['Values']),
            ui.th({ scope: 'col', class: 'px-4 py-2.5 font-bold' }, ['Default']),
          ]),
        ],
      ),
      ui.tbody({ class: 'divide-y-2 divide-coal/15' }, [
        ...rows.map(([name, kind, values, fallback]) =>
          ui.tr({}, [
            ui.th(
              {
                scope: 'row',
                class: 'px-4 py-2.5 align-top font-code text-[0.8125rem] font-bold whitespace-nowrap',
              },
              [name],
            ),
            ui.td(
              {
                class: 'px-4 py-2.5 align-top font-code text-xs whitespace-nowrap text-ember',
              },
              [kind],
            ),
            ui.td({ class: 'px-4 py-2.5 align-top text-coal/85' }, [values]),
            ui.td(
              {
                class: 'px-4 py-2.5 align-top font-code text-xs whitespace-nowrap',
              },
              [fallback],
            ),
          ]),
        ),
      ]),
    ]),
  ]),
)

const meta = part((label: string, value: string) =>
  ui.div({ class: 'grid min-w-0 gap-1' }, [
    ui.dt(
      {
        class: 'font-code text-[0.6875rem] font-bold tracking-widest text-ember uppercase',
      },
      [label],
    ),
    ui.dd({ class: 'min-w-0 font-code text-[0.8125rem] break-words' }, [value]),
  ]),
)

const specimen = part(
  (id: string, group: string, name: string, useFor: string, file: string, installs: string[], rows: Row[], theme: string, stage: Node) =>
    ui.section(
      {
        id,
        'aria-labelledby': `${id}-name`,
        class: 'grid min-w-0 scroll-mt-9 gap-6 border-t-4 border-coal pt-8 lg:scroll-mt-0',
      },
      [
        ui.div({ class: 'grid gap-2' }, [
          ui.p(
            {
              class: 'font-code text-xs font-bold tracking-widest text-ember uppercase',
            },
            [group],
          ),
          ui.h2(
            {
              id: `${id}-name`,
              class: 'text-4xl leading-none font-black tracking-tight break-words uppercase md:text-5xl',
            },
            [name],
          ),
          ui.p({ class: 'max-w-2xl text-lg text-pretty' }, [ui.span({ class: 'font-black uppercase' }, ['Use it for ']), useFor]),
        ]),
        ui.div(
          {
            class: 'min-w-0 border-4 border-coal shadow-[8px_8px_0_var(--color-coal)]',
          },
          [
            ui.div(
              {
                class: 'flex items-center justify-between gap-3 bg-coal px-3 py-2 font-code text-xs text-paper',
              },
              [ui.span({}, [file]), ui.span({ class: 'text-signal uppercase' }, [theme])],
            ),
            ui.div({ class: 'min-w-0 overflow-x-auto p-5 sm:p-8', 'data-stage': '' }, [stage]),
          ],
        ),
        ui.div(
          {
            class: 'grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_16rem]',
          },
          [
            props(rows),
            ui.dl(
              {
                class: 'grid content-start gap-4 border-4 border-coal bg-card p-4',
              },
              [
                meta('Lives in', file),
                ui.div({ class: 'grid min-w-0 gap-1' }, [
                  ui.dt(
                    {
                      class: 'font-code text-[0.6875rem] font-bold tracking-widest text-ember uppercase',
                    },
                    ['Install'],
                  ),
                  ...installs.map((n) =>
                    ui.dd(
                      {
                        class: 'min-w-0 bg-coal px-2 py-1.5 font-code text-xs break-words text-paper',
                      },
                      [`npx hozu add component ui ${n} --from official`],
                    ),
                  ),
                ]),
                ui.div({ class: 'grid min-w-0 gap-1' }, [
                  ui.dt(
                    {
                      class: 'font-code text-[0.6875rem] font-bold tracking-widest text-ember uppercase',
                    },
                    ['With DevTools'],
                  ),
                  ui.dd({ class: 'text-sm' }, [`Assets → Hozu UI → ${installs[0]}, then drag it onto your page where you want it.`]),
                ]),
              ],
            ),
          ],
        ),
      ],
    ),
)

const iconCell = part((name: string, d: string) =>
  ui.li(
    {
      class: 'flex min-w-0 flex-col items-center gap-2 rounded-control border border-line bg-surface p-3 text-[0.6875rem] text-ink-muted',
    },
    [ui.use(Icon, { variant: { size: 'md' }, props: { d } }), ui.span({ class: 'max-w-full truncate font-mono' }, [name])],
  ),
)

const lucide: [string, string][] = [
  ['arrowDown', arrowDown],
  ['arrowUp', arrowUp],
  ['check', check],
  ['chevronDown', chevronDown],
  ['chevronLeft', chevronLeft],
  ['chevronRight', chevronRight],
  ['chevronUp', chevronUp],
  ['circleAlert', circleAlert],
  ['download', download],
  ['ellipsis', ellipsis],
  ['externalLink', externalLink],
  ['funnel', funnel],
  ['inbox', inbox],
  ['info', info],
  ['lock', lock],
  ['menu', menu],
  ['minus', minus],
  ['packageIcon', packageIcon],
  ['pencil', pencil],
  ['plus', plus],
  ['search', search],
  ['trash', trash],
  ['x', x],
]
const hozu: [string, string][] = [
  ['tenon', tenon],
  ['machine', machine],
  ['contract', contract],
  ['request', request],
  ['island', island],
]

export const Gallery = ui.view({
  machine: site,
  render: ({ ctx }) =>
    ui.main(
      {
        id: 'main',
        class: 'font-poster',
        'data-poster': '',
        'data-theme': ctx.theme,
      },
      [
        ui.section(
          {
            'aria-labelledby': 'catalogue',
            class: 'border-b-4 border-coal',
            'data-grid': '',
          },
          [
            ui.div(
              {
                class: 'mx-auto grid max-w-6xl gap-8 px-5 py-14 md:py-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end',
              },
              [
                ui.div({ class: 'min-w-0' }, [
                  ui.p(
                    {
                      class: 'mb-5 font-code text-xs font-bold tracking-widest text-ember uppercase',
                    },
                    ['Components · 22 in 13 files'],
                  ),
                  ui.h1(
                    {
                      id: 'catalogue',
                      class: 'text-5xl leading-[0.9] font-black tracking-tight uppercase md:text-7xl',
                    },
                    ['Every piece. ', ui.span({ class: 'text-signal' }, ['Live.'])],
                  ),
                  ui.p({ class: 'mt-6 max-w-2xl text-lg text-pretty' }, [
                    'Each one is drawn from the kit’s current source, in the kit’s own theme. Switch between Grain and Joinery to see both. What you see is what lands in your ui/ folder.',
                  ]),
                ]),
                ui.div(
                  {
                    role: 'group',
                    'aria-label': 'Theme of the previews',
                    class: 'flex items-center gap-2 font-code text-xs font-bold uppercase',
                  },
                  [
                    ui.span({ class: 'mr-1 text-coal/70' }, ['Theme']),
                    ui.button(
                      {
                        type: 'button',
                        'aria-pressed': ctx.theme === 'grain',
                        class: 'border-4 border-coal bg-paper px-3 py-1.5 aria-pressed:bg-coal aria-pressed:text-paper',
                        on: { click: ui.set(ctx.theme, 'grain') },
                      },
                      ['Grain'],
                    ),
                    ui.button(
                      {
                        type: 'button',
                        'aria-pressed': ctx.theme === 'joinery',
                        class: 'border-4 border-coal bg-paper px-3 py-1.5 aria-pressed:bg-coal aria-pressed:text-paper',
                        on: { click: ui.set(ctx.theme, 'joinery') },
                      },
                      ['Joinery'],
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),

        ui.div(
          {
            class: 'mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-10 px-5 pt-6 pb-20 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-12 lg:pt-12',
          },
          [
            ui.nav(
              {
                'aria-label': 'Components on this page',
                class:
                  'sticky top-[4.5rem] z-20 -mx-5 flex gap-6 overflow-x-auto border-b-4 border-coal bg-paper px-5 py-3 lg:top-28 lg:mx-0 lg:grid lg:content-start lg:gap-5 lg:self-start lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0',
              },
              [
                ...index.map(([group, items]) =>
                  ui.div(
                    {
                      class: 'flex shrink-0 items-center gap-3 lg:grid lg:gap-1.5',
                    },
                    [
                      ui.p(
                        {
                          class: 'font-code text-[0.6875rem] font-bold tracking-widest whitespace-nowrap text-ember uppercase',
                        },
                        [group],
                      ),
                      ...items.map(([id, label]) =>
                        ui.a(
                          {
                            href: `#${id}`,
                            class: 'text-sm font-bold whitespace-nowrap hover:text-signal hover:underline lg:text-[0.9375rem]',
                          },
                          [label],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            ui.div({ class: 'grid min-w-0 gap-20' }, [
              specimen(
                'button',
                'Actions',
                'Button',
                'the actions of a form or toolbar. The one main action is primary; the rest are secondary or quiet.',
                'ui/button.ts',
                ['Button'],
                specs.button,
                ctx.theme,
                ui.div({ class: 'grid gap-8' }, [
                  ui.div(
                    {
                      class: 'grid grid-cols-[auto_repeat(3,minmax(max-content,1fr))] items-center gap-x-6 gap-y-4',
                    },
                    [
                      ui.span({}, []),
                      ...['sm', 'md', 'icon'].map((s) =>
                        ui.p(
                          {
                            class: 'font-mono text-[0.6875rem] tracking-wide text-ink-muted uppercase',
                          },
                          [`size ${s}`],
                        ),
                      ),
                      ...(['primary', 'secondary', 'quiet', 'destructive'] as const).map((intent) =>
                        ui.div({ class: 'contents' }, [
                          ui.p(
                            {
                              class: 'font-mono text-[0.6875rem] tracking-wide text-ink-muted uppercase',
                            },
                            [intent],
                          ),
                          ui.div({}, [ui.use(Button, { variant: { intent, size: 'sm' } }, ['Save'])]),
                          ui.div({}, [ui.use(Button, { variant: { intent, size: 'md' } }, ['Save'])]),
                          ui.div({}, [
                            ui.use(
                              Button,
                              {
                                variant: { intent, size: 'icon' },
                                props: { label: 'Add' },
                                slots: {
                                  icon: ui.use(Icon, { props: { d: plus } }),
                                },
                              },
                              [],
                            ),
                          ]),
                        ]),
                      ),
                    ],
                  ),
                  ui.div({ class: 'flex flex-wrap gap-6 border-t border-line pt-6' }, [
                    cell(
                      'with an icon',
                      ui.use(
                        Button,
                        {
                          slots: {
                            icon: ui.use(Icon, { props: { d: download } }),
                          },
                        },
                        ['Export'],
                      ),
                    ),
                    cell(
                      'busy',
                      ui.use(
                        Button,
                        {
                          variant: { intent: 'primary' },
                          props: { busy: true },
                        },
                        ['Saving…'],
                      ),
                    ),
                    cell('disabled', ui.use(Button, { props: { disabled: true } }, ['Archive'])),
                    cell(
                      'opens a dialog',
                      ui.use(
                        Button,
                        {
                          variant: { intent: 'destructive' },
                          props: {
                            commandfor: 'demo-dialog',
                            command: 'show-modal',
                          },
                        },
                        ['Delete…'],
                      ),
                    ),
                  ]),
                ]),
              ),

              specimen(
                'link-button',
                'Actions',
                'LinkButton',
                'a link that should look like a button: “View all orders”, a call to action.',
                'ui/button.ts',
                ['LinkButton'],
                specs.linkButton,
                ctx.theme,
                ui.div({ class: 'flex flex-wrap gap-6' }, [
                  cell(
                    'primary',
                    ui.use(
                      LinkButton,
                      {
                        variant: { intent: 'primary' },
                        props: { href: ui.link(home, null) },
                      },
                      ['Back to the start'],
                    ),
                  ),
                  cell(
                    'secondary + icon',
                    ui.use(
                      LinkButton,
                      {
                        props: { href: 'https://hozu.org' },
                        slots: {
                          icon: ui.use(Icon, { props: { d: externalLink } }),
                        },
                      },
                      ['hozu.org'],
                    ),
                  ),
                  cell(
                    'quiet, sm',
                    ui.use(
                      LinkButton,
                      {
                        variant: { intent: 'quiet', size: 'sm' },
                        props: { href: ui.link(components, null) },
                      },
                      ['All components'],
                    ),
                  ),
                ]),
              ),

              specimen(
                'input',
                'Forms',
                'Input',
                'one line of text, an email, a number or a date. Put it in a Field so it has a label.',
                'ui/input.ts',
                ['Input'],
                specs.input,
                ctx.theme,
                ui.div({ class: 'grid gap-6 sm:grid-cols-3' }, [
                  cell(
                    'size sm',
                    ui.use(Input, {
                      variant: { size: 'sm' },
                      props: {
                        name: 'demo-sm',
                        label: 'Small input',
                        placeholder: 'Search',
                      },
                    }),
                  ),
                  cell(
                    'size md',
                    ui.use(Input, {
                      props: {
                        name: 'demo-md',
                        label: 'Medium input',
                        placeholder: 'Acme',
                      },
                    }),
                  ),
                  cell(
                    'size lg',
                    ui.use(Input, {
                      variant: { size: 'lg' },
                      props: {
                        name: 'demo-lg',
                        label: 'Large input',
                        placeholder: 'Your name',
                      },
                    }),
                  ),
                  cell(
                    'invalid',
                    ui.use(Input, {
                      props: {
                        name: 'demo-bad',
                        label: 'Invalid input',
                        type: 'email',
                        value: 'ada.example.com',
                        invalid: true,
                      },
                    }),
                  ),
                  cell(
                    'disabled',
                    ui.use(Input, {
                      props: {
                        name: 'demo-off',
                        label: 'Disabled input',
                        value: 'Locked',
                        disabled: true,
                      },
                    }),
                  ),
                  cell(
                    'type date',
                    ui.use(Input, {
                      props: {
                        name: 'demo-date',
                        label: 'Date input',
                        type: 'date',
                        value: '2026-10-13',
                      },
                    }),
                  ),
                ]),
              ),

              specimen(
                'field',
                'Forms',
                'Field',
                'a labelled control with a hint and an error message that screen readers announce.',
                'ui/field.ts',
                ['Field'],
                specs.field,
                ctx.theme,
                ui.div({ class: 'grid gap-8 sm:grid-cols-2' }, [
                  cell(
                    'with a hint',
                    ui.use(Field, {
                      props: {
                        for: 'demo-name',
                        label: 'Project name',
                        hint: 'Shown on invoices.',
                        errorId: 'demo-name-error',
                      },
                      slots: {
                        control: ui.use(Input, {
                          props: {
                            id: 'demo-name',
                            name: 'name',
                            placeholder: 'Acme',
                            describedby: 'demo-name-error',
                          },
                        }),
                      },
                      class: 'w-full',
                    }),
                  ),
                  cell(
                    'with an error',
                    ui.use(Field, {
                      props: {
                        for: 'demo-email',
                        label: 'Email',
                        error: 'Use an address with an @.',
                        errorId: 'demo-email-error',
                      },
                      slots: {
                        control: ui.use(Input, {
                          props: {
                            id: 'demo-email',
                            name: 'email',
                            type: 'email',
                            value: 'ada.example.com',
                            invalid: true,
                            describedby: 'demo-email-error',
                          },
                        }),
                      },
                      class: 'w-full',
                    }),
                  ),
                ]),
              ),

              specimen(
                'badge',
                'Data display',
                'Badge',
                'a status word next to a row or a title. Its tone is a prop, so it can come from your data.',
                'ui/badge.ts',
                ['Badge'],
                specs.badge,
                ctx.theme,
                ui.div({ class: 'grid gap-6' }, [
                  cell(
                    'shape pill · every tone',
                    ui.div({ class: 'flex flex-wrap gap-2' }, [
                      ui.use(Badge, {
                        props: { tone: 'neutral', label: 'Draft' },
                      }),
                      ui.use(Badge, {
                        props: { tone: 'info', label: 'Shipped' },
                      }),
                      ui.use(Badge, {
                        props: { tone: 'success', label: 'Paid' },
                      }),
                      ui.use(Badge, {
                        props: { tone: 'warning', label: 'Overdue' },
                      }),
                      ui.use(Badge, {
                        props: { tone: 'danger', label: 'Failed' },
                      }),
                      ui.use(Badge, {
                        props: { tone: 'accent', label: 'New' },
                      }),
                    ]),
                  ),
                  cell(
                    'shape square',
                    ui.div({ class: 'flex flex-wrap gap-2' }, [
                      ui.use(Badge, {
                        variant: { shape: 'square' },
                        props: { tone: 'neutral', label: 'v0.1.0' },
                      }),
                      ui.use(Badge, {
                        variant: { shape: 'square' },
                        props: { tone: 'success', label: 'Live' },
                      }),
                      ui.use(Badge, {
                        variant: { shape: 'square' },
                        props: { tone: 'accent', label: 'Beta' },
                      }),
                    ]),
                  ),
                ]),
              ),

              specimen(
                'card',
                'Data display',
                'Card',
                'a boxed group with a title: a settings block, a summary, a table with its header.',
                'ui/card.ts',
                ['Card'],
                specs.card,
                ctx.theme,
                ui.div({ class: 'grid gap-6 md:grid-cols-2' }, [
                  cell(
                    'title, description, actions',
                    ui.use(
                      Card,
                      {
                        props: { title: 'Team', description: '3 people' },
                        slots: {
                          actions: ui.use(Button, { variant: { size: 'sm' } }, ['Invite']),
                        },
                        class: 'w-full',
                      },
                      [ui.p({ class: 'text-sm text-ink-muted' }, ['Ada, Grace and Linus can edit every page of this project.'])],
                    ),
                  ),
                  cell(
                    'no title',
                    ui.use(Card, { class: 'w-full' }, [
                      ui.p({ class: 'text-sm font-semibold' }, ['Free plan']),
                      ui.p({ class: 'mt-1 text-sm text-ink-muted' }, ['3 of 5 projects used.']),
                    ]),
                  ),
                ]),
              ),

              specimen(
                'metric',
                'Data display',
                'Metric',
                'a number that matters, with a label and how it changed.',
                'ui/metric.ts',
                ['Metric'],
                specs.metric,
                ctx.theme,
                ui.div({ class: 'grid gap-4 sm:grid-cols-3' }, [
                  cell(
                    'trend up',
                    ui.use(Metric, {
                      props: {
                        label: 'Revenue',
                        value: '$48,210',
                        delta: '+12.4%',
                        trend: 'up',
                        period: 'vs last month',
                      },
                      class: 'w-full',
                    }),
                  ),
                  cell(
                    'trend down',
                    ui.use(Metric, {
                      props: {
                        label: 'Open orders',
                        value: '27',
                        delta: '−3',
                        trend: 'down',
                        period: 'since Monday',
                      },
                      class: 'w-full',
                    }),
                  ),
                  cell(
                    'flat, no delta',
                    ui.use(Metric, {
                      props: { label: 'Customers', value: '1,204' },
                      class: 'w-full',
                    }),
                  ),
                ]),
              ),

              specimen(
                'table',
                'Data display',
                'Table · Tr · Th · Td',
                'rows and columns of records. Numbers align to the end; the first column can be strong.',
                'ui/table.ts',
                ['Table', 'Tr', 'Th', 'Td'],
                specs.table,
                ctx.theme,
                ui.use(
                  Card,
                  {
                    variant: { pad: 'none' },
                    props: { title: 'Orders', description: 'This week' },
                  },
                  [
                    ui.use(
                      Table,
                      {
                        slots: {
                          head: ui.use(Tr, {}, [
                            ui.use(Th, {}, ['Order']),
                            ui.use(Th, {}, ['Customer']),
                            ui.use(Th, {}, ['Status']),
                            ui.use(Th, { variant: { align: 'end' } }, ['Total']),
                          ]),
                        },
                      },
                      [
                        ui.use(Tr, {}, [
                          ui.use(Td, { variant: { emphasis: 'strong' } }, ['#1042']),
                          ui.use(Td, {}, ['Ada Lovelace']),
                          ui.use(Td, {}, [
                            ui.use(Badge, {
                              props: { tone: 'success', label: 'Paid' },
                            }),
                          ]),
                          ui.use(Td, { variant: { align: 'end' } }, ['$1,280.00']),
                        ]),
                        ui.use(Tr, {}, [
                          ui.use(Td, { variant: { emphasis: 'strong' } }, ['#1041']),
                          ui.use(Td, {}, ['Grace Hopper']),
                          ui.use(Td, {}, [
                            ui.use(Badge, {
                              props: { tone: 'info', label: 'Shipped' },
                            }),
                          ]),
                          ui.use(Td, { variant: { align: 'end' } }, ['$342.50']),
                        ]),
                        ui.use(Tr, {}, [
                          ui.use(Td, { variant: { emphasis: 'strong' } }, ['#1040']),
                          ui.use(Td, { variant: { emphasis: 'muted' } }, ['Linus Torvalds']),
                          ui.use(Td, {}, [
                            ui.use(Badge, {
                              props: { tone: 'warning', label: 'Overdue' },
                            }),
                          ]),
                          ui.use(Td, { variant: { align: 'end' } }, ['$96.00']),
                        ]),
                      ],
                    ),
                  ],
                ),
              ),

              specimen(
                'notice',
                'Feedback',
                'Notice',
                'a short message after an action: “Saved.” As a toast it sits at the bottom right of the window.',
                'ui/states.ts',
                ['Notice'],
                specs.notice,
                ctx.theme,
                ui.div({ class: 'grid gap-6 sm:grid-cols-2' }, [
                  cell(
                    'inline · tone info',
                    ui.use(Notice, {
                      variant: { placement: 'inline' },
                      props: { message: 'Saved. Your changes are live.' },
                    }),
                  ),
                  cell(
                    'inline · tone danger',
                    ui.use(Notice, {
                      variant: { placement: 'inline' },
                      props: {
                        message: 'Could not save. Try again.',
                        tone: 'danger',
                      },
                    }),
                  ),
                ]),
              ),

              specimen(
                'empty-state',
                'Feedback',
                'EmptyState · Problem',
                'a list with nothing in it yet, and a part of the page that could not load.',
                'ui/states.ts',
                ['EmptyState', 'Problem'],
                specs.empty,
                ctx.theme,
                ui.div({ class: 'grid gap-6 md:grid-cols-2' }, [
                  cell(
                    'EmptyState · size inline',
                    ui.div(
                      {
                        class: 'w-full rounded-card border border-dashed border-line-strong bg-surface',
                      },
                      [
                        ui.use(EmptyState, {
                          props: {
                            title: 'No orders yet',
                            body: 'New orders show up here as soon as they are placed.',
                          },
                          slots: {
                            action: ui.use(
                              Button,
                              {
                                variant: { size: 'sm' },
                                slots: {
                                  icon: ui.use(Icon, { props: { d: inbox } }),
                                },
                              },
                              ['Open the shop'],
                            ),
                          },
                        }),
                      ],
                    ),
                  ),
                  cell(
                    'Problem',
                    ui.div(
                      {
                        class: 'w-full rounded-card border border-line bg-surface',
                      },
                      [
                        ui.use(Problem, {
                          props: {
                            title: 'Orders could not load',
                            body: 'The server did not answer. Try again in a moment.',
                          },
                          slots: {
                            action: ui.use(Button, { variant: { size: 'sm' } }, ['Try again']),
                          },
                        }),
                      ],
                    ),
                  ),
                ]),
              ),

              specimen(
                'nav',
                'Navigation',
                'NavBar · NavLink',
                'section links with the current one marked: tabs, filters, a side list, page numbers.',
                'ui/nav.ts',
                ['NavBar', 'NavLink'],
                specs.nav,
                ctx.theme,
                ui.div({ class: 'grid gap-8' }, [
                  cell(
                    'NavBar tabs · NavLink tab',
                    ui.use(NavBar, { props: { label: 'Demo tabs' }, class: 'w-full' }, [
                      ui.use(NavLink, { props: { href: '#nav', current: true, count: 4 } }, ['Orders']),
                      ui.use(NavLink, { props: { href: '#nav' } }, ['Customers']),
                      ui.use(NavLink, { props: { href: '#nav' } }, ['Reports']),
                    ]),
                  ),
                  ui.div({ class: 'grid gap-8 sm:grid-cols-3' }, [
                    cell(
                      'look pill',
                      ui.use(
                        NavBar,
                        {
                          variant: { look: 'plain' },
                          props: { label: 'Demo filters' },
                        },
                        [
                          ui.use(
                            NavLink,
                            {
                              variant: { look: 'pill' },
                              props: { href: '#nav', current: true },
                            },
                            ['All'],
                          ),
                          ui.use(
                            NavLink,
                            {
                              variant: { look: 'pill' },
                              props: { href: '#nav' },
                            },
                            ['Open'],
                          ),
                        ],
                      ),
                    ),
                    cell(
                      'look list',
                      ui.div({ class: 'grid w-44 gap-1' }, [
                        ui.use(
                          NavLink,
                          {
                            variant: { look: 'list' },
                            props: { href: '#nav', current: true },
                          },
                          ['Overview'],
                        ),
                        ui.use(
                          NavLink,
                          {
                            variant: { look: 'list' },
                            props: { href: '#nav' },
                          },
                          ['Settings'],
                        ),
                        ui.use(
                          NavLink,
                          {
                            variant: { look: 'list' },
                            props: { href: '#nav' },
                          },
                          ['Billing'],
                        ),
                      ]),
                    ),
                    cell(
                      'look page',
                      ui.use(
                        NavBar,
                        {
                          variant: { look: 'plain' },
                          props: { label: 'Demo pages' },
                        },
                        [
                          ui.use(
                            NavLink,
                            {
                              variant: { look: 'page' },
                              props: { href: '#nav', current: true },
                            },
                            ['1'],
                          ),
                          ui.use(
                            NavLink,
                            {
                              variant: { look: 'page' },
                              props: { href: '#nav' },
                            },
                            ['2'],
                          ),
                          ui.use(
                            NavLink,
                            {
                              variant: { look: 'page' },
                              props: { href: '#nav' },
                            },
                            ['3'],
                          ),
                        ],
                      ),
                    ),
                  ]),
                ]),
              ),

              specimen(
                'pagination',
                'Navigation',
                'Pagination',
                'previous and next pages of a long list, as plain links that work without JavaScript.',
                'ui/nav.ts',
                ['Pagination'],
                specs.pagination,
                ctx.theme,
                ui.div({ class: 'grid gap-6' }, [
                  cell(
                    'first page',
                    ui.use(Pagination, {
                      props: {
                        summary: '1–10 of 42',
                        prevHref: null,
                        nextHref: '#pagination',
                      },
                      class: 'w-full',
                    }),
                  ),
                  cell(
                    'a middle page',
                    ui.use(Pagination, {
                      props: {
                        summary: '11–20 of 42',
                        prevHref: '#pagination',
                        nextHref: '#pagination',
                      },
                      class: 'w-full',
                    }),
                  ),
                ]),
              ),

              specimen(
                'dialog',
                'Overlays',
                'Dialog',
                'a question or a short form on top of the page. A destructive action asks here first.',
                'ui/dialog.ts',
                ['Dialog'],
                specs.dialog,
                ctx.theme,
                ui.div({ class: 'grid gap-6' }, [
                  cell(
                    'try it: opens as a modal, no JavaScript needed',
                    ui.use(
                      Button,
                      {
                        variant: { intent: 'destructive' },
                        props: {
                          commandfor: 'demo-dialog',
                          command: 'show-modal',
                        },
                      },
                      ['Delete project…'],
                    ),
                  ),
                  ui.use(
                    Dialog,
                    {
                      props: {
                        id: 'demo-dialog',
                        title: 'Delete this project?',
                        description: 'This cannot be undone.',
                      },
                      slots: {
                        footer: ui.div({ class: 'flex gap-2' }, [
                          ui.use(
                            Button,
                            {
                              props: {
                                commandfor: 'demo-dialog',
                                command: 'close',
                              },
                            },
                            ['Keep it'],
                          ),
                          ui.use(
                            Button,
                            {
                              variant: { intent: 'destructive' },
                              props: {
                                commandfor: 'demo-dialog',
                                command: 'close',
                              },
                            },
                            ['Delete'],
                          ),
                        ]),
                      },
                    },
                    [ui.p({ class: 'text-sm text-ink-muted' }, ['Its pages, data and members are removed. On this page nothing is deleted.'])],
                  ),
                ]),
              ),

              specimen(
                'dropdown-menu',
                'Overlays',
                'DropdownMenu · MenuItem',
                'a few actions behind one button, like the actions of a table row.',
                'ui/menu.ts',
                ['DropdownMenu', 'MenuItem'],
                specs.menu,
                ctx.theme,
                ui.div({ class: 'flex flex-wrap items-start gap-10' }, [
                  cell(
                    'try it',
                    ui.div({ class: 'min-h-40' }, [
                      ui.use(DropdownMenu, { props: { id: 'demo-menu', label: 'Actions' } }, [
                        ui.use(MenuItem, {}, [ui.use(Icon, { props: { d: pencil } }), 'Rename']),
                        ui.use(MenuItem, {}, [ui.use(Icon, { props: { d: download } }), 'Download']),
                        ui.use(
                          MenuItem,
                          {
                            variant: { intent: 'destructive' },
                            props: {
                              commandfor: 'demo-dialog',
                              command: 'show-modal',
                            },
                          },
                          [ui.use(Icon, { props: { d: trash } }), 'Delete…'],
                        ),
                      ]),
                    ]),
                  ),
                  cell(
                    'MenuItem · intent normal, destructive',
                    ui.div(
                      {
                        class: 'grid w-48 rounded-card border border-line bg-surface-raised p-1 shadow-overlay',
                      },
                      [
                        ui.use(MenuItem, {}, [ui.use(Icon, { props: { d: pencil } }), 'Rename']),
                        ui.use(MenuItem, { variant: { intent: 'destructive' } }, [ui.use(Icon, { props: { d: trash } }), 'Delete…']),
                      ],
                    ),
                  ),
                ]),
              ),

              specimen(
                'page-header',
                'Layout',
                'PageHeader',
                'the top of a page: its title, a line about it, and its main actions.',
                'ui/page-header.ts',
                ['PageHeader'],
                specs.pageHeader,
                ctx.theme,
                ui.div({ class: 'grid gap-8' }, [
                  cell(
                    'size app',
                    ui.use(PageHeader, {
                      props: {
                        title: 'Orders',
                        description: 'Everything placed this month.',
                      },
                      slots: {
                        eyebrow: ui.use(Badge, {
                          props: { tone: 'info', label: 'Shop' },
                        }),
                        actions: ui.use(
                          Button,
                          {
                            variant: { intent: 'primary' },
                            slots: {
                              icon: ui.use(Icon, { props: { d: plus } }),
                            },
                          },
                          ['New order'],
                        ),
                      },
                      class: 'w-full',
                    }),
                  ),
                  cell(
                    'size display',
                    ui.use(PageHeader, {
                      variant: { size: 'display' },
                      props: {
                        title: 'Welcome back',
                        description: 'Three things need you today.',
                      },
                      class: 'w-full',
                    }),
                  ),
                ]),
              ),

              specimen(
                'icon',
                'Icons',
                'Icon',
                'an icon in a button, a menu or a list. Lucide’s paths and Hozu’s own, copied as data: no icon library ships.',
                'ui/icon.ts',
                ['Icon'],
                specs.icon,
                ctx.theme,
                ui.div({ class: 'grid gap-6' }, [
                  cell(
                    'ui/icons/lucide.ts',
                    ui.ul(
                      {
                        class: 'grid w-full grid-cols-3 gap-2 sm:grid-cols-6',
                        'aria-label': 'Lucide icons',
                      },
                      [...lucide.map(([name, d]) => iconCell(name, d))],
                    ),
                  ),
                  cell(
                    'ui/icons/hozu.ts',
                    ui.ul(
                      {
                        class: 'grid w-full grid-cols-3 gap-2 sm:grid-cols-6',
                        'aria-label': 'Hozu icons',
                      },
                      [...hozu.map(([name, d]) => iconCell(name, d))],
                    ),
                  ),
                ]),
              ),
            ]),
          ],
        ),
      ],
    ),
})
