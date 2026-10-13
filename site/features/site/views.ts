import { part, ui } from '@hozu/core'
import { components, home } from '../../routes.ts'
import { Badge } from '../../ui/badge.ts'
import { Button, LinkButton } from '../../ui/button.ts'
import { Card } from '../../ui/card.ts'
import { Dialog } from '../../ui/dialog.ts'
import { Field } from '../../ui/field.ts'
import { Icon } from '../../ui/icon.ts'
import { contract, island, machine, request, tenon } from '../../ui/icons/hozu.ts'
import { download, externalLink, inbox, pencil, plus, search, trash } from '../../ui/icons/lucide.ts'
import { Input } from '../../ui/input.ts'
import { DropdownMenu, MenuItem } from '../../ui/menu.ts'
import { Metric } from '../../ui/metric.ts'
import { NavBar, NavLink, Pagination } from '../../ui/nav.ts'
import { PageHeader } from '../../ui/page-header.ts'
import { EmptyState, Notice, Problem } from '../../ui/states.ts'
import { Table, Td, Th, Tr } from '../../ui/table.ts'
import { Copy, site } from './model.ts'

const repo = 'https://github.com/olevatorr/hozu-ui'

type Node = ReturnType<typeof ui.div>

const code = part((text: string) => ui.code({ class: 'rounded-control bg-surface-sunken px-1 py-0.5 font-mono text-[0.85em] wrap-anywhere' }, [text]))

const command = part((text: string, copied: boolean) =>
  ui.div({ class: 'flex items-center gap-2 rounded-control border border-line bg-surface-sunken py-1 pr-1 pl-3' }, [
    ui.code({ class: 'min-w-0 flex-1 overflow-x-auto py-1 font-mono text-xs whitespace-nowrap text-ink sm:text-sm' }, [text]),
    ui.use(
      Button,
      { variant: { intent: 'quiet', size: 'sm' }, props: { label: copied ? 'Copied' : `Copy: ${text}` }, on: { press: ui.send(Copy, { text }) } },
      [copied ? 'Copied' : 'Copy'],
    ),
  ]),
)

const heading = part((id: string, text: string) => ui.h2({ id, class: 'display text-2xl text-ink' }, [text]))

const specimen = part((id: string, name: string, useFor: string, snippet: string, demo: Node) =>
  ui.section({ id, 'aria-labelledby': `${id}-name`, class: 'grid scroll-mt-6 gap-3 border-t border-line pt-8' }, [
    ui.div({ class: 'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1' }, [
      ui.h2({ id: `${id}-name`, class: 'display text-xl text-ink' }, [name]),
      ui.p({ class: 'text-sm text-ink-muted' }, [useFor]),
    ]),
    ui.div({ class: 'grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]' }, [
      ui.div({ class: 'min-w-0 rounded-card border border-line bg-canvas p-5' }, [demo]),
      ui.pre({ class: 'min-w-0 overflow-x-auto rounded-card border border-line bg-surface-sunken p-4 font-mono text-xs leading-relaxed text-ink' }, [
        ui.code({}, [snippet]),
      ]),
    ]),
  ]),
)

