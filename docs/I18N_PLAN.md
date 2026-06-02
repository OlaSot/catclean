# CatClean CRM — i18n plan

## Strategy (lightweight)

- **Locales:** `en` (default), `ru`
- **Storage:** `localStorage` key `catclean_locale` — no `/en` or `/ru` routes
- **Runtime:** client-only `I18nProvider` in `src/app/app/layout.tsx` wraps authenticated CRM (`/app/*`)
- **API:** unchanged — server responses stay English; UI translates on the client
- **Keys:** flat dot notation in `src/i18n/dictionaries/en.ts` (source of truth for `TranslationKey`)
- **Lookup:** `t(key)` → current locale → fallback English → return raw `key` if missing

## Files

| Path | Role |
|------|------|
| `src/i18n/i18n.types.ts` | `Locale`, `TranslationKey`, storage key |
| `src/i18n/dictionaries/en.ts` | English strings |
| `src/i18n/dictionaries/ru.ts` | Russian strings (`satisfies Dictionary`) |
| `src/i18n/translate.ts` | `createTranslate`, `orderStatusTranslationKey` |
| `src/i18n/I18nProvider.tsx` | Context: `locale`, `setLocale`, `t` |
| `src/i18n/useT.ts` | Hook + `orderStatusLabel`, `paymentLabel` helpers |
| `src/components/i18n/LanguageSwitcher.tsx` | EN / RU toggle in admin header |

## Translated now

- Admin sidebar navigation (`nav.*`)
- Admin header: log out, language switcher
- Admin shell page title (from `getAdminPageTitleKey`)
- Common actions: loading, save, cancel, edit, view details, add order (where wired)
- Order status pills (main statuses + cancelled variants)
- Payment pills: paid, unpaid, partial/pending
- Admin orders list + filters: titles, filter labels, reset action, status/payment labels
- Admin order detail: major section labels, quick actions, warnings, status/payment badges
- Admin order finance card: summary labels, payment/payout forms, warnings, history blocks
- Admin schedule: day controls, counters, chips, unassigned/empty states
- Notifications bell: header, unread/caught-up labels, mark-all/read states, relative time suffixes
- Create/edit order forms: core labels, hints, action buttons

## Translate later (priority)

1. **Clients/cleaners/reviews/complaints pages** — list subtitles, counters, empty/error states
2. **Order service-specific copy** — service field labels from configs/constants where still English
3. **Cleaner assignment/files/timeline polish** — remaining helper texts and confirmations
4. **Cleaner/client portals** — layouts, cards, details, actions
5. **Login** — staff + phone tabs (when OTP ships)
6. **Dashboard** — KPI labels, attention reasons

## Do not translate (for now)

- API error messages returned from routes
- `docs/`, seed scripts, SQL migrations
- Database content (client names, complaint text, history notes)
- Service type catalog labels in `ORDER_SERVICE_TYPES` (until product copy is finalized)

## Adding keys

1. Add the key and English string to `src/i18n/dictionaries/en.ts`
2. Add the same key to `src/i18n/dictionaries/ru.ts` (TypeScript will fail if missing)
3. Use `const { t } = useT()` in a **client** component: `t("section.key")`
4. For order statuses: prefer `orderStatusLabel(status)` from `useT()`
5. For payment UI: prefer `paymentLabel("paid" | "unpaid" | "card_hold")`
6. Keep server mappers and `getOrderStatusLabel()` in English for logs/API consistency until server-side i18n is needed

## Conventions

- Prefixes: `common.`, `nav.`, `orders.`, `finance.`, `schedule.`, `notifications.`, `forms.`, `warnings.`, `status.`, `payment.`, `orderStatus.`
- Use stable semantic keys, not English sentences as keys
- Avoid duplicating keys for the same concept
- Do not pass user-generated text through `t()`
