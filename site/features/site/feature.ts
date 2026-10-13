import { feature } from '@hozu/core'
import * as chrome from './chrome.ts'
import * as devtools from './devtools.ts'
import * as gallery from './gallery.ts'
import * as home from './home.ts'
import * as model from './model.ts'

export const site = feature({
  id: 'site',
  intent: {
    summary: 'The Hozu UI website: what the kit is, how to install it, DevTools, and every component live',
  },
  declarations: [model, chrome, devtools, home, gallery],
  styles: [new URL('./site.css', import.meta.url)],
})