export const Top = ui.view({
  machine: site,
  render: ({ ctx, current }) =>
    ui.header({ class: 'border-b border-line bg-surface', 'data-theme': ctx.theme }, [
      ui.div({ class: 'mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2' }, [
        ui.a({ href: ui.link(home, null), class: 'flex items-center gap-2 py-2 font-semibold text-ink' }, [
          ui.use(Icon, { variant: { size: 'md' }, props: { d: tenon } }),
          'Hozu UI',
        ]),
        ui.div({ role: 'group', 'aria-label': 'Theme', class: 'flex items-center gap-1 rounded-control border border-line-strong p-0.5 text-sm sm:order-last' }, [
          ui.button(
            {
              type: 'button',
              'aria-pressed': ctx.theme === 'grain',
              class: 'cursor-pointer rounded-control px-3 py-1 text-ink-muted hover:text-ink aria-pressed:bg-ink aria-pressed:text-canvas',
              on: { click: ui.set(ctx.theme, 'grain') },
            },
            ['Grain'],
          ),
          ui.button(
            {
              type: 'button',
              'aria-pressed': ctx.theme === 'joinery',
              class: 'cursor-pointer rounded-control px-3 py-1 text-ink-muted hover:text-ink aria-pressed:bg-ink aria-pressed:text-canvas',
              on: { click: ui.set(ctx.theme, 'joinery') },
            },
            ['Joinery'],
          ),
        ]),
        ui.use(NavBar, { variant: { look: 'plain' }, props: { label: 'Site' }, class: 'w-full sm:w-auto' }, [
          ui.use(NavLink, { props: { href: ui.link(home, null), current: current(home) } }, ['Start']),
          ui.use(NavLink, { props: { href: ui.link(components, null), current: current(components) } }, ['Components']),
          ui.use(NavLink, { props: { href: 'https://hozu.org' } }, ['Hozu']),
          ui.use(NavLink, { props: { href: repo } }, ['GitHub']),
        ]),
      ]),
    ]),
})

