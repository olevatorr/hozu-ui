import { ui } from '@hozu/core'
import { Badge } from '../../kit/badge.ts'
import { Button } from '../../kit/button.ts'
import { Dialog } from '../../kit/dialog.ts'
import { Field } from '../../kit/field.ts'
import { Input } from '../../kit/input.ts'
import { Metric } from '../../kit/metric.ts'
import { DropdownMenu, MenuItem } from '../../kit/menu.ts'
import { Cancel, dialogMachine, Edit, Save } from './model.ts'

export const Home = ui.view({
  machine: dialogMachine,
  render: ({ ctx, is }) =>
    ui.main({ class: 'mx-auto grid max-w-xl gap-4 bg-canvas px-4 py-12 text-ink', 'data-mode': 'light' }, [
      ui.use(Metric, { props: { label: '本月營收', value: 'NT$128,000', delta: '+4.2%', trend: 'up', period: '較上月' } }),
      ui.p({ class: 'flex gap-2' }, [ui.use(Badge, { props: { tone: 'success', label: 'Paid' } }), ui.use(Badge, { props: { tone: 'warning', label: 'Pending' } })]),
      ui.div({ class: 'flex justify-between' }, [ui.use(DropdownMenu, { props: { id: 'm1', label: 'Actions' } }, [ui.use(MenuItem, {}, ['Duplicate']), ui.use(MenuItem, { variant: { intent: 'destructive' } }, ['Delete'])]), ui.use(DropdownMenu, { props: { id: 'm2', label: 'Edge menu' } }, [ui.use(MenuItem, {}, ['Near the right edge'])])]),
      ui.use(Button, { props: { commandfor: 'native', command: 'show-modal' } }, ['Open native']),
      ui.use(Dialog, { props: { id: 'native', title: 'Native dialog' }, slots: { footer: ui.use(Button, { props: { commandfor: 'native', command: 'close' } }, ['Close native']) } }, [ui.p({}, ['Opened by commandfor, no machine.'])]),
      ui.p({ id: 'name' }, [`Name: ${ctx.name}`]),
      ui.use(Button, { variant: { intent: 'primary' }, on: { press: ui.send(Edit, {}) } }, ['Edit name']),
      ui.use(Dialog, { props: { id: 'edit', title: 'Edit name', open: is(['editing']) }, on: { close: ui.send(Cancel, {}) },
        slots: { footer: ui.use(Button, { variant: { intent: 'quiet' }, on: { press: ui.send(Cancel, {}) } }, ['Cancel']) } }, [
        ui.form({ id: 'f', on: { submit: ui.send(Save, { name: ui.dom.form('name') }) } }, [
          ui.use(Field, { props: { for: 'n', label: 'Name', errorId: 'n-err' }, slots: { control: ui.use(Input, { props: { id: 'n', name: 'name', value: ctx.name } }) } }),
          ui.use(Button, { variant: { intent: 'primary' }, props: { type: 'submit' }, keys: ['Mod+Enter'] }, ['Save']),
        ]),
      ]),
    ]),
})
