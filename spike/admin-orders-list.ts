import { fn, ui } from '@hozu/core'
import { z } from 'zod'
import { BadgeTone } from '../../kit/badge.ts'
import { Badge } from '../../kit/badge.ts'
import { Button, LinkButton } from '../../kit/button.ts'
import { Card } from '../../kit/card.ts'
import { Icon } from '../../kit/icon.ts'
import { Input } from '../../kit/input.ts'
import { NavBar, NavLink, Pagination } from '../../kit/nav.ts'
import { PageHeader } from '../../kit/page-header.ts'
import { EmptyState, Notice, Problem } from '../../kit/states.ts'
import { Table, Td, Th, Tr } from '../../kit/table.ts'
import { orderDetail, orders } from '../../routes.ts'
import { icons } from '../../ui/icons.ts'
import { OrderStatus } from '../shared.ts'
import { Dismiss, exportOrders, listOrders, ordersMachine, ProcessSelected, SelectOrder, SelectPage } from './model.ts'

const usd = { style: 'currency', currency: 'USD' } as const
const bulk = ui.formRef()

export const statusTone = fn({
  input: OrderStatus,
  output: BadgeTone,
  impl: (s) => (s === 'delivered' ? 'success' : s === 'pending' ? 'warning' : s === 'refunded' ? 'danger' : s === 'cancelled' ? 'neutral' : s === 'processing' ? 'accent' : 'info'),
})