export const Home = ui.view({
  machine: site,
  render: ({ ctx }) =>
    ui.main({ class: 'mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)] gap-16 px-4 py-12 sm:py-16' }, [
      ui.use(
        PageHeader,
        {
          variant: { size: 'display' },
          props: {
            title: 'Official components for Hozu apps',
            description:
              'Buttons, fields, tables, dialogs and more, copied into your app as plain files. You and your AI change them like the rest of your code.',
          },
          slots: {
            eyebrow: ui.use(Badge, { props: { tone: 'accent', label: '@hozu/ui-kit' } }),
            actions: ui.div({ class: 'flex flex-wrap gap-2' }, [
              ui.use(LinkButton, { variant: { intent: 'primary' }, props: { href: ui.link(components, null) } }, ['See every component']),
              ui.use(LinkButton, { props: { href: 'https://hozu.org' } }, ['What is Hozu?']),
            ]),
          },
        },
      ),

      ui.section({ 'aria-labelledby': 'install', class: 'grid gap-5' }, [
        heading('install', 'Install'),
        ui.div({ class: 'grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2' }, [
          ui.use(Card, { props: { title: 'A new app', description: 'Start with the kit already in place' } }, [
            ui.div({ class: 'grid grid-cols-[minmax(0,1fr)] gap-3' }, [
              command('npx create-hozu@next my-app --ui', ctx.copied === 'npx create-hozu@next my-app --ui'),
              ui.p({ class: 'text-sm text-ink-muted' }, [
                code('@next'),
                ' is the Hozu 1.0 candidate. Without ',
                code('--ui'),
                ', ',
                code('npx create-hozu'),
                ' asks whether to add the kit.',
              ]),
            ]),
          ]),
          ui.use(Card, { props: { title: 'An app you already have', description: 'Add the kit, then use it screen by screen' } }, [
            ui.div({ class: 'grid grid-cols-[minmax(0,1fr)] gap-3' }, [
              command('npm install -D @hozu/ui-kit', ctx.copied === 'npm install -D @hozu/ui-kit'),
              command('npx hozu add kit ui --from official', ctx.copied === 'npx hozu add kit ui --from official'),
              ui.p({ class: 'text-sm text-ink-muted' }, [
                'The files land in ',
                code('ui/'),
                '. One component at a time: ',
                code('npx hozu add component ui Button --from official'),
                '.',
              ]),
            ]),
          ]),
        ]),
      ]),

      ui.div({ class: 'grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-2' }, [
        ui.section({ 'aria-labelledby': 'updates', class: 'grid content-start gap-4' }, [
          heading('updates', 'Updates keep your edits'),
          ui.p({ class: 'text-ink-muted text-pretty' }, [
            'The kit remembers each file as it was installed. A sync replaces the files you did not touch and lists the ones you changed, so nothing of yours is overwritten.',
          ]),
          command('npx hozu add kit ui --sync', ctx.copied === 'npx hozu add kit ui --sync'),
        ]),
        ui.section({ 'aria-labelledby': 'devtools', class: 'grid content-start gap-4' }, [
          heading('devtools', 'Point, describe, hand it over'),
          ui.p({ class: 'text-ink-muted text-pretty' }, [
            'Run ',
            code('npx hozu dev'),
            ' and open DevTools, then Assets, then Hozu UI. Place a component on your page, describe the change you want, and hand the request to your AI.',
          ]),
          command('npx hozu dev', ctx.copied === 'npx hozu dev'),
        ]),
      ]),

      ui.section({ 'aria-labelledby': 'how', class: 'grid gap-5' }, [
        heading('how', 'How it fits together'),
        ui.dl({ class: 'grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-2 text-sm sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-y-5' }, [
          ui.dt({ class: 'font-semibold text-ink not-first:mt-3 sm:not-first:mt-0' }, ['Files']),
          ui.dd({ class: 'text-ink-muted' }, [
            code('ui/kit.ts'),
            ' lists the components, one file each (',
            code('ui/button.ts'),
            ', ',
            code('ui/dialog.ts'),
            '…). ',
            code('ui/theme.css'),
            ' holds the tokens, ',
            code('ui/kit.lock.json'),
            ' what was installed.',
          ]),
          ui.dt({ class: 'font-semibold text-ink not-first:mt-3 sm:not-first:mt-0' }, ['Use one']),
          ui.dd({ class: 'text-ink-muted' }, [
            code("ui.use(Button, { variant: { intent: 'primary' }, props: { type: 'submit' } }, ['Save'])"),
            ', imported from ',
            code('../../ui/button.ts'),
            '.',
          ]),
          ui.dt({ class: 'font-semibold text-ink not-first:mt-3 sm:not-first:mt-0' }, ['Change every use']),
          ui.dd({ class: 'text-ink-muted' }, ["Edit the component's own file: its tv() styles, props and render."]),
          ui.dt({ class: 'font-semibold text-ink not-first:mt-3 sm:not-first:mt-0' }, ['Change one use']),
          ui.dd({ class: 'text-ink-muted' }, [
            'Add ',
            code('class'),
            ' at that use. A property the component already sets needs a trailing ',
            code('!'),
            ' (',
            code('rounded-lg!'),
            '); hozu check counts them (HZ072).',
          ]),
          ui.dt({ class: 'font-semibold text-ink not-first:mt-3 sm:not-first:mt-0' }, ['Colours are roles']),
          ui.dd({ class: 'text-ink-muted' }, [
            code('bg-surface'),
            ', ',
            code('text-ink'),
            ', ',
            code('border-line'),
            ', ',
            code('bg-accent'),
            ', ',
            code('text-danger-text'),
            '… The theme replaces the Tailwind palette, so a class like ',
            code('bg-blue-600'),
            ' is reported (HZ026) instead of drifting from the theme.',
          ]),
          ui.dt({ class: 'font-semibold text-ink not-first:mt-3 sm:not-first:mt-0' }, ['Themes']),
          ui.dd({ class: 'text-ink-muted' }, [
            'Grain by default. ',
            code('data-theme="joinery"'),
            ' on ',
            code('<html>'),
            ' or any ancestor switches; try it at the top of this page. Dark mode is your choice: ',
            code('data-mode="dark"'),
            ' or ',
            code('"system"'),
            '.',
          ]),
          ui.dt({ class: 'font-semibold text-ink not-first:mt-3 sm:not-first:mt-0' }, ['For your AI']),
          ui.dd({ class: 'text-ink-muted' }, [
            code('npx hozu docs ui'),
            ' prints which component fits which need, and ',
            code('npx hozu docs components'),
            ' lists the ones in your app.',
          ]),
          ui.dt({ class: 'font-semibold text-ink not-first:mt-3 sm:not-first:mt-0' }, ['Without JavaScript']),
          ui.dd({ class: 'text-ink-muted' }, [
            'Every component is HTML from the server. Dialog and DropdownMenu open with the browser’s own ',
            code('commandfor'),
            ' and ',
            code('popover'),
            '.',
          ]),
        ]),
      ]),
    ]),
})

