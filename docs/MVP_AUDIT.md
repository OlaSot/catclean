# CatClean CRM — MVP Readiness Audit

**Дата:** 2026-05-27  
**Тип:** Internal technical / product audit (read-only, без изменений кода)  
**Цель:** Оценить текущий MVP как **операционную систему**, а не backlog новых фич.  
**Основа:** код `catclean-crm`, миграции `supabase/migrations/`, `docs/ORDER_MODEL.md`, `docs/ORDER_RULES.md`, `docs/API_MAP.md`.

---

## Executive summary

CatClean CRM уже покрывает **основной операционный цикл** для staff и клинера: создание заказа → назначение → start/complete → ручной finance ledger → расписание → клиентские cancel/reschedule/review/complaint. Admin-оболочка зрелая; client/cleaner UI функционален, но визуально и по уведомлениям — второй эшелон.

**Главные блокеры перед production:**

1. **Разрыв product rules vs код** — жалобы в `in_progress` описаны в `ORDER_RULES.md`, но заблокированы в `reviews-complaints-rules.ts`.
2. **Пустые service details** — при создании заказа detail-таблицы не заполняются; клинер/клиент не видят чек-лист услуги.
3. ~~**Статус `problem`**~~ — **реализован** end-to-end: `OrderStatus`, complaint → `problem`, dashboard Attention, admin manual status, client UI.
4. **Двусмысленность `paid` / `card_hold`** — order status vs payment_status vs finance ledger.
5. **Security gap** — `order_files` без RLS в репозитории; core-таблицы (`orders`, `profiles`) не версионированы в migrations.
6. **Finance без enforcement** — completed + unpaid допустимы; refund-строки не уменьшают `paidAmount`.

**Вердикт:** MVP пригоден для **ограниченного пилота** (ручные заказы, 1–2 оператора, активный admin), но **не готов** как self-service ops без playbook и доработок из раздела 10 (Critical).

---

## 1. Core flows

### 1.1 Admin creates order

| | |
|---|---|
| **Путь** | UI: `CreateOrderForm` → `POST /api/admin/orders` → `createAdminOrder` |
| **Что хорошо** | Валидация полей с `fieldErrors`; дефолты `status=new`, `payment_status=unpaid`, `currency=EUR`; создание клиента/адреса; запись в `order_status_history`; staff-only API |
| **Missing** | Нет wizard по `service_type`; detail table создаётся пустой (`{ order_id }` only); нет `channel`, `estimated_duration_hours`, pricing engine; клиент **не** создаёт заказы в CRM (`GET` only на `/api/client/orders`) |
| **UX gaps** | Один общий форм без параметров услуги; оператор не видит, что detail card будет пустой до ручного edit |
| **Bugs / race** | Дублирующий путь `createOrderAction` (legacy) — риск расхождения, если кто-то подключит старый action; нет идемпотентности при double-submit формы |

### 1.2 Assign cleaner

| | |
|---|---|
| **Путь** | `PATCH .../assign-cleaner` → `assignAdminOrderCleaner`; unassign → `searching_cleaner` |
| **Что хорошо** | Проверка `canAssignCleaner` по status; active cleaner; upsert `order_assignments`; авто `cleaner_assigned`; уведомление клинеру `order_assigned` |
| **Missing** | Нет проверки overlap в расписании; `payment_status` намеренно не блокирует (MVP) — нужен ops playbook |
| **UX gaps** | В форме назначения отображается debug `payment_status`; нет inline assign из schedule |
| **Bugs / race** | Повторный assign шлёт повторное `order_assigned`; concurrent assign двух клинеров — последний wins (нет optimistic lock) |

### 1.3 Cleaner start / complete

| | |
|---|---|
| **Путь** | `PATCH .../start` (`confirmed` \| `cleaner_assigned` → `in_progress`); `PATCH .../complete` (`in_progress` → `completed`) |
| **Что хорошо** | Ownership check `assigned_cleaner_id`; `order_assignments.completed_at` при complete; staff notification на complete |
| **Missing** | Нет «report problem» для клинера; нет notify на start; payout в cleaner UI захардкожен `0` |
| **UX gaps** | Cleaner shell — stub header; service details не показываются |
| **Bugs / race** | Admin может вручную сменить status во время `in_progress` (полный override без whitelist) — клинер может оказаться в несогласованном состоянии |

### 1.4 Client review / complaint

