import { query, ui } from '@hozu/core'
import { z } from 'zod'
import { Notice } from '../../kit/states.ts'
import { list } from '../../routes.ts'

export const items = query({ input: z.object({}), output: z.array(z.string()), scope: 'public', freshness: { revalidate: 300 }, runs: 'server' })

export const List = ui.view({
  route: list,
  render: ({ search }) =>
    ui.main({ class: 'grid gap-4 p-8' }, [
      search.notice !== null && ui.use(Notice, { variant: { placement: 'inline' }, props: { message: search.notice === 'saved' ? 'Saved' : 'Deleted' } }),
      ui.query(items, {}, { ready: (xs) => ui.ul({}, [ui.each(xs, null, (x) => ui.li({}, [x]))]), failed: { Unexpected: () => null } }),
      ui.a({ href: ui.link(list, null) }, ['Dismiss']),
    ]),
})