export const Footer = ui.view({
  render: () =>
    ui.footer({ class: 'border-t border-line' }, [
      ui.div({ class: 'mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-ink-muted' }, [
        ui.p({}, ['Hozu UI is MIT licensed. Icons from Lucide (ISC) and drawn for Hozu. This site is a Hozu app built from the kit’s current source.']),
        ui.div({ class: 'flex gap-4' }, [
          ui.a({ href: 'https://hozu.org', class: 'text-ink underline-offset-4 hover:underline' }, ['hozu.org']),
          ui.a({ href: repo, class: 'text-ink underline-offset-4 hover:underline' }, ['GitHub']),
        ]),
      ]),
    ]),
})

const toc: [string, string][] = [
  ['button', 'Button'],
  ['link-button', 'LinkButton'],
  ['badge', 'Badge'],
  ['field', 'Field + Input'],
  ['card', 'Card'],
  ['page-header', 'PageHeader'],
  ['metric', 'Metric'],
  ['dialog', 'Dialog'],
  ['dropdown-menu', 'DropdownMenu + MenuItem'],
  ['states', 'EmptyState, Problem, Notice'],
  ['navbar', 'NavBar + NavLink'],
  ['pagination', 'Pagination'],
  ['table', 'Table, Tr, Th, Td'],
  ['icon', 'Icon'],
]