| | |
|---|---|
| **Путь** | `POST .../review`, `POST .../complaint`; UI: `ClientOrderDetailView` |
| **Что хорошо** | Review только на `completed`; dedup open complaint; staff notify на complaint |
| **Missing** | Review **не** уведомляет staff; `ORDER_RULES.md` §4: complaint в `in_progress` — **не реализовано** |
| **UX gaps** | `ORDER_RULES.md` §2.1 всё ещё помечает review/complaint как placeholder — документация устарела |
| ~~**Bugs / race**~~ | ~~`problem` phantom status~~ — исправлено: complaint переводит заказ в `problem`, правила `in_progress` / `completed` / `problem` |

**Код расхождения:**

```11:14:src/lib/orders/reviews-complaints-rules.ts
export function canOpenComplaintForStatus(status: string | null | undefined): boolean {
  const key = normalizeOrderStatusRaw(status);
  return key === "completed" || key === "problem";
}
```

vs `ORDER_RULES.md` §4: complaint обязателен при `in_progress` / `completed` вместо отмены.

### 1.5 Notifications

| | |
|---|---|
| **Путь** | `createNotification` / `createStaffNotifications`; UI: `NotificationBell` в `AdminHeader` |
| **Что хорошо** | In-app MVP; RLS read/update; insert через service role (корректно при отсутствии INSERT policy) |
| **Missing** | См. раздел 4; client/cleaner без bell |
| **UX gaps** | Poll при смене `pathname`, не realtime; disabled «Notify client/cleaner» в `OrdersCard` |
| **Bugs / race** | Ошибки notify не ломают HTTP (assign/complete) — оператор думает, что уведомление ушло; staff fan-out без dedup |

### 1.6 Finance / payment / payout

| | |
|---|---|
| **Путь** | `GET/POST .../finance`, `.../payments`, `.../payouts`; `AdminOrderFinanceCard` |
| **Что хорошо** | Append-only ledger; авто-пересчёт `orders.payment_status` после payment; margin = netPaid − payouts; RLS на finance tables |
| **Missing** | policy cap payouts (soft warning only) |
| **UX gaps** | Payout form просит raw `profiles.id`; нет warning при negative margin |
| **Bugs / race** | Manual `payment_status` в `AdminOrderEditView` расходится с ledger; `refunded` payment row не вычитает из `paidAmount` |

### 1.7 Schedule view

| | |
|---|---|
| **Путь** | `GET /api/admin/schedule` → `AdminScheduleView` |
| **Что хорошо** | День + фильтр клинера; overlap hint per row; unassigned секция; ссылки на заказ |
| **Missing** | Блокировка assign при overlap; реальная duration из БД; фильтр terminal statuses |
| **UX gaps** | Unassigned — только deep link, не quick assign; фиксированное окно 08:00–20:00 |
| **Bugs / race** | Заказы без `scheduled_time` не в overlap math, но рисуются на timeline; unassigned queue может содержать cancelled/completed |

---

## 2. Orders

### 2.1 Поля orders — не используются или частично

По `ORDER_MODEL.md` vs фактические SELECT/mappers:

| Поле / группа | Статус в CRM |
|---------------|--------------|
| `channel`, `payment_method`, `discount_percent` | Не в create/edit flow |
| `estimated_duration_hours`, `actual_duration_hours` | Не в `src/` (schedule = 180 min const) |
| `client_comment` | Хак: `addresses.postal_code` |
| `price_breakdown`, `manual_discount`, `manual_surcharge` | Admin edit есть; create — нет |
| `final_price` | Finance fallback; не обязателен при complete |
| `cancellation_fee_amount` | Логика cancel есть в `client-cancellation.ts`; отображение разрозненно |
| `margin_amount` (orders) | Не используется — margin считается в finance card |

### 2.2 Service details — не отображаются

| Контекст | Поведение |
|----------|-----------|
| Create | Пустая строка в detail table |
| Admin detail | `AdminOrderServiceDetailsCard` — empty state, если поля пусты |
| Admin edit | Patch detail tables через `updateAdminOrder` — **работает** |
| List card | `serviceSummary` из `formatOrderServiceSummary` — обычно `null` |
| Cleaner / client | Detail tables **не** join в queries |
| Schedule | Только `service_type`, цены с row |

7 типов услуг (`regular_cleaning` … `special_pet_package`) — таблицы описаны в `ORDER_MODEL.md`; маппинг `move_in_out` → `move_cleaning_details`.

