# CatClean — i18n plan

## Overview

Two independent i18n stacks:

| Stack | Locales | Storage key | Scope |
|-------|---------|-------------|--------|
| **CRM** | `en` (default), `ru` | `catclean_locale` | `/app/*` admin, cleaner, client |
| **Public** | `de` (default), `en` | `catclean_public_locale` | Marketing site, booking wizards, confirm |

No locale URL prefixes (`/de`, `/en`) — language is client state + `localStorage`.

---

## CRM (`src/i18n/`)

See original CRM plan below. Unchanged by public work.

### Strategy (CRM)

- **Locales:** `en` (default), `ru`
- **Runtime:** `I18nProvider` in `src/app/app/layout.tsx`
- **Keys:** `src/i18n/dictionaries/en.ts`, `ru.ts`
- **Hook:** `useT()` from `src/i18n/useT.ts`

### CRM — translate later (priority)

1. Clients/cleaners/reviews/complaints pages
2. Order service-specific copy in configs
3. Cleaner/client portals
4. Login (staff + phone)
5. Dashboard KPIs

### CRM — do not translate (for now)

- API error messages from routes
- DB content, docs, migrations
- `ORDER_SERVICE_TYPES` catalog until product copy is final

---

## Public website (`src/i18n/public/`)

### Strategy

- **Default:** German (`de`) — launch market
- **Secondary:** English (`en`)
- **Provider:** `PublicI18nProvider` in `src/app/(public)/layout.tsx`
- **Hook:** `usePublicT()` — falls back to `de` outside provider (e.g. `/login` header)
- **Dictionaries:** modular files merged into `de.ts` / `en.ts`

### Public dictionary modules

| File | Contents |
|------|----------|
| `dictionaries/de.ts`, `en.ts` | Nav, home, compare shell, move out, home care core |
| `dictionaries/public-shared-de.ts` | `public.wizard.field.*`, `public.validation.*`, `public.schedule.*` |
| `dictionaries/home-reset-public-de.ts` | Full Home Reset wizard (~200 keys) |
| `dictionaries/home-care-scope-de.ts` | Home Care confirm included/not included |
| `dictionaries/compare-de.ts` | What We Clean profiles + table |
| `dictionaries/booking-legacy-de.ts` | Default `/booking` calculator shell |

English mirrors: `*-en.ts` with `Record<keyof typeof deModule, string>`.

### Helpers

| Path | Role |
|------|------|
| `schedule-i18n.ts` | Weekdays, time slot labels |
| `features/home-reset-wizard/home-reset-wizard.i18n.ts` | Home Reset dynamic copy builders |
| `features/home-care-wizard/home-care-scope.i18n.ts` | Home Care scope sections |
| `features/service-comparison/service-comparison.i18n.ts` | Localized service profiles |
| `features/move-out-wizard/move-out-wizard.i18n.ts` | Move Out packages + compare rows |

---

## Phase 1 — completed

- Public infra: `de` default, `en` secondary, language switcher
- Home, header/nav, What We Clean (full), Move Out wizard, Home Care major flow, confirm order
- Trust strip, shared schedule/address/contact **headers**

## Phase 2 — completed

- **Home Reset wizard** — all steps, sidebar, success, validation, progress
- **Shared** `public.wizard.field.*`, `public.validation.*`, `public.schedule.*`
- **Home Care** — StepConfirm included/not included, footer line; validation uses shared keys
- **Schedule** — weekdays + time slots in Home Care / Home Reset (shared `StepSchedule`)
- **Address / Contact** — field labels + placeholders (Home Reset; Home Care reuses same step components)
- **Legacy `/booking`** — page title/subtitle, validation, submit CTA (wizard steps mostly English — see backlog)
- **Move Out wizard** — full 8-step booking flow + success (module `move-out-booking-de/en.ts`)

---

## Phase 3 — backlog (public English-only)

| Area | Notes |
|------|--------|
| Legacy `BookingWizard` step UIs | `StepService`, `StepRooms`, `StepSummary`, etc. |
| Upholstery / window pages | `/booking/upholstery` and `/booking/window-cleaning` only redirect to `?service=` — no hero copy (Phase 3) |
| `CleaningAreaCard` CTA chips | Minor compare page strings |
| Order status on confirm page | Raw API status value |
| API error strings on submit | Server messages |

**TODO (legacy booking):** Prefer `?service=home_reset|home_care|move_out`. Default calculator kept for deep links; see `public.bookingLegacy.todoNote`.

---

## How to add public translation keys

1. Add German string to the appropriate module (`public-shared-de.ts`, `home-reset-public-de.ts`, or root `de.ts`).
2. Add the **same key** to the matching English module (`public-shared-en.ts`, etc.).
3. In a **client** component: `const { t } = usePublicT()` then `t("public.your.key")`.
4. For long lists (scope items), prefer numbered keys (`item1`…`item5`) and a small `*.i18n.ts` builder.
5. Run `npm run build` — `en.ts` must satisfy `Record<keyof typeof de, string>`.

### Key prefixes (public)

- `public.nav.*`, `public.home.*`, `public.compare.*`
- `public.moveOut.*`, `public.homeCare.*`, `public.homeReset.*`
- `public.wizard.*`, `public.validation.*`, `public.schedule.*`
- `public.confirm.*`, `public.bookingLegacy.*`

---

## CRM — adding keys (unchanged)

1. Add key to `src/i18n/dictionaries/en.ts`
2. Add same key to `ru.ts` (`satisfies Dictionary`)
3. Use `useT()` in client components under `/app`
4. Prefer `orderStatusLabel()` / `paymentLabel()` helpers where applicable

### CRM conventions

- Prefixes: `common.`, `nav.`, `orders.`, `finance.`, `status.`, `orderStatus.`, etc.
- Do not pass user-generated text through `t()`
