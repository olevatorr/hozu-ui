# Decisions

## 2026-10-09: the proposal's eight questions

The owner accepted the proposal's direction ([proposal.md](proposal.md) §8): 「UI 的問題都照你建議」.

| # | Question | Decision |
|---|---|---|
| 1 | `spec` next to `variant` | They coexist at first. Merge them only if the spike shows overlap; principle 1 (one canonical form) is the test. |
| 2 | Contrast strictness | Errors inside the kit's own components, warnings in apps. WCAG 2 AA is the threshold; APCA is shown for reference. |
| 3 | Trend colours | No global red-up / green-down default. The kit offers the semantic tokens `up` / `down` only, and each app chooses their colours. |
| 4 | Themes in the first version | Two: A "Grain" (default; first named "Ledger", renamed below) and B "Joinery", to prove that theming is one attribute. |
| 5 | Machine-bound dialog passing `open` through a component | Verify in the spike, then decide. |
| 6 | Fonts | System fonts only. |
| 7 | Where the official source lives | In the separate hozu-ui repository for now; it moves into the framework once it settles. |
| 8 | Agent guidance | The kit's own `hozu docs ui` topic. |

Spike 1 ([spike-1.md](spike-1.md)) answered 5 with evidence: one `Dialog` with an optional `open` serves both the native
and the machine-bound form. Recommendation: yes (for the owner to confirm).

## Licensing (2026-10-09, from the owner's question "could this UI infringe?")
1. Component code and class lists are written here, in Hozu's form. Nothing is copied from paid sources (Tailwind Plus
   / Catalyst, paid Tremor blocks, commercial templates). Open-source ideas may be borrowed; a class recipe close to an
   MIT source keeps its provenance in [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) (today: shadcn/ui for
   `Button`, `Input`, `Badge`).
2. The repository is MIT (`LICENSE`, Copyright (c) 2026 olevatorr). Icons: none shipped; a future set is Lucide (ISC)
   or Heroicons (MIT), with its licence in the notices.
3. Theme A is renamed **Grain** (it was "Ledger", a well-known company and trademark). "Joinery" stays. Grain belongs
   to Hozu's joinery vocabulary: the quiet, planed surface of the wood.
4. No theme imitates one product's distinctive look. Grain is a neutral data theme with its own accent and scale;
   Joinery derives from Hozu's own site (`site/DESIGN.md`).