### 2.3 Placeholders

| Место | Что |
|-------|-----|
| `app/app/admin/services/page.tsx` | `AdminPlaceholder` — Coming soon |
| `app/app/admin/settings/page.tsx` | то же |
| `OrdersCard` menu | Notify client / cleaner — disabled |
| `order.mapper.ts` | `durationHours: 0`, `rooms: []`, `channel: "Manual"`, `payment.method: "After"` |
| `AdminOrderFinanceCard` | placeholder `profiles.id` для payout |
| Cleaner/client layout | Stub headers |

### 2.4 Inconsistent naming / statuses

| Issue | Detail |
|-------|--------|
| `canceled` vs `cancelled_by_*` | Type + normalize; dropdown без `canceled` |
| `paid` | Order status **и** payment_status — разный смысл |
| `move_in_out` vs `move_cleaning_details` | service_type vs table name |
| snake_case DB / camelCase UI | Ожидаемо, но labels иногда raw `statusRaw` |
| `postal_code` = comment | Ломает будущую geo/validation |

---

## 3. Status model

### 3.1 Канонический список (`OrderStatus`)

`new` → `waiting_for_payment` → `paid` → `searching_cleaner` → `cleaner_assigned` → `confirmed` → `in_progress` → `completed` → cancel variants → `refunded` → alias `canceled`.

`OrderPaymentStatus`: `unpaid` | `paid` | `card_hold`.

Отдельно: `OrderPaymentRecordStatus` на строках ledger: `pending` | `paid` | `failed` | `refunded`.

### 3.2 Автоматические переходы (код)

| Transition | Trigger |
|------------|---------|
| → `cleaner_assigned` | assign |
| → `searching_cleaner` | unassign |
| → `in_progress` | cleaner start |
| → `completed` | cleaner complete |
| → `cancelled_by_client` | client cancel |
| *любой → любой* | admin `updateAdminOrderStatus` (без whitelist) |

### 3.3 Unreachable / phantom statuses

| Status | Проблема |
|--------|----------|
| ~~`problem`~~ | В `OrderStatus`; выставляется client complaint и admin status change; dashboard Attention |
| `waiting_for_payment`, `paid` (order) | Только ручной admin |
| `confirmed` | Не обязателен перед start (можно из `cleaner_assigned`) |
| `cancelled_by_cleaner` | Только ручной admin |
| `canceled` | Alias; normalize `cancelled` → `canceled`; fallback unknown → **`new`** (маскирует битые данные) |

### 3.4 Duplicate meanings

| Пара | Риск |
|------|------|
| `orders.status = paid` vs `payment_status = paid` | Оператор путает workflow и деньги |
| `card_hold` | В docs — авторизация карты; в коде — **partial payment** (`computeNextPaymentStatus`) |
| `refunded` (order) vs `refunded` (payment row) | Независимые процессы |
| `done` → `completed`, `cancelled` → `canceled` | Aliases в `order-status.utils.ts` |

### 3.5 payment_status consistency

| Источник | Обновляет `orders.payment_status`? |
|----------|-----------------------------------|
| Create order | `unpaid` |
| `createAdminOrderPayment` | Да, recompute |
| `createAdminCleanerPayout` | **Нет** |
| Admin edit dropdown | Да, **напрямую** — может разойтись с ledger |
| Assign / complete | **Нет** (by design) |

**Правило recompute:** `paidAmount <= 0` → unpaid; `>= orderTotal` → paid; иначе → `card_hold`.

---

## 4. Notifications

### 4.1 Кто получает

| Event | type | Получатели |
|-------|------|------------|
| Assign cleaner | `order_assigned` | Назначенный cleaner (`profiles.id`) |
| Complete | `order_completed` | Все `admin` + `operator` |
| Complaint | `complaint_created` | Все staff |
| Reschedule request | `reschedule_requested` | Все staff |

**Канал:** только in-app (`notifications` table). Email/SMS нет.

**UI:** `NotificationBell` только в admin header. Client/cleaner не видят inbox.

**API:** `GET /api/notifications` — только `user_id = currentUser` (даже staff не видит чужие через API).

### 4.2 Missing events (рекомендуемые для ops)

- Новый заказ (admin create)
- Client cancel
- Admin status change / unassign
- Cleaner start
- Review submitted
- Payment / payout recorded
- Re-assign / смена даты оператором

### 4.3 Spam risk

