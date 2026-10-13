import { feature } from '@hozu/core'
import * as model from './model.ts'
import * as views from './views.ts'

export const site = feature({
  id: 'site',
  intent: { summary: 'The Hozu UI website: what the kit is, how to install it, and every component live' },
  declarations: [model, views],
})