const snippets = {
  button: `ui.use(Button, {
  variant: { intent: 'primary' },
  props: { type: 'submit' },
}, ['Save'])

// intent: primary | secondary | quiet | destructive
// size: sm | md | icon
ui.use(Button, {
  variant: { size: 'icon' },
  props: { label: 'Add' },
  slots: { icon: ui.use(Icon, { props: { d: plus } }) },
}, [])`,
  linkButton: `ui.use(LinkButton, {
  variant: { intent: 'primary' },
  props: { href: ui.link(orders, null) },
}, ['All orders'])`,
  badge: `ui.use(Badge, { props: { tone: order.status, label: 'Paid' } })

// tone: neutral | info | success | warning
//       | danger | accent (a prop: it may come from data)`,
  field: `ui.use(Field, {
  props: {
    for: 'name', label: 'Project name',
    hint: 'Shown on invoices.',
    error: ctx.error, errorId: 'name-error',
  },
  slots: {
    control: ui.use(Input, {
      props: { id: 'name', name: 'name',
        invalid: ctx.error !== null,
        describedby: 'name-error' },
    }),
  },
})`,
  card: `ui.use(Card, {
  props: { title: 'Team', description: '3 people' },
  slots: { actions: ui.use(Button, { variant: { size: 'sm' } }, ['Invite']) },
}, [ui.p({}, ['…'])])`,
  pageHeader: `ui.use(PageHeader, {
  props: { title: 'Orders', description: 'Everything placed this month.' },
  slots: {
    eyebrow: ui.use(Badge, { props: { tone: 'info', label: 'Shop' } }),
    actions: ui.use(Button, { variant: { intent: 'primary' } }, ['New order']),
  },
})`,
  metric: `ui.use(Metric, {
  props: {
    label: 'Revenue',
    value: ui.format.number(q.revenue, { style: 'currency', currency: 'USD' }),
    delta: '+12.4%', trend: 'up', period: 'vs last month',
  },
})`,
  dialog: `ui.use(Button, {
  variant: { intent: 'destructive' },
  props: { commandfor: 'delete', command: 'show-modal' },
}, ['Delete project…'])

ui.use(Dialog, {
  props: { id: 'delete', title: 'Delete this project?' },
  slots: { footer: ui.div({ class: 'flex gap-2' }, [
    ui.use(Button, { props: { commandfor: 'delete', command: 'close' } }, ['Keep it']),
    ui.use(Button, { variant: { intent: 'destructive' }, props: { type: 'submit' } }, ['Delete']),
  ]) },
}, [ui.p({}, ['Its pages and data are removed.'])])`,
  menu: `ui.use(DropdownMenu, { props: { id: 'row-menu', label: 'Actions' } }, [
  ui.use(MenuItem, { on: { press: ui.send(Rename, {}) } }, ['Rename']),
  ui.use(MenuItem, { variant: { intent: 'destructive' },
    props: { commandfor: 'delete', command: 'show-modal' } }, ['Delete…']),
])`,
  states: `ui.query(listOrders, {}, {
  ready: (rows) => …,
  failed: { Unexpected: () => ui.use(Problem, {
    props: { title: 'Orders could not load', body: 'Try again in a moment.' },
  }) },
})

ui.use(EmptyState, {
  props: { title: 'No orders yet', body: 'New orders show up here.' },
  slots: { action: ui.use(LinkButton, { props: { href: ui.link(shop, null) } }, ['Open the shop']) },
})

ui.use(Notice, {
  variant: { placement: 'inline' },   // toast: fixed, bottom right
  props: { message: 'Saved.', tone: 'info' },   // or 'danger'
  on: { dismiss: ui.send(Dismiss, {}) },
})`,
  navbar: `ui.use(NavBar, { props: { label: 'Sections' } }, [
  ui.use(NavLink, { props: { href: ui.link(orders, null),
    current: current(orders), count: 4 } }, ['Orders']),
  ui.use(NavLink, { props: { href: ui.link(customers, null),
    current: current(customers) } }, ['Customers']),
])
// NavBar look: tabs | plain
// NavLink look: tab | pill | list | page`,
  pagination: `ui.use(Pagination, {
  props: {
    summary: '1–10 of 42',
    prevHref: null,
    nextHref: ui.link(orders, null, { page: 2 }),
  },
})`,
  table: `ui.use(Table, {
  slots: { head: ui.use(Tr, {}, [
    ui.use(Th, {}, ['Order']),
    ui.use(Th, { variant: { align: 'end' } }, ['Total']),
  ]) },
}, [
  ui.each(rows, 'id', (r) => ui.use(Tr, {}, [
    ui.use(Td, { variant: { emphasis: 'strong' } }, [r.id]),
    ui.use(Td, { variant: { align: 'end' } }, [r.total]),
  ])),
])`,
  icon: `import { search } from '../../ui/icons/lucide.ts'
import { tenon } from '../../ui/icons/hozu.ts'

ui.use(Icon, { props: { d: search } })
ui.use(Icon, { variant: { size: 'md' }, props: { d: tenon } })`,
}

const iconCell = part((name: string, d: string) =>
  ui.li({ class: 'flex flex-col items-center gap-2 rounded-control border border-line bg-surface p-3 text-xs text-ink-muted' }, [
    ui.use(Icon, { variant: { size: 'md' }, props: { d } }),
    name,
  ]),
)

