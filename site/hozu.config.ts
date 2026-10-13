import { project, ui } from '@hozu/core'
import { zodAdapter } from '@hozu/schema-zod'
import { site } from './features/site/feature.ts'
import { Footer, Top } from './features/site/chrome.ts'
import { DevToolsPage } from './features/site/devtools.ts'
import { Gallery } from './features/site/gallery.ts'
import { Home } from './features/site/home.ts'
import { components, devtools, home } from './routes.ts'
import { kit } from './ui/kit.ts'

const share = ui.asset(new URL('./assets/og.png', import.meta.url))

export default project({
  schema: zodAdapter,
  styles: new URL('./app.css', import.meta.url),
  app: new URL('./app.ts', import.meta.url),
  env: { files: ['.env', '.env.local'] },
  site: {
    url: 'https://ui.hozu.org',
    name: 'Hozu UI',
    lang: 'en',
    icon: ui.asset(new URL('./assets/icon-256.png', import.meta.url)),
    themeColor: '#f1ede4',
  },
  routes: { home, components, devtools },
  pages: [
    ui.page(home, {
      views: [Top, Home, Footer],
      head: {
        render: () => ({
          title: 'Hozu UI: official components for Hozu apps',
          description:
            'The official component kit for Hozu apps. The components are copied into your app, so you and your AI can change them.',
          image: share,
        }),
      },
    }),
    ui.page(components, {
      views: [Top, Gallery, Footer],
      head: {
        render: () => ({
          title: 'Components · Hozu UI',
          description: 'Every Hozu UI component, live in its own theme, with its variants, props and the line that installs it.',
          image: share,
        }),
      },
    }),
    ui.page(devtools, {
      views: [Top, DevToolsPage, Footer],
      head: {
        render: () => ({
          title: 'Hozu UI with DevTools',
          description:
            'Place a Hozu UI component on your running page with Hozu DevTools, say what it is for, and hand the request to your AI.',
          image: share,
        }),
      },
    }),
  ],
  kits: [kit],
  features: [site],
})
