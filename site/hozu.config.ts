import { project, ui } from '@hozu/core'
import { zodAdapter } from '@hozu/schema-zod'
import { site } from './features/site/feature.ts'
import { Footer, Gallery, Home, Top } from './features/site/views.ts'
import { components, home } from './routes.ts'
import { kit } from './ui/kit.ts'

export default project({
  schema: zodAdapter,
  styles: new URL('./app.css', import.meta.url),
  app: new URL('./app.ts', import.meta.url),
  env: { files: ['.env', '.env.local'] },
  site: { url: 'https://ui.hozu.org', name: 'Hozu UI', lang: 'en' },
  routes: { home, components },
  pages: [
    ui.page(home, {
      views: [Top, Home, Footer],
      head: {
        render: () => ({
          title: 'Hozu UI: official components for Hozu apps',
          description:
            'The official component kit for Hozu apps. The components are copied into your app, so you and your AI can change them.',
        }),
      },
    }),
    ui.page(components, {
      views: [Top, Gallery, Footer],
      head: {
        render: () => ({
          title: 'Components · Hozu UI',
          description: 'Every Hozu UI component, live, with its variants and the ui.use call that places it.',
        }),
      },
    }),
  ],
  kits: [kit],
  features: [site],
})
