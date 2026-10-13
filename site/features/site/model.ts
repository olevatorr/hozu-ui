import { event, machine, on } from '@hozu/core'
import { z } from 'zod'

export const Theme = z.enum(['grain', 'joinery'])

export const Copy = event({ payload: z.object({ text: z.string() }) })

export const site = machine({
  context: z.object({ theme: Theme, copied: z.string() }),
  initialContext: { theme: 'grain', copied: '' },
  initial: 'idle',
  on: ({ ctx }) => [on(Copy, { target: 'copied', assign: (e) => { ctx.copied = e.text }, copy: (e) => e.text })],
  states: ({ ctx }) => ({
    idle: {},
    copied: { after: [{ ms: 2000, target: 'idle', assign: () => { ctx.copied = '' } }] },
  }),
})
