import { type Href, part, type RouteDecl, ui } from '@hozu/core'
import { components, devtools, home } from '../../routes.ts'
import { kitVersion } from './kit-version.ts'

export const repo = 'https://github.com/olevatorr/hozu-ui'
export const npm = 'https://www.npmjs.com/package/@hozu/ui-kit'

export const tag = part((text: string, tone: string) =>
  ui.span(
    {
      class: `inline-block px-1.5 py-0.5 font-code text-xs leading-none font-bold ${tone === 'red' ? 'bg-signal text-coal' : 'bg-coal text-paper'}`,
    },
    [text],
  ),
)

export const posterButton = part((href: Href | string, label: string, solid: boolean) =>
  ui.a(
    {
      href,
      class: `inline-block border-4 border-coal px-4 py-2.5 text-sm font-extrabold tracking-wide uppercase transition-colors duration-150 ${solid ? 'bg-coal text-paper hover:bg-paper hover:text-coal' : 'text-coal hover:bg-coal hover:text-paper'}`,
    },
    [label],
  ),
)

const links = part((current: (route: RouteDecl<any, any>) => boolean) => [
  ui.a(
    {
      href: ui.link(components, null),
      'aria-current': current(components),
      class: 'aria-[current]:text-ember',
    },
    ['Components'],
  ),
  ui.a(
    {
      href: ui.link(devtools, null),
      'aria-current': current(devtools),
      class: 'aria-[current]:text-ember',
    },
    ['DevTools'],
  ),
  ui.a({ href: 'https://hozu.org' }, ['hozu.org']),
  ui.a({ href: repo }, ['GitHub']),
  ui.a({ href: npm }, ['npm']),
])

export const Top = ui.view({
  render: ({ current }) =>
    ui.header(
      {
        class: 'sticky top-0 z-30 border-b-4 border-coal bg-paper font-poster text-coal',
        'data-chrome': '',
      },
      [
        ui.a(
          {
            href: '#main',
            class: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-coal focus:px-3 focus:py-2 focus:text-paper',
          },
          ['Skip to content'],
        ),
        ui.div(
          {
            class: 'mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4',
          },
          [
            ui.a(
              {
                href: ui.link(home, null),
                'aria-label': 'Hozu UI, home',
                class: 'flex items-center gap-2 font-black',
              },
              [
                ui.img({
                  src: ui.asset(new URL('../../assets/logo.png', import.meta.url)),
                  width: 28,
                  height: 32,
                  alt: '',
                }),
                'HOZU',
                tag('UI', 'ink'),
                tag(kitVersion, 'red'),
              ],
            ),
            ui.nav(
              {
                'aria-label': 'Main navigation',
                class: 'hidden gap-6 text-xs font-extrabold tracking-widest whitespace-nowrap uppercase lg:flex',
              },
              links(current),
            ),
            ui.details(
              {
                class: 'group lg:hidden [&:not([open])>div]:hidden [&::details-content]:[content-visibility:visible]',
              },
              [
                ui.summary(
                  {
                    class:
                      'flex list-none items-center gap-2 border-4 border-coal px-3 py-1.5 text-xs font-black tracking-widest uppercase select-none group-open:bg-coal group-open:text-paper [&::-webkit-details-marker]:hidden',
                  },
                  [ui.span({ class: 'group-open:hidden' }, ['Menu']), ui.span({ class: 'hidden group-open:inline' }, ['Close'])],
                ),
                ui.div(
                  {
                    class: 'absolute inset-x-0 top-full origin-top border-y-4 border-coal bg-paper px-5 pb-4 motion-safe:group-open:animate-menu',
                  },
                  [
                    ui.nav(
                      {
                        'aria-label': 'Mobile navigation',
                        class:
                          "grid [&>a]:flex [&>a]:items-center [&>a]:justify-between [&>a]:border-b-2 [&>a]:border-coal [&>a]:py-3 [&>a]:text-2xl [&>a]:font-black [&>a]:tracking-tight [&>a]:uppercase [&>a]:after:text-signal [&>a]:after:content-['→'] [&>a:last-child]:border-b-0 [&>a:hover]:text-signal",
                      },
                      links(current),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ],
    ),
})

export const Footer = ui.view({
  render: () =>
    ui.footer(
      {
        class: 'bg-coal py-12 font-poster text-sm text-paper',
        'data-chrome': '',
      },
      [
        ui.div(
          {
            class: 'mx-auto grid max-w-6xl gap-6 px-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end',
          },
          [
            ui.div({ class: 'grid gap-3' }, [
              ui.p(
                {
                  class: 'text-3xl leading-none font-black tracking-tight uppercase md:text-5xl',
                },
                ['Your app. ', ui.span({ class: 'text-signal' }, ['Your components.'])],
              ),
              ui.p({ class: 'max-w-xl text-paper/80' }, [
                'Hozu UI is MIT licensed. Icons from Lucide (ISC) and drawn for Hozu. This site is a Hozu app built from the kit’s current source.',
              ]),
            ]),
            ui.nav(
              {
                'aria-label': 'Footer',
                class: 'flex flex-wrap gap-x-6 gap-y-2 font-code text-xs font-bold tracking-widest uppercase',
              },
              [
                ui.a(
                  {
                    href: ui.link(components, null),
                    class: 'hover:text-signal',
                  },
                  ['Components'],
                ),
                ui.a({ href: ui.link(devtools, null), class: 'hover:text-signal' }, ['DevTools']),
                ui.a({ href: 'https://hozu.org', class: 'hover:text-signal' }, ['hozu.org']),
                ui.a({ href: repo, class: 'hover:text-signal' }, ['GitHub']),
                ui.a({ href: npm, class: 'hover:text-signal' }, ['npm']),
              ],
            ),
          ],
        ),
      ],
    ),
})