| Risk | Уровень | Причина |
|------|---------|---------|
| Staff fan-out | Medium | N строк на каждое событие (N = count admin+operator) |
| Reschedule | Medium | Нет cooldown/dedup |
| Re-assign | Low | Повторный `order_assigned` |
| Complaint | Low | Dedup open complaint |

### 4.4 Инфраструктура

- INSERT только через **service role** (`createSupabaseAdminClient`) — корректно при отсутствии INSERT RLS.
- Нет DB triggers на notifications.
- Ошибки insert логируются; HTTP success сохраняется.

---

## 5. Finance

### 5.1 Manual payment logic

- Staff session + RLS (`order_payments`).
- Amount > 0; метод и note опциональны.
- `paidAmount` = сумма строк со `status === 'paid'`.
- `orderTotal` = `final_price ?? estimated_price ?? 0`.

### 5.2 Payout edge cases

| Case | Поведение |
|------|-----------|
| Payout без assigned cleaner | **Разрешено** |
| Payout другому `cleaner_id` | **Разрешено** |
| Sum > order / margin | **Нет cap** |
| `pending` payout | **Входит** в `payoutAmount` и снижает margin |
| Delete/edit payout | **Нет API** |

### 5.3 Negative margin

`marginAmount = paidAmount - payoutAmount` — без floor. UI без предупреждения. Типичный сценарий: pending payout до оплаты клиента.

### 5.4 Refunds

| Механизм | Проблема |
|----------|----------|
| Payment row `status: refunded` | **Не** уменьшает ранее учтённые `paid` строки |
| `orders.status = refunded` | Ручной lifecycle, не связан с ledger |
| Admin manual `payment_status` | Bypass ledger |

**Пример:** €100 paid + €100 refunded row → `paidAmount` остаётся €100.

### 5.5 Unpaid completed orders

| Check | Enforced? |
|-------|-----------|
| Complete при `payment_status=unpaid` | **Да** (разрешено) |
| Assign при unpaid | **Да** (разрешено) |
| Dashboard revenue | Суммирует completed по `estimated/final_price`, **не** по payments |
| Attention queue | Нет причины «completed + unpaid» |

---

## 6. Schedule

### 6.1 Overlap

- `detectScheduleOverlap()` — display only, per-cleaner intervals.
- Assign **не** проверяет конфликты.
- Orders без `scheduled_time` — вне overlap math, но на UI (fixed 12% width).

### 6.2 Timezone

- `todayIsoLocal()`, `parseScheduleDate()` — **local JS Date**, без IANA TZ.
- `scheduled_date` — ISO date string equality.
- Dashboard `today` дублируется в `getAdminDashboardStats.ts` и `schedule-time.ts`.
- **Risk:** server UTC vs browser local для KPI «сегодня».

### 6.3 Duration

- `SCHEDULE_DEFAULT_DURATION_MINUTES = 180` везде.
- `estimated_duration_hours` из модели **не используется**.

### 6.4 Unassigned workflow

- `assigned_cleaner_id IS NULL` → amber section.
- Sort: по времени, null last.
- Action: link на order detail (не modal assign).
- **Не фильтрует** terminal statuses — в отличие от dashboard attention.

---

## 7. Security / RLS

### 7.1 Таблицы с RLS (в repo migrations)

| Table | Migration | Policies (кратко) |
|-------|-----------|-------------------|
| `reviews` | 004 | SELECT staff/owner; INSERT client |
| `complaints` | 004 | SELECT staff/owner; INSERT client; UPDATE staff |
| `notifications` | 005 | SELECT staff or own; UPDATE staff or own; **no INSERT** |
| `order_payments` | 006 | SELECT staff/client owner; INSERT/UPDATE staff |
| `cleaner_payouts` | 006 | SELECT staff/own payout; INSERT/UPDATE staff |

Helpers: `is_staff_profile()`, `client_owns_order()`, `cleaner_owns_order()`.

### 7.2 Без RLS в repo (риск)

| Object | Risk |
|--------|------|
| `order_files` | 003 — таблица без `ENABLE ROW LEVEL SECURITY` |
| `orders`, `profiles`, `addresses`, `order_assignments`, detail tables | Не в migrations — **проверить в Supabase dashboard** |

Защита сейчас опирается на **API auth** (`requireStaffApiAuth`, `requireCleanerApiAuth`, client access helpers), не на DB RLS для core data.

### 7.3 Service role usage

