import { writeFileSync } from 'node:fs'

writeFileSync(new URL('../dist/CNAME', import.meta.url), 'ui.hozu.org\n')
