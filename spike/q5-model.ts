import { event, machine, on } from '@hozu/core'
import { z } from 'zod'

export const Edit = event({ payload: z.object({}) })
export const Cancel = event({ payload: z.object({}) })
export const Save = event({ payload: z.object({ name: z.string() }) })

export const dialogMachine = machine({
  context: z.object({ name: z.string() }),
  initialContext: { name: 'Ada' },
  initial: 'idle',
  states: ({ ctx }) => ({
    idle: { on: [on(Edit, { target: 'editing' })], ignore: [Cancel, Save] },
    editing: { ignore: [Edit], on: [on(Cancel, { target: 'idle' }), on(Save, { target: 'idle', assign: (e) => { ctx.name = e.name } })] },
  }),
})