| Use case | Files (representative) |
|----------|------------------------|
| Notification INSERT | `createNotification.ts` |
| User provisioning | `createAdminClient.ts`, `createAdminCleaner.ts` |
| Order files + signed URLs | `uploadAdminOrderFile.ts`, `list-order-files-with-signed-urls.ts`, … |
| Avatars / buckets | `ensure-avatars-bucket.ts`, `enrichCleanerAvatarUrls.ts` |
| Seed scripts | `scripts/seed-*.ts` |

Finance routes: **staff session**, не service role.

### 7.4 Potential security risks

1. **`order_files` без RLS** — при широких grants `authenticated` возможен bypass metadata через прямой Supabase client.
2. **Staff notification RLS** — staff может SELECT/UPDATE все notifications; `PATCH .../read` без `.eq('user_id')` — relies on RLS only.
3. **No edge middleware auth** — `middleware.ts` только refresh session; `/app/*` guard client-side + layout server redirect.
4. **Service role key** — полный bypass RLS; компрометация = total loss.
5. **Дублированный inline auth** в `admin/orders/[id]/route.ts` vs `requireStaffApiAuth` — риск drift.
6. **Core RLS не в git** — production может расходиться с assumptions команды.

---

## 8. UX audit

### 8.1 Unfinished pages

| Page | State |
|------|-------|
| Admin Services | Placeholder |
| Admin Settings | Placeholder |
| Cleaner layout | `<header>Cleaner header</header>` |
| Client layout | Stub header |
| Orders card notify | Disabled Coming soon |

Nav (`admin-nav.ts`) всё ещё ведёт на Services/Settings.

### 8.2 Scrolling / density

- Admin shell: `overflow-auto` на main — ок для длинных списков.
- Schedule: длинный vertical list клинеров; timeline `overflow-hidden` — риск clip.
- Reviews list: horizontal scroll table.
- Order detail: много карточек вертикально — много scrolling, мало sticky actions.

### 8.3 Missing quick actions

- Schedule → assign inline
- Orders list → notify (заглушка)
- Dashboard attention → bulk actions
- Complaints/reviews → jump to order в one click (частично есть)

### 8.4 UI inconsistency

| Area | Admin | Cleaner/Client |
|------|-------|----------------|
| Shell | Sidebar + header + tokens `#34597E` | Minimal HTML |
| Notifications | Bell | None |
| Empty states | Polished cards | Functional lists |
| Forms | Rounded-2xl design system | Same components, worse chrome |

---

## 9. Tech debt

### 9.1 Duplicated code

| Pattern | ~Locations |
|---------|------------|
| `unwrapRelation<T>()` | 8+ mappers/queries |
| `todayIsoLocal()` | `schedule-time.ts`, `getAdminDashboardStats.ts` |
| Order SELECT fragments | `order-select.ts`, client/cleaner/schedule/dashboard variants |
| Parallel mappers | `order.mapper`, `admin-order-detail`, `client-order`, `cleaner-order` |

### 9.2 TODO / FIXME

В `src/` и SQL **не найдено** `TODO`/`FIXME`/`HACK` — долг не маркирован в коде.

### 9.3 Placeholders & hardcoded

- Status strings в mutations (`searching_cleaner`, `accepted`, `completed`).
- `TERMINAL_STATUSES` в dashboard.
- `normalizeOrderStatus` unknown → `new`.
- Finance `(row as any)` в queries/mutations.

### 9.4 Missing validation

- **Нет Zod** (или аналога) на API bodies — cast `as Type`.
- Сильная валидация: `createAdminOrder`.
- Слабая: finance POST, многие PATCH, notifications.
- `updateAdminOrderStatus` — whitelist status, но **не** transition graph.

### 9.5 Legacy / dead paths

- `createOrderAction` vs REST create.
- `ORDER_RULES.md` помечает client review/complaint placeholder — UI уже есть.

### 9.6 Minor code smell

- `app/app/cleaner/layout.tsx` экспортирует компонент `AdminLayout` (copy-paste name).

---

## 10. Recommended roadmap

### Critical before production