export const OrdersList = ui.view({
  machine: ordersMachine,
  route: orders,
  render: ({ ctx, search, is }) =>
    ui.main({ class: 'mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-8 lg:py-8', 'data-theme': 'grain', 'data-mode': 'light' }, [
      ui.use(PageHeader, {
        props: { title: 'Orders', description: 'Every order from the storefront and the shop floor, newest first.' },
        slots: {
          actions: ui.use(LinkButton, { props: { href: ui.link(exportOrders, { status: search.status, q: search.q }) }, slots: { icon: ui.use(Icon, { props: { d: icons.external } }) } }, ['Export CSV']),
        },
      }),
      ui.query(listOrders, { q: search.q, status: search.status, page: search.page }, {
        ready: (p) =>
          ui.use(Card, { variant: { pad: 'none' } }, [
            ui.div({ class: 'px-5 pt-2' }, [
              ui.use(NavBar, { props: { label: 'Filter by status' } }, [
                ui.each(p.tabs, 'key', (t) =>
                  ui.use(NavLink, { props: { href: ui.link(orders, null, { q: search.q, status: t.key }), current: search.status === t.key, count: t.count } }, [t.label]),
                ),
              ]),
            ]),
            ui.div({ class: 'flex flex-col gap-3 border-b border-line px-5 py-3 sm:flex-row sm:items-center sm:justify-between' }, [
              ui.form({ method: 'get', class: 'flex flex-1 items-center gap-2', role: 'search' }, [
                ui.input({ type: 'hidden', name: 'status', value: search.status }),
                ui.div({ class: 'relative flex-1 sm:max-w-xs' }, [
                  ui.use(Input, { props: { name: 'q', type: 'search', value: search.q, placeholder: 'Order number, name, email or tracking', label: 'Search orders' } }),
                ]),
                ui.use(Button, { props: { type: 'submit' } }, ['Search']),
                search.q !== '' && ui.a({ href: ui.link(orders, null, { status: search.status }), class: 'text-xs text-ink-muted hover:underline' }, ['Clear']),
              ]),
              ui.form({ ref: bulk, class: 'flex items-center gap-3', on: { submit: ui.send(ProcessSelected, { ids: ui.dom.formAll('ids') }) } }, [
                ui.span({ class: 'text-xs text-ink-muted tabular-nums' }, [`${ctx.selected.length} selected`]),
                ui.use(Button, { variant: { size: 'sm' }, props: { type: 'submit', busy: is(['processing']) }, slots: { icon: ui.use(Icon, { props: { d: icons.inventory } }) } }, ['Mark as processing']),
              ]),
            ]),
            p.rows.length === 0
              ? ui.use(EmptyState, {
                  props: {
                    title: search.q === '' ? 'No orders here yet' : 'No orders match your search',
                    body: search.q === '' ? 'Orders placed on the storefront appear here as soon as they are paid.' : 'Try a customer name, an email address or an order number such as 1042.',
                  },
                })
              : ui.use(Table, {
                  slots: {
                    head: ui.tr({}, [
                      ui.use(Th, {}, [
                        ui.input({
                          type: 'checkbox',
                          class: 'size-4 accent-accent',
                          'aria-label': 'Select every order on this page',
                          checked: ctx.selected.length > 0 && ctx.selected.length === p.ids.length,
                          on: { change: ui.send(SelectPage, { ids: p.ids, checked: ui.dom.checked }) },
                        }),
                      ]),
                      ui.use(Th, {}, ['Order']),
                      ui.use(Th, {}, ['Date']),
                      ui.use(Th, {}, ['Customer']),
                      ui.use(Th, {}, ['Channel']),
                      ui.use(Th, {}, ['Status']),
                      ui.use(Th, { variant: { align: 'end' } }, ['Items']),
                      ui.use(Th, { variant: { align: 'end' } }, ['Total']),
                    ]),
                  },
                }, [
                  ui.each(p.rows, 'id', (o) =>
                    ui.use(Tr, {}, [
                      ui.use(Td, {}, [
                        ui.input({
                          type: 'checkbox',
                          form: bulk,
                          name: 'ids',
                          value: `${o.id}`,
                          class: 'size-4 accent-accent',
                          'aria-label': `Select order ${o.id}`,
                          checked: ctx.selected.includes(`${o.id}`),
                          disabled: is(['processing']),
                          on: { change: ui.send(SelectOrder, { id: `${o.id}`, checked: ui.dom.checked }) },
                        }),
                      ]),
                      ui.use(Td, { variant: { emphasis: 'strong' } }, [ui.a({ href: ui.link(orderDetail, { id: o.id }), class: 'hover:underline' }, [`#${o.id}`])]),
                      ui.use(Td, { variant: { emphasis: 'muted' }, class: 'whitespace-nowrap' }, [ui.format.date(o.createdAt, { dateStyle: 'medium', timeStyle: 'short' })]),
                      ui.use(Td, {}, [ui.p({ class: 'font-medium' }, [o.customer]), ui.p({ class: 'text-xs text-ink-muted' }, [o.email])]),
                      ui.use(Td, { variant: { emphasis: 'muted' }, class: 'whitespace-nowrap' }, [o.channel]),
                      ui.use(Td, {}, [ui.use(Badge, { props: { tone: statusTone(o.status), label: o.label } })]),
                      ui.use(Td, { variant: { align: 'end', emphasis: 'muted' } }, [o.items]),
                      ui.use(Td, { variant: { align: 'end', emphasis: 'strong' } }, [ui.format.number(o.total, usd)]),
                    ]),
                  ),
                ]),
            ui.use(Pagination, {
              class: 'border-t border-line px-5 py-3',
              props: {
                summary: p.summary,
                prevHref: p.page > 1 ? ui.link(orders, null, { ...search, page: p.page - 1 }) : null,
                nextHref: p.page < p.pages ? ui.link(orders, null, { ...search, page: p.page + 1 }) : null,
              },
            }),
          ]),
        failed: {
          Forbidden: () => ui.use(Problem, { props: { title: 'Sign in to see orders.' } }),
          Unexpected: () => ui.use(Problem, { props: { title: 'Orders are unavailable right now.' } }),
        },
      }),
      ctx.notice !== null && ui.use(Notice, { props: { message: ctx.notice }, on: { dismiss: ui.send(Dismiss, {}) } }),
      ctx.error !== null && ui.use(Notice, { props: { message: ctx.error, tone: 'danger' }, on: { dismiss: ui.send(Dismiss, {}) } }),
    ]),
})