export const Gallery = ui.view({
  render: () =>
    ui.main({ class: 'mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)] gap-10 px-4 py-12' }, [
      ui.use(PageHeader, {
        variant: { size: 'display' },
        props: {
          title: 'Components',
          description:
            'Every component of the kit, rendered from its current source. Each shows what it is for and the ui.use call that places it.',
        },
      }),
      ui.nav({ 'aria-label': 'Components on this page', class: 'flex flex-wrap gap-2' }, [
        ...toc.map(([id, name]) =>
          ui.a({ href: `#${id}`, class: 'rounded-pill border border-line bg-surface px-3 py-1 text-sm text-ink hover:border-line-strong' }, [name]),
        ),
      ]),

      specimen(
        'button',
        'Button',
        'The one main action of a form or toolbar is primary; others are secondary or quiet.',
        snippets.button,
        ui.div({ class: 'grid gap-4' }, [
          ui.div({ class: 'flex flex-wrap items-center gap-2' }, [
            ui.use(Button, { variant: { intent: 'primary' } }, ['Primary']),
            ui.use(Button, { variant: { intent: 'secondary' } }, ['Secondary']),
            ui.use(Button, { variant: { intent: 'quiet' } }, ['Quiet']),
            ui.use(Button, { variant: { intent: 'destructive' } }, ['Destructive']),
          ]),
          ui.div({ class: 'flex flex-wrap items-center gap-2' }, [
            ui.use(Button, { variant: { intent: 'primary', size: 'sm' } }, ['Small']),
            ui.use(Button, { variant: { intent: 'primary', size: 'md' } }, ['Medium']),
            ui.use(Button, { variant: { size: 'icon' }, props: { label: 'Add' }, slots: { icon: ui.use(Icon, { props: { d: plus } }) } }, []),
            ui.use(Button, { slots: { icon: ui.use(Icon, { props: { d: download } }) } }, ['Export']),
            ui.use(Button, { variant: { intent: 'primary' }, props: { busy: true } }, ['Saving…']),
            ui.use(Button, { props: { disabled: true } }, ['Disabled']),
          ]),
        ]),
      ),

      specimen(
        'link-button',
        'LinkButton',
        'A link that looks like a button.',
        snippets.linkButton,
        ui.div({ class: 'flex flex-wrap gap-2' }, [
          ui.use(LinkButton, { variant: { intent: 'primary' }, props: { href: ui.link(home, null) } }, ['Back to the start']),
          ui.use(LinkButton, { props: { href: 'https://hozu.org' }, slots: { icon: ui.use(Icon, { props: { d: externalLink } }) } }, ['hozu.org']),
        ]),
      ),

      specimen(
        'badge',
        'Badge',
        'A status word. Its tone is a prop, so it can come from data.',
        snippets.badge,
        ui.div({ class: 'flex flex-wrap gap-2' }, [
          ui.use(Badge, { props: { tone: 'neutral', label: 'Draft' } }),
          ui.use(Badge, { props: { tone: 'info', label: 'Shipped' } }),
          ui.use(Badge, { props: { tone: 'success', label: 'Paid' } }),
          ui.use(Badge, { props: { tone: 'warning', label: 'Overdue' } }),
          ui.use(Badge, { props: { tone: 'danger', label: 'Failed' } }),
          ui.use(Badge, { props: { tone: 'accent', label: 'New' } }),
          ui.use(Badge, { variant: { shape: 'square' }, props: { tone: 'success', label: 'Square' } }),
        ]),
      ),

      specimen(
        'field',
        'Field + Input',
        'A labelled control with a hint and an error.',
        snippets.field,
        ui.div({ class: 'grid max-w-sm gap-4' }, [
          ui.use(Field, {
            props: { for: 'demo-name', label: 'Project name', hint: 'Shown on invoices.', errorId: 'demo-name-error' },
            slots: { control: ui.use(Input, { props: { id: 'demo-name', name: 'name', placeholder: 'Acme', describedby: 'demo-name-error' } }) },
          }),
          ui.use(Field, {
            props: { for: 'demo-email', label: 'Email', error: 'Use an address with an @.', errorId: 'demo-email-error' },
            slots: {
              control: ui.use(Input, {
                props: { id: 'demo-email', name: 'email', type: 'email', value: 'ada.example.com', invalid: true, describedby: 'demo-email-error' },
              }),
            },
          }),
        ]),
      ),

      specimen(
        'card',
        'Card',
        'A boxed group with a title.',
        snippets.card,
        ui.use(Card, {
          props: { title: 'Team', description: '3 people' },
          slots: { actions: ui.use(Button, { variant: { size: 'sm' } }, ['Invite']) },
        }, [ui.p({ class: 'text-sm text-ink-muted' }, ['Ada, Grace and Linus can edit every page of this project.'])]),
      ),

      specimen(
        'page-header',
        'PageHeader',
        "The page's title, description and actions.",
        snippets.pageHeader,
        ui.use(PageHeader, {
          props: { title: 'Orders', description: 'Everything placed this month.' },
          slots: {
            eyebrow: ui.use(Badge, { props: { tone: 'info', label: 'Shop' } }),
            actions: ui.use(Button, { variant: { intent: 'primary' } }, ['New order']),
          },
        }),
      ),

      specimen(
        'metric',
        'Metric',
        'A number with a label and a change.',
        snippets.metric,
        ui.div({ class: 'grid gap-3 sm:grid-cols-2' }, [
          ui.use(Metric, { props: { label: 'Revenue', value: '$48,210', delta: '+12.4%', trend: 'up', period: 'vs last month' } }),
          ui.use(Metric, { props: { label: 'Open orders', value: '27', delta: '−3', trend: 'down', period: 'since Monday' } }),
        ]),
      ),

      specimen(
        'dialog',
        'Dialog',
        'A modal question or form. A destructive action asks here first.',
        snippets.dialog,
        ui.div({}, [
          ui.use(Button, { variant: { intent: 'destructive' }, props: { commandfor: 'demo-dialog', command: 'show-modal' } }, ['Delete project…']),
          ui.use(
            Dialog,
            {
              props: { id: 'demo-dialog', title: 'Delete this project?', description: 'This cannot be undone.' },
              slots: {
                footer: ui.div({ class: 'flex gap-2' }, [
                  ui.use(Button, { props: { commandfor: 'demo-dialog', command: 'close' } }, ['Keep it']),
                  ui.use(Button, { variant: { intent: 'destructive' }, props: { commandfor: 'demo-dialog', command: 'close' } }, ['Delete']),
                ]),
              },
            },
            [ui.p({ class: 'text-sm text-ink-muted' }, ['Its pages, data and members are removed. On this page nothing is deleted.'])],
          ),
        ]),
      ),

      specimen(
        'dropdown-menu',
        'DropdownMenu + MenuItem',
        'A list of actions behind a button.',
        snippets.menu,
        ui.div({ class: 'min-h-36' }, [
          ui.use(DropdownMenu, { props: { id: 'demo-menu', label: 'Actions' } }, [
            ui.use(MenuItem, {}, [ui.use(Icon, { props: { d: pencil } }), 'Rename']),
            ui.use(MenuItem, {}, [ui.use(Icon, { props: { d: download } }), 'Download']),
            ui.use(MenuItem, { variant: { intent: 'destructive' }, props: { commandfor: 'demo-dialog', command: 'show-modal' } }, [
              ui.use(Icon, { props: { d: trash } }),
              'Delete…',
            ]),
          ]),
        ]),
      ),

      specimen(
        'states',
        'EmptyState, Problem, Notice',
        'Nothing to show yet; something failed; a message after an action.',
        snippets.states,
        ui.div({ class: 'grid gap-4' }, [
          ui.div({ class: 'rounded-card border border-dashed border-line-strong' }, [
            ui.use(EmptyState, {
              props: { title: 'No orders yet', body: 'New orders show up here as soon as they are placed.' },
              slots: { action: ui.use(LinkButton, { variant: { size: 'sm' }, props: { href: ui.link(home, null) }, slots: { icon: ui.use(Icon, { props: { d: inbox } }) } }, ['Open the shop']) },
            }),
          ]),
          ui.div({ class: 'rounded-card border border-line' }, [
            ui.use(Problem, { props: { title: 'Orders could not load', body: 'The server did not answer. Try again in a moment.' } }),
          ]),
          ui.use(Notice, { variant: { placement: 'inline' }, props: { message: 'Saved. Your changes are live.' } }),
        ]),
      ),

      specimen(
        'navbar',
        'NavBar + NavLink',
        'Section links, the current one marked.',
        snippets.navbar,
        ui.div({ class: 'grid gap-5' }, [
          ui.use(NavBar, { props: { label: 'Demo sections' } }, [
            ui.use(NavLink, { props: { href: '#navbar', current: true, count: 4 } }, ['Orders']),
            ui.use(NavLink, { props: { href: '#navbar' } }, ['Customers']),
            ui.use(NavLink, { props: { href: '#navbar' } }, ['Reports']),
          ]),
          ui.use(NavBar, { variant: { look: 'plain' }, props: { label: 'Demo filters' } }, [
            ui.use(NavLink, { variant: { look: 'pill' }, props: { href: '#navbar', current: true } }, ['All']),
            ui.use(NavLink, { variant: { look: 'pill' }, props: { href: '#navbar' } }, ['Open']),
            ui.use(NavLink, { variant: { look: 'pill' }, props: { href: '#navbar' } }, ['Closed']),
          ]),
        ]),
      ),

      specimen(
        'pagination',
        'Pagination',
        'Previous and next pages as plain links.',
        snippets.pagination,
        ui.use(Pagination, { props: { summary: '1–10 of 42', prevHref: null, nextHref: '#pagination' } }),
      ),

      specimen(
        'table',
        'Table, Tr, Th, Td',
        'Rows and columns.',
        snippets.table,
        ui.div({ class: '-m-5 overflow-hidden rounded-card bg-surface' }, [
          ui.use(Table, {
            slots: {
              head: ui.use(Tr, {}, [
                ui.use(Th, {}, ['Order']),
                ui.use(Th, {}, ['Customer']),
                ui.use(Th, {}, ['Status']),
                ui.use(Th, { variant: { align: 'end' } }, ['Total']),
              ]),
            },
          }, [
            ui.use(Tr, {}, [
              ui.use(Td, { variant: { emphasis: 'strong' } }, ['#1042']),
              ui.use(Td, {}, ['Ada Lovelace']),
              ui.use(Td, {}, [ui.use(Badge, { props: { tone: 'success', label: 'Paid' } })]),
              ui.use(Td, { variant: { align: 'end' } }, ['$1,280.00']),
            ]),
            ui.use(Tr, {}, [
              ui.use(Td, { variant: { emphasis: 'strong' } }, ['#1041']),
              ui.use(Td, {}, ['Grace Hopper']),
              ui.use(Td, {}, [ui.use(Badge, { props: { tone: 'info', label: 'Shipped' } })]),
              ui.use(Td, { variant: { align: 'end' } }, ['$342.50']),
            ]),
            ui.use(Tr, {}, [
              ui.use(Td, { variant: { emphasis: 'strong' } }, ['#1040']),
              ui.use(Td, {}, ['Linus Torvalds']),
              ui.use(Td, {}, [ui.use(Badge, { props: { tone: 'warning', label: 'Overdue' } })]),
              ui.use(Td, { variant: { align: 'end' } }, ['$96.00']),
            ]),
          ]),
        ]),
      ),

      specimen(
        'icon',
        'Icon',
        'An icon: Lucide paths and Hozu’s own, copied as data. No icon library ships.',
        snippets.icon,
        ui.div({ class: 'grid gap-4' }, [
          ui.ul({ class: 'grid grid-cols-3 gap-2 sm:grid-cols-6', 'aria-label': 'Lucide icons' }, [
            iconCell('search', search),
            iconCell('pencil', pencil),
            iconCell('trash', trash),
            iconCell('download', download),
            iconCell('inbox', inbox),
            iconCell('externalLink', externalLink),
          ]),
          ui.ul({ class: 'grid grid-cols-3 gap-2 sm:grid-cols-5', 'aria-label': 'Hozu icons' }, [
            iconCell('tenon', tenon),
            iconCell('machine', machine),
            iconCell('contract', contract),
            iconCell('request', request),
            iconCell('island', island),
          ]),
        ]),
      ),
    ]),
})