| # | Item | Why |
|---|------|-----|
| C1 | Выровнять complaint rules с `ORDER_RULES.md` (`in_progress` + `completed`) | Client не может жаловаться во время уборки — блокер support |
| ~~C2~~ | ~~`problem` end-to-end~~ | **Done** |
| C3 | RLS audit в Supabase: `orders`, `profiles`, `order_files` + storage policies | Defense in depth |
| C4 | Минимальный service detail при create/edit (хотя бы top fields per `service_type`) | Cleaner ops без данных |
| C5 | Finance: исправить refund accounting **или** documented manual process + запрет `paid`+`refunded` double count | Cash reporting wrong |
| C6 | Развести naming: `card_hold` → `partially_paid` **или** явный ops doc | Operator confusion |
| C7 | Playbook: order `paid` vs `payment_status` vs `order_payments` | Training requirement |
| C8 | Проверка `SUPABASE_SERVICE_ROLE_KEY` в prod + monitor failed notification inserts | Silent failures |

### Important operational improvements

| # | Item |
|---|------|
| I1 | Показывать service details в cleaner/client views |
| I2 | Schedule: real duration; filter terminal from unassigned; overlap warning on assign |
| I3 | Timezone policy (e.g. `Europe/Berlin`) для today/KPI/schedule |
| I4 | Notifications: cancel, new order, review, payment; dedup staff fan-out |
| I5 | NotificationBell для cleaner (assign, reschedule decision) |
| I6 | Dashboard: «completed + outstanding > 0» attention; revenue from `order_payments` |
| I7 | Payout: default to assigned cleaner; cap vs margin; exclude pending from margin **или** label |
| I8 | Убрать/реализовать OrdersCard notify; обновить `ORDER_RULES.md` §2.1 |
| I9 | Client/cleaner app shell (parity с admin) |
| I10 | Миграция `postal_code` hack → `client_comment` / `doorbell` |
| I11 | API validation (Zod) на finance и status routes |
| I12 | `PATCH notifications/read` filter by `user_id` |

### Nice-to-have later

| # | Item |
|---|------|
| N1 | Admin Services / Settings pages |
| N2 | Pricing engine из detail fields |
| N3 | Client self-service order create |
| N4 | Cleaner report problem + richer file workflow |
| N5 | Email/SMS/Telegram notifications (`TELEGRAM_BOT_PLAN.md`) |
| N6 | Transition whitelist для admin status (с override flag) |
| N7 | Realtime notifications |
| N8 | Shared `unwrapRelation` / unified order query layer |
| N9 | Inline schedule assign modal |
| N10 | Channel tracking на create |

---

## Appendix A — API map (order-related)

**Admin:** `GET/POST /api/admin/orders`, `GET/PATCH /api/admin/orders/[id]`, `PATCH .../status`, `.../assign-cleaner`, `.../unassign-cleaner`, `.../finance`, `.../payments`, `.../payouts`, `.../files*`

**Cleaner:** `GET /api/cleaner/orders`, `GET/PATCH .../[id]/start|complete`, `.../files*`

**Client:** `GET /api/client/orders`, `GET .../[id]`, `PATCH .../cancel`, `POST .../reschedule-request|review|complaint`

**Other:** `GET /api/admin/schedule`, `GET /api/admin/reviews|complaints`, `GET/PATCH /api/notifications*`

Полная карта: `docs/API_MAP.md`.

---

## Appendix B — Migration inventory

| File | Purpose |
|------|---------|
| 001_expand_order_details.sql | Order/detail columns |
| 002_order_edit_fields.sql | Edit fields |
| 003_order_files.sql | **order_files, no RLS** |
| 004_reviews_complaints.sql | reviews, complaints + RLS |
| 005_notifications.sql | notifications + RLS |
| 006_finance_mvp.sql | order_payments, cleaner_payouts + RLS |

---

## Appendix C — Flow readiness matrix

| Flow | Backend | Admin UI | Cleaner UI | Client UI | Ops-ready? |
|------|---------|----------|------------|-----------|------------|
| Create order | Yes | Yes | — | — | Partial |
| Assign | Yes | Yes | — | — | Yes |
| Start/complete | Yes | — | Yes | — | Yes |
| Cancel/reschedule | Yes | — | — | Yes | Yes |
| Review | Yes | — | — | Yes | Yes |
| Complaint | Yes | List | — | Partial | **No** (rules) |
| Notifications | Partial | Bell | No | No | Partial |
| Finance | Yes | Yes | Read payout | — | Partial |
| Schedule | Yes | Yes | — | — | Partial |
| Service details | Read/edit | Empty create | No | No | **No** |

---

*Документ подготовлен по состоянию репозитория на дату аудита. При изменении кода обновлять разделы 3, 4, 5 и Appendix C в первую очередь.*
