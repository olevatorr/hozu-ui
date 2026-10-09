import { ui } from '@hozu/core'
import { LinkButton } from '../../kit/button.ts'
import { NavBar, NavLink } from '../../kit/nav.ts'
import { PageHeader } from '../../kit/page-header.ts'
import { EmptyState, Problem } from '../../kit/states.ts'
import { shop } from '../../routes.ts'
import { listCategories, listProducts, shopHeading } from './model.ts'
import { productTile } from './views.ts'

const sorts = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
  { value: 'rating', label: 'Top rated' },
] as const

const bands = [
  { value: 'any', label: 'Any price' },
  { value: 'under-50', label: 'Under $50' },
  { value: '50-100', label: '$50 – $100' },
  { value: '100-200', label: '$100 – $200' },
  { value: 'over-200', label: '$200 and up' },
] as const

const groupTitle = 'mb-2 text-xs font-semibold tracking-[0.18em] text-ink-muted uppercase'

export const Catalogue = ui.view({
  route: shop,
  render: ({ params, search }) =>
    ui.main({ class: 'mx-auto grid max-w-7xl gap-6 px-4 pt-8 pb-24 sm:px-6 lg:px-8', 'data-theme': 'joinery', 'data-mode': 'light' }, [
      ui.query(shopHeading, { category: params.category }, {
        ready: (h) =>
          ui.use(PageHeader, {
            variant: { size: 'display' },
            class: 'border-b border-line pb-8',
            props: { title: h.title, description: h.description },
            slots: {
              eyebrow: ui.nav({ 'aria-label': 'Breadcrumb', class: 'text-sm text-ink-muted' }, [
                ui.a({ href: ui.link(shop, { category: null }), class: 'hover:text-ink' }, ['Shop']),
                params.category !== null && ' / ',
                params.category !== null && ui.span({ 'aria-current': 'page' }, [h.title]),
              ]),
            },
          }),
        failed: {
          NotFound: () => ui.use(PageHeader, { variant: { size: 'display' }, props: { title: 'Category not found' } }),
          Unexpected: () => ui.use(PageHeader, { variant: { size: 'display' }, props: { title: 'Shop' } }),
        },
      }),
      ui.query(listCategories, {}, {
        ready: (cats) =>
          ui.use(NavBar, { variant: { look: 'plain' }, props: { label: 'Categories' } }, [
            ui.use(NavLink, { variant: { look: 'pill' }, props: { href: ui.link(shop, { category: null }), current: params.category === null } }, ['All']),
            ui.each(cats, 'slug', (c) =>
              ui.use(NavLink, { variant: { look: 'pill' }, props: { href: ui.link(shop, { category: c.slug }), current: params.category === c.slug } }, [c.name]),
            ),
          ]),
        failed: { Unexpected: () => null },
      }),
      ui.query(
        listProducts,
        { category: params.category, sort: search.sort, price: search.price, color: search.color, availability: search.availability, q: '', page: search.page },
        {
          ready: (page) =>
            ui.div({ class: 'grid gap-10 lg:grid-cols-[220px_1fr]' }, [
              ui.aside({ class: 'grid content-start gap-8', 'aria-label': 'Filters' }, [
                ui.section({ 'aria-labelledby': 'sort-h' }, [
                  ui.h2({ id: 'sort-h', class: groupTitle }, ['Sort by']),
                  ...sorts.map((s) =>
                    ui.use(NavLink, { variant: { look: 'list' }, props: { href: ui.link(shop, { category: params.category }, { ...search, sort: s.value, page: 1 }), current: search.sort === s.value } }, [s.label]),
                  ),
                ]),
                ui.section({ 'aria-labelledby': 'price-h' }, [
                  ui.h2({ id: 'price-h', class: groupTitle }, ['Price']),
                  ...bands.map((b) =>
                    ui.use(NavLink, { variant: { look: 'list' }, props: { href: ui.link(shop, { category: params.category }, { ...search, price: b.value, page: 1 }), current: search.price === b.value } }, [b.label]),
                  ),
                ]),
                page.colors.length > 0 &&
                  ui.section({ 'aria-labelledby': 'colour-h' }, [
                    ui.h2({ id: 'colour-h', class: groupTitle }, ['Colour']),
                    ui.use(NavLink, { variant: { look: 'list' }, props: { href: ui.link(shop, { category: params.category }, { ...search, color: null, page: 1 }), current: search.color === null } }, ['Any colour']),
                    ui.each(page.colors, null, (c) =>
                      ui.use(NavLink, { variant: { look: 'list' }, props: { href: ui.link(shop, { category: params.category }, { ...search, color: c, page: 1 }), current: search.color === c } }, [c]),
                    ),
                  ]),
                ui.section({ 'aria-labelledby': 'stock-h' }, [
                  ui.h2({ id: 'stock-h', class: groupTitle }, ['Availability']),
                  ui.use(NavLink, { variant: { look: 'list' }, props: { href: ui.link(shop, { category: params.category }, { ...search, availability: 'all', page: 1 }), current: search.availability === 'all' } }, ['Show all']),
                  ui.use(NavLink, { variant: { look: 'list' }, props: { href: ui.link(shop, { category: params.category }, { ...search, availability: 'in-stock', page: 1 }), current: search.availability === 'in-stock' } }, ['In stock only']),
                ]),
              ]),
              ui.section({ 'aria-label': 'Products' }, [
                ui.div({ class: 'mb-6 flex items-center justify-between text-sm text-ink-muted' }, [
                  ui.p({ 'aria-live': 'polite' }, [ui.format.plural(page.total, { one: '# product', other: '# products' })]),
                  (search.price !== 'any' || search.color !== null || search.availability !== 'all') &&
                    ui.a({ href: ui.link(shop, { category: params.category }, { sort: search.sort }), class: 'underline underline-offset-4 hover:text-ink' }, ['Clear filters']),
                ]),
                page.items.length === 0
                  ? ui.use(EmptyState, {
                      variant: { size: 'page' },
                      props: { title: 'Nothing matches those filters', body: 'Try a different price or colour.' },
                      slots: { action: ui.use(LinkButton, { props: { href: ui.link(shop, { category: params.category }) } }, ['Clear filters']) },
                    })
                  : ui.div({ class: 'grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3' }, [ui.each(page.items, 'slug', (p) => productTile(p))]),
                page.pages.length > 1 &&
                  ui.use(NavBar, { variant: { look: 'plain' }, props: { label: 'Pages' }, class: 'mt-16 justify-center' }, [
                    ui.each(page.pages, null, (n) =>
                      ui.use(NavLink, { variant: { look: 'page' }, props: { href: ui.link(shop, { category: params.category }, { ...search, page: n }), current: page.page === n } }, [`${n}`]),
                    ),
                  ]),
              ]),
            ]),
          failed: { Unexpected: () => ui.use(Problem, { props: { title: 'Products are unavailable right now.' } }) },
        },
      ),
    ]),
})
