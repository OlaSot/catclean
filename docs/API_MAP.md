# CatClean CRM — Карта API

Этот документ описывает **все текущие API routes** в `src/app/api/**/route.ts`.

## Общие соглашения

- **Base URL**: все endpoints находятся под `/api/*`
- **Передача auth**: Supabase Auth сессия через cookies (сервер использует `createSupabaseServerClient()` и `supabase.auth.getUser()`).
- **Единый формат ответа** (почти везде):
  - Успех: `{ data: <payload>, error: null }`
  - Ошибка: `{ data: null, error: "<message>" }` (HTTP status указывает тип ошибки)
- **Источник ролей**: `public.profiles.role` (строка профиля по ключу `profiles.id = auth.users.id`)
- **API-first правило**: UI страницы/компоненты ходят через `/api/*`; server queries/mutations используются из `route.ts`.

## Phone (E.164 infrastructure)

Подготовка к phone-first auth ([AUTH_MODEL.md](./AUTH_MODEL.md)). **Login / OTP не включены.**

| Поле | Описание |
|------|----------|
| `profiles.phone` | Текстовый телефон (сохраняется; для новых записей = E.164) |
| `profiles.phone_normalized` | **E.164** для uniqueness и будущего Phone OTP (`+491781234567`) |

**Правила:**

- Нормализация: `src/lib/phone/normalize-phone.ts` (`normalizePhone`, `isValidPhone`)
- Валидация на create: `validateProfilePhone` в `src/lib/phone/profile-phone.ts`
- Невалидный номер → `400` / field error
- Дубликат `phone_normalized` → «A profile with this phone number already exists»
- Уникальность: `profiles_phone_normalized_unique_idx` (WHERE NOT NULL)

**Create order:** клиент ищется по `phone_normalized`, затем по email; auto-create пишет оба поля.

**Backfill:** `npm run normalize:phones` (логирует invalid и duplicate, не удаляет строки).

## Auth

**Целевая модель (phone OTP для client/cleaner, email/password для staff):** см. **[AUTH_MODEL.md](./AUTH_MODEL.md)**.  
Ниже описано **текущее** поведение в коде.

Логин выполняется через Supabase Auth на клиенте:

- `supabase.auth.signInWithPassword()`

После логина серверные route handlers проверяют:

- Пользователь аутентифицирован через `supabase.auth.getUser()`
- Роль берётся из `public.profiles.role`

Role gates (проверки доступа), используемые в API:

- **Admin/Staff** endpoints: `requireStaffApiAuth()` → роли разрешены через `isStaffApiRole()` (см. `src/lib/api/staff-api-auth.ts`)
- **Cleaner** endpoints: `requireCleanerApiAuth()` → `profiles.role === "cleaner"`
- **Client** endpoints: `requireClientApiAuth()` → `profiles.role === "client"`

## ID model (обязательно знать)

- `profiles.id` **равен** `auth.users.id` (Supabase Auth user id).
- `orders.client_id` → `profiles.id` **клиента**.
- `orders.assigned_cleaner_id` → `profiles.id` **клинера** (когда назначен).
- `cleaner_profiles.profile_id` → `profiles.id` клинера.
- `client_profiles.profile_id` → `profiles.id` клиента.
- `order_assignments.cleaner_id` → `profiles.id` клинера.

Важная пометка для назначения клинера админом:

- `/api/admin/orders/[id]/assign-cleaner` ожидает `cleanerId` как **`profiles.id`** (auth user id). Внутри `resolveCleanerProfileId()` может принять `cleaner_profiles.id` и преобразовать в `profiles.id`, но API-клиентам следует всегда отправлять именно `profiles.id`.

## Status model

Модель статусов и бизнес-правила переходов описаны в:

- `docs/ORDER_RULES.md`

Обычно endpoints возвращают:

- `409 Conflict`, когда действие/переход **не разрешён** для текущего статуса (см. конкретные endpoints ниже).

## Order model

Модель заказа, структура detail-таблиц и варианты `service_type` описаны в:

- `docs/ORDER_MODEL.md`

Admin order detail endpoint включает **service details**, которые подгружаются из detail-таблицы в зависимости от `orders.service_type` (см. `getAdminOrderById()`).

---

## 0. Notifications API

Внутренние уведомления **внутри приложения** (без email/SMS/Telegram).

### GET /api/notifications

Purpose:
- Получить список уведомлений текущего пользователя (последние, по `created_at DESC`).
- Опционально фильтровать только непрочитанные.

Auth:
- Требуется (Supabase session cookie)

Roles:
- Любая роль; выдаются уведомления только `user_id = currentUserId`.

Query params:
- `unread=true` (optional): вернуть только `is_read = false`

Response success:
- `200`: `{ data: NotificationItem[], error: null }`

`NotificationItem`:
- `id`, `type`, `title`, `message?`, `orderId?`, `isRead`, `createdAt`

Response errors:
- `401`: Unauthorized
- `500`: `{ data: null, error: string }`

Database tables:
- `notifications` (select)

Used by pages/components:
- `NotificationBell` (dropdown в header)

---

### PATCH /api/notifications/[id]/read

Purpose:
- Отметить одно уведомление как прочитанное.

Auth:
- Требуется

Roles:
- Любая роль; только свои уведомления (через RLS).

Response success:
- `200`: `{ data: { id: string }, error: null }`

Response errors:
- `400`: Notification id is required
- `401`: Unauthorized
- `404`: Notification not found
- `500`: `{ data: null, error: string }`

Database tables:
- `notifications` (update `is_read = true`)

---

### PATCH /api/notifications/read-all

Purpose:
- Отметить все уведомления текущего пользователя как прочитанные.

Auth:
- Требуется

Response success:
- `200`: `{ data: { ok: true }, error: null }`

Response errors:
- `401`: Unauthorized
- `500`: `{ data: null, error: string }`

Database tables:
- `notifications` (bulk update `is_read = true` where `user_id = currentUserId`)

---

## 1. Admin API

### GET /api/admin/dashboard

Purpose:
- Сводка для admin dashboard: KPI, заказы, требующие внимания, расписание на сегодня, последняя активность.

Auth:
- Требуется (Supabase session cookie)

Roles:
- Staff/admin/operator через `requireStaffApiAuth()`

Request body:
- Нет

Query params:
- Нет

Response success:
- `200`:

```json
{
  "data": {
    "kpis": {
      "totalOrders": 0,
      "todayOrders": 0,
      "searchingCleaner": 0,
      "inProgress": 0,
      "completedThisWeek": 0,
      "revenueThisWeek": 0,
      "currency": "EUR"
    },
    "attentionOrders": [],
    "todaySchedule": [],
    "recentActivity": []
  },
  "error": null
}
```

Response notes:
- **kpis**: агрегаты по `orders` (today = `scheduled_date` сегодня, week = календарная неделя пн–вс, local server timezone).
- **attentionOrders**: до 12 заказов — `searching_cleaner`, `problem`, или `assigned_cleaner_id` null (для unassigned исключаются terminal статусы).
- **todaySchedule**: заказы с `scheduled_date` = сегодня, сортировка по `scheduled_time`.
- **recentActivity**: последние 15 записей `order_status_history` (desc).

Response errors:
- `401`: Unauthorized
- `403`: Forbidden
- `500`: `{ data: null, error: string }`

Database tables:
- `orders` (select, count)
- `order_status_history` (select)
- `profiles` (join / select for actors)

Used by pages/components:
- `/app/admin` (`AdminDashboard`)

---

### GET /api/admin/orders

Purpose:
- Получить список всех заказов для staff/admin дашборда (карточки).

Auth:
- Требуется (Supabase session cookie)

Roles:
- Staff/admin/operator роли через `requireStaffApiAuth()`

Request body:
- Нет

Query params (все опциональны):
- `search` — поиск по имени/email/телефону клиента, `order_number`, id заказа, городу/улице адреса (case-insensitive, substring)
- `status` — `orders.status` (значение из `ORDER_STATUSES`, например `paid`, `cleaner_assigned`)
- `payment_status` — `unpaid` | `paid` | `card_hold`
- `service_type` — один из `ORDER_SERVICE_TYPES` (например `regular_cleaning`)
- `city` — substring по `addresses.city` (после join)
- `assigned` — `all` (по умолчанию, не передавать) | `assigned` (`assigned_cleaner_id` not null) | `unassigned` (`assigned_cleaner_id` is null)
- `cleaner_id` — `profiles.id` назначенного клинера → `orders.assigned_cleaner_id`
- `date_from` — `scheduled_date >=` (ISO `YYYY-MM-DD`)
- `date_to` — `scheduled_date <=` (ISO `YYYY-MM-DD`)

Сортировка (сервер): `scheduled_date` desc, `scheduled_time` desc, `created_at` desc.

Пример: `GET /api/admin/orders?status=searching_cleaner&assigned=unassigned&city=Hannover`

Response success:
- `200`: `{ data: Order[], error: null }`

Response errors:
- `401`: Unauthorized
- `403`: Forbidden
- `500`: `{ data: null, error: string }`

Database tables:
- `orders` (select)
- `addresses` (join в `ADMIN_ORDER_SELECT`)
- `profiles` (join клиента и клинера внутри `ADMIN_ORDER_SELECT`)
- `client_profiles` / `cleaner_profiles` (join внутри `ADMIN_ORDER_SELECT`)

Used by pages/components:
- UI списка заказов админа (orders dashboard)

---

### GET /api/admin/schedule

Purpose:
- Operational schedule board: orders for a day grouped by cleaner, unassigned queue, overlap hints.

Auth:
- Требуется

Roles:
- Staff/admin/operator (`requireStaffApiAuth()`)

Query params:
- `date` (optional, `YYYY-MM-DD`; default = today local)
- `cleaner_id` (optional, `profiles.id` — filter to one cleaner column)

Response success:
- `200`: `{ data: AdminScheduleData, error: null }`

`AdminScheduleData`:
- `date: string`
- `cleaners: AdminScheduleCleanerRow[]` — active cleaners (+ any cleaner with assignments that day)
- `unassignedOrders: AdminScheduleOrder[]`

Each `AdminScheduleCleanerRow`:
- `cleaner: { id, fullName, avatarUrl, city }`
- `orders[]` sorted by `scheduledTime`
- `totalOrdersToday`, `totalHoursToday` (sum of `estimatedDurationMinutes`)
- `hasOverlap: boolean` — time intervals overlap for same cleaner
- `isFree: boolean` — no orders that day

Each `AdminScheduleOrder`:
- `id`, `displayId`, `status`, `statusLabel`, `serviceType`, `serviceTypeLabel`
- `scheduledDate`, `scheduledTime`, `startMinutes`, `estimatedDurationMinutes` (default **180** if no DB duration)
- `address: { city, line }`, `client: { name, email, phone }`, `price`, `currency`

Response errors:
- `401`, `403`, `500`

Database tables:
- `orders` (filter `scheduled_date`)
- `addresses`, `profiles` (join)
- `cleaner_profiles` / active cleaners list

Used by pages/components:
- `/app/admin/schedule` — `AdminScheduleView`

---

### POST /api/admin/orders

Purpose:
- Создать новый заказ из админ-панели (полностью REST, API-first).
- Создаёт `addresses`, `orders` и строку в detail-таблице с **serviceDetails** (sqm-first).
- Для `regular_cleaning` / `move_in_out` / `office_cleaning` считает `estimated_price`, `price_breakdown`, `estimated_duration_minutes` автоматически.

Auth:
- Требуется

Roles:
- Staff/admin/operator роли через `requireStaffApiAuth()`

Request body:
- JSON: `AdminCreateOrderRequestBody`
  - `clientEmail: string` (обязательно; если клиента нет, CRM создаст его автоматически через service role)
  - `clientName: string` (обязательно)
  - `clientPhone: string` (обязательно; **E.164**, напр. `+49 178 1234567` — нормализуется в `profiles.phone` / `phone_normalized`)
  - `serviceType: OrderServiceType` (обязательно)
  - `scheduledDate: string` (обязательно, формат `YYYY-MM-DD`)
  - `scheduledTime: string` (обязательно, формат `HH:mm`)
  - `city: string` (обязательно)
  - `street: string` (обязательно)
  - `houseNumber: string` (обязательно)
  - `floor?: string`
  - `doorbellName?: string`
  - `serviceDetails?: object` (поля услуги: `propertySizeM2`, extras, … — см. `CreateOrderForm`)
  - `estimatedPrice?: string | number` (обязательно для услуг без auto-pricing; иначе auto или manual override)
  - `useManualPrice?: boolean` — если `true`, используется `estimatedPrice` от admin, в `price_breakdown` сохраняется `autoPrice`
  - `finalPrice?: string | number` (опционально)
  - `customerComment?: string` (опционально; сейчас хранится в `addresses.postal_code` как legacy-поле)

Query params:
- Нет

Response success:
- `201`: `{ data: AdminOrderDetail, error: null, createdClient?: boolean, clientId?: string }`

Response errors:
- `400`: Invalid JSON body / ошибки валидации
- `401`: Unauthorized
- `403`: Forbidden
- `400`: Email belongs to a non-client profile (если `profiles.role !== client`)
- `500`: `{ data: null, error: string }`

Database tables:
- `profiles` (поиск клиента по email)
- `auth.users` (auto-create, server-side only; service role)
- `client_profiles` (auto-create `client_type = private`)
- `addresses` (insert)
- `orders` (insert)
- Detail-таблица по `serviceType` (insert с полями из `serviceDetails`):
  - `regular_cleaning_details` / `move_cleaning_details` / `airbnb_details` / ...

Used by pages/components:
- `/app/admin/orders/new` (`CreateOrderForm`)

---

### GET /api/admin/orders/[id]

Purpose:
- Получить детальную информацию о заказе для админ-панели, включая service details и operational notes.

Auth:
- Требуется (Supabase session cookie)

Roles:
- Staff/admin/operator (проверка роли реализована прямо в route через `profiles.role` + `isStaffApiRole()`)

Request body:
- Нет

Query params:
- Нет

Response success:
- `200`: `{ data: AdminOrderDetail, error: null }`

Response payload notes (status history):
- В ответе есть поле `statusHistory: OrderStatusHistoryItem[]` — записи из `order_status_history`, сортировка `created_at` asc (для timeline).
- Каждый элемент:
  - `id`, `oldStatus`, `newStatus`, `oldStatusLabel`, `newStatusLabel`
  - `isNote: boolean` — `true`, если статус не менялся (`oldStatus === newStatus`), например reschedule request
  - `noteKind: "note" | "request"` — для `isNote`; `request` если comment начинается с `[Reschedule request]`
  - `changedBy: { id, email, fullName, role } | null`
  - `comment: string | null`
  - `createdAt: string` (ISO)

Response payload notes (service details):
- В ответе есть поле `serviceDetails`:

```js
serviceDetails: {
  type: "regular_cleaning", // совпадает с orders.service_type
  data: { /* service-specific fields (camelCase) */ }
}
```

- `type` всегда один из `OrderServiceType`
- `data` зависит от `type` и приходит в нормализованном виде (camelCase ключи)

Response errors:
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Order not found
- `500`: `{ data: null, error: string }`

Database tables:
- `orders` (select)
- `addresses` (join)
- `profiles`, `client_profiles`, `cleaner_profiles` (join)
- `order_status_history` (select by `order_id`, `created_at` asc)
- `profiles` (select for `order_status_history.changed_by`)
- Service detail table (зависит от `orders.service_type`):
  - выбирается в `fetchOrderServiceDetails()` через `ORDER_SERVICE_DETAIL_TABLE[service_type]`

Used by pages/components:
- Страница/вью детали заказа админа
- Блок “Service details” в админской карточке заказа

---

### GET /api/admin/orders/[id]/files

Purpose:
- Список файлов/фото заказа с **signed URL** (private bucket `order-files`).

Auth:
- Требуется

Roles:
- Staff/admin/operator через `requireStaffApiAuth()`

Request body:
- Нет

Response success:
- `200`: `{ data: AdminOrderFile[], error: null }`

Каждый `AdminOrderFile`:
- `id`, `orderId`, `filePath`, `fileName`, `fileType`, `fileSize`, `category`, `categoryLabel`, `createdAt`
- `uploadedBy: { id, email, fullName, role } | null`
- `signedUrl: string | null` (TTL ~1h)
- `isImage: boolean`

Response errors:
- `401`, `403`, `404` (order), `500`
- `503` если не настроен `SUPABASE_SERVICE_ROLE_KEY`

Database / Storage:
- `order_files` (select)
- Storage bucket `order-files` (private, signed URLs)

---

### POST /api/admin/orders/[id]/files

Purpose:
- Загрузить файл к заказу.

Auth / Roles:
- Staff/admin/operator

Request:
- `multipart/form-data`
  - `file` (required)
  - `category` (required): `before_photo` | `after_photo` | `damage_photo` | `document` | `other`

Validation:
- MIME: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- Max size: 10MB

Storage path:
- `orders/{orderId}/{timestamp}-{sanitizedFilename}`

Response success:
- `201`: `{ data: AdminOrderFile, error: null }`

Response errors:
- `400` validation
- `404` order not found
- `500` / `503` storage or DB

Database / Storage:
- Storage upload + `order_files` insert

---

### GET /api/admin/orders/[id]/finance

Purpose:
- Финансовая сводка заказа (ручные платежи клиента и выплаты клинеру).

Auth / Roles:
- Staff/admin/operator (`requireStaffApiAuth()`)

Response success:
- `200`: `{ data: AdminOrderFinanceData, error: null }`

`AdminOrderFinanceData`:
- `summary`: `orderTotal`, `paidAmount` (gross paid), `refundedAmount`, `netPaidAmount`, `outstandingAmount`, `overpaidAmount`, `payoutAmount`, `marginAmount`, `currency`, `paymentStatus`
- `payments[]`: история `order_payments`
- `payouts[]`: история `cleaner_payouts` (`payoutPercent`, `baseAmount`, `adjustmentAmount`, `adjustmentReason`, `isManualOverride`)

Response errors:
- `401`, `403`, `404` order, `500`

Database tables:
- `orders` (price + payment_status)
- `order_payments` (select)
- `cleaner_payouts` (select)

Used by pages/components:
- `AdminOrderFinanceCard` на `/app/admin/orders/[id]`

---

### POST /api/admin/orders/[id]/payments

Purpose:
- Добавить запись об оплате по заказу (manual).
- Статус `refunded` хранится как **положительная** сумма в `order_payments.amount`, но в summary вычитается из net paid.
- После вставки пересчитывает net paid и обновляет `orders.payment_status`:
  - `paid` если `netPaidAmount >= orderTotal`
  - `unpaid` если `netPaidAmount <= 0`
  - иначе `card_hold` (в UI показывается как **Partial / pending**)

Auth / Roles:
- Staff/admin/operator

Request body (JSON):
- `amount` (required)
- `method`: `cash` | `card` | `bank_transfer` | `manual` | `other`
- `status`: `pending` | `paid` | `failed` | `refunded`
- `note?`

Response success:
- `201`: `{ data: { finance, payment }, error: null }`

Database tables:
- `order_payments` (insert)
- `orders` (update `payment_status`)

---

### POST /api/admin/orders/[id]/payouts

Purpose:
- Добавить запись о выплате клинеру по заказу.
- Расчёт payout base: `orders.final_price`, fallback `orders.estimated_price`.
- Default `payoutPercent = 50`; admin может override percent, adjustment и manual amount.

Auth / Roles:
- Staff/admin/operator

Request body (JSON):
- `cleanerId` (optional; если пусто, используется `orders.assigned_cleaner_id`)
- `payoutPercent?` (0..100, default `50`)
- `adjustmentAmount?` (может быть `+` или `-`, default `0`)
- `adjustmentReason?`
- `amount?` (manual override, `>= 0`; если не передан — берётся calculated final)
- `status`: `pending` | `paid` | `cancelled`
- `note?`

Response success:
- `201`: `{ data: { finance, payout }, error: null }`

Database tables:
- `orders` (read `final_price`/`estimated_price`, fallback cleaner)
- `cleaner_payouts` (insert: `amount`, `payout_percent`, `base_amount`, `adjustment_amount`, `adjustment_reason`, `is_manual_override`, `note`, `status`)

---

### PATCH /api/admin/orders/[id]/payouts/[payoutId]

Purpose:
- Обновить payout запись (manual payout management block в order detail).

Auth / Roles:
- Staff/admin/operator

Request body (JSON):
- `payoutPercent?` (0..100, default current value)
- `adjustmentAmount?` (может быть `+` или `-`)
- `adjustmentReason?`
- `amount?` (manual override, `>= 0`; если пусто — calculated final)
- `status?`: `pending` | `paid` | `cancelled`
- `note?`

Response success:
- `200`: `{ data: { finance, payout }, error: null }`

---

### DELETE /api/admin/orders/[id]/files/[fileId]

Purpose:
- Удалить файл из Storage и строку `order_files`.

Auth / Roles:
- Staff/admin/operator

Response success:
- `200`: `{ data: { id: string }, error: null }`

Response errors:
- `404` order or file not found
- `500` / `503`

---

### PATCH /api/admin/orders/[id]

Purpose:
- Редактировать заказ из админ-панели: дата/время/цена/адрес/operational notes/детали услуги.
- Обновляет `orders`, `addresses` и detail-таблицу услуги (в зависимости от `orders.service_type`).

Auth:
- Требуется

Roles:
- Staff/admin/operator (проверка роли реализована в route через `profiles.role` + `isStaffApiRole()`)

Request body:
- JSON: `AdminUpdateOrderRequestBody`
  - `scheduled_date?: string` (формат `YYYY-MM-DD`)
  - `scheduled_time?: string` (формат `HH:mm`)
  - `estimated_price?: number`
  - `final_price?: number | null`
  - `payment_status?: string`
  - `customer_comment?: string | null` (сейчас хранится в `addresses.postal_code` как legacy)
  - `internal_note?: string | null` (admin-only, `orders.internal_note`)
  - `serviceDetails?: { type, data } | null`
    - `type` **должен совпадать** с текущим `orders.service_type` (для безопасности)
    - `data` — patch полей услуги (camelCase). Обновляются только переданные ключи.
  - `address?: { city?, street?, house_number?, floor?, doorbell_name? }`

Query params:
- Нет

Response success:
- `200`: `{ data: AdminOrderDetail, error: null }` (заказ заново загружается)

Response errors:
- `400`: Invalid JSON body / ошибка обновления
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Order not found
- `500`: `{ data: null, error: string }`

Database tables:
- `orders` (update)
- `addresses` (update)
- detail-таблица услуги (update по `order_id`)

Used by pages/components:
- Будущий UI “Edit order” в админской детали заказа

---

### PATCH /api/admin/orders/[id]/status

Purpose:
- Обновить статус заказа из админ-панели и записать историю статусов.

Auth:
- Требуется

Roles:
- Staff/admin/operator роли через `requireStaffApiAuth()`

Request body:
- JSON: `UpdateOrderStatusRequestBody`
  - `status: OrderStatus` (обязательно)
  - `comment?: string` (опционально)

Query params:
- Нет

Response success:
- `200`: `{ data: AdminOrderDetail, error: null }` (заказ заново загружается)

Response errors:
- `400`: Invalid JSON body / invalid status value
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Order not found
- `409`: Status is already set to this value
- `500`: `{ data: null, error: string }`

Database tables:
- `orders` (update `status`)
- `order_status_history` (insert)

Used by pages/components:
- Контролы статуса в админской детали заказа

---

### PATCH /api/admin/orders/[id]/assign-cleaner

Purpose:
- Назначить (или переназначить) клинера на заказ.
- Создаёт/обновляет `order_assignments` и заполняет `orders.assigned_cleaner_id`.
- Ставит статус `cleaner_assigned` и пишет историю.

Auth:
- Требуется

Roles:
- Staff/admin/operator роли через `requireStaffApiAuth()`

Request body:
- JSON: `AssignCleanerRequestBody`
  - `cleanerId: string` (обязательно; **должен быть** `profiles.id` клинера)

Query params:
- Нет

Response success:
- `200`: `{ data: AdminOrderDetail, error: null }`

Response errors:
- `400`: Invalid JSON body / missing `cleanerId` / invalid cleaner id / cleaner not found / profile is not a cleaner / cleaner not active
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Order not found
- `409`: Cannot assign a cleaner for the current order status
- `500`: `{ data: null, error: string }`

Database tables:
- `orders` (select для валидации; update `assigned_cleaner_id`, `status`)
- `cleaner_profiles` (проверка `status = active`)
- `order_assignments` (insert/update)
- `order_status_history` (insert)

Used by pages/components:
- UI “Assign cleaner” в админской детали заказа

---

### GET /api/admin/clients

Purpose:
- Список клиентов в админ-панели с фильтрами и расчётом статистики заказов.

Auth:
- Требуется

Roles:
- Staff/admin/operator роли через `requireStaffApiAuth()`

Request body:
- Нет

Query params:
- `search`: string (поиск по name/email/phone)
- `client_type`: `private | business | all` (если `all` или нет параметра — без фильтра)

Response success:
- `200`: `{ data: AdminClient[], error: null }`

Response errors:
- `401`: Unauthorized
- `403`: Forbidden
- `500`: `{ data: null, error: string }`

Database tables:
- `profiles` (role = client; join `client_profiles`)
- `client_profiles` (fallback-ветка загрузки)
- `orders` (статистика: count + last order date)

Used by pages/components:
- Список клиентов админа (карточки + фильтры)

---

### POST /api/admin/clients

Purpose:
- Создать клиента (Supabase Auth user + `profiles` + `client_profiles`).

Auth:
- Требуется

Roles:
- Staff/admin/operator роли через `requireStaffApiAuth()`

Request body:
- JSON: `CreateAdminClientRequestBody`
  - `email: string`
  - `password: string`
  - `fullName: string`
  - `phone: string` (E.164, unique via `phone_normalized`)
  - `clientType: "private" | "business"`
  - `companyName?: string | null`

Query params:
- Нет

Response success:
- `201`: `{ data: AdminClient, error: null }`

Response errors:
- `400`: Invalid JSON body / validation error / ошибка Supabase Auth/DB
- `401`: Unauthorized
- `403`: Forbidden
- `503`: Проблема конфигурации (нет service role key / Supabase URL)
- `500`: Client was not created

Database tables:
- `auth.users` (через `supabase.auth.admin.createUser`)
- `profiles` (upsert)
- `client_profiles` (upsert)

Used by pages/components:
- Форма/диалог “Create client” в админке

---

### GET /api/admin/clients/[id]

Purpose:
- Получить одного клиента по `profiles.id` (для admin/staff detail экранов).

Auth:
- Требуется

Roles:
- Staff/admin/operator роли через `requireStaffApiAuth()`

Request body:
- Нет

Query params:
- Нет

Response success:
- `200`: `{ data: AdminClient, error: null }`

Response errors:
- `400`: Client id is required
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Client not found
- `500`: `{ data: null, error: string }`

Database tables:
- `profiles` / `client_profiles`
- `orders` (для статистики/обогащения)

Used by pages/components:
- Страница деталей клиента в админке (если используется)

---

### POST /api/admin/clients/[id]/send-password-recovery

Purpose:
- Отправить клиенту email для установки/сброса пароля (invite / password recovery).
- Используется как операторский action после auto-create клиента (temporary password не показывается).

Auth:
- Требуется

Roles:
- Staff/admin/operator роли через `requireStaffApiAuth()`

Request body:
- Нет

Query params:
- Нет

Response success:
- `200`: `{ data: { success: true }, error: null }`

Response errors:
- `400`: Invalid client id / Profile is not a client
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Client not found
- `500`: `{ data: null, error: string }`
- `503`: Service role key not configured

Database / Auth:
- `profiles` (role = client, email берётся из `profiles.email`)
- Supabase Auth admin action: `auth.admin.resetPasswordForEmail(profile.email)`

Used by pages/components:
- Кнопка “Send password recovery” на странице details клиента в админке.

---

### GET /api/admin/cleaners

Purpose:
- Список клинеров в админ-панели с фильтрами (и, при необходимости, обогащением avatar URLs).

Auth:
- Требуется

Roles:
- Staff/admin/operator роли через `requireStaffApiAuth()`

Request body:
- Нет

Query params:
- `search`: string (name/email/phone)
- `status`: `active | pending | all`
- `city`: string (substring по `baseCity`)
- `pet_friendly`: `true | false`
- `owns_vacuum`: `true | false`
- `owns_steam_cleaner`: `true | false`
- `accepts_windows`: `true | false`
- `accepts_dry_cleaning`: `true | false`

Response success:
- `200`: `{ data: ActiveCleaner[], error: null }`

Response errors:
- `401`: Unauthorized
- `403`: Forbidden
- `500`: `{ data: null, error: string }`

Database tables:
- `profiles` (role = cleaner; join `cleaner_profiles`)
- `cleaner_profiles` (fallback-ветка загрузки)

Used by pages/components:
- Список клинеров админа (фильтры, выбор клинера для назначения)

---

### POST /api/admin/cleaners

Purpose:
- Создать клинера (Supabase Auth user + `profiles` + `cleaner_profiles`).

Auth:
- Требуется

Roles:
- Staff/admin/operator роли через `requireStaffApiAuth()`

Request body:
- JSON: `CreateAdminCleanerRequestBody`
  - `email: string`
  - `password: string`
  - `fullName: string`
  - `phone: string`
  - `status: "active" | "pending"`
  - `baseCity: string`
  - `workingRadiusKm: number`
  - `petFriendly?: boolean`
  - `ownsVacuum?: boolean`
  - `ownsSteamCleaner?: boolean`
  - `acceptsWindows?: boolean`
  - `acceptsDryCleaning?: boolean`

Query params:
- Нет

Response success:
- `201`: `{ data: ActiveCleaner, error: null }`

Response errors:
- `400`: Invalid JSON body / validation error / ошибка Supabase Auth/DB
- `401`: Unauthorized
- `403`: Forbidden
- `503`: Проблема конфигурации (нет service role key / Supabase URL)
- `500`: Cleaner was not created

Database tables:
- `auth.users` (через `supabase.auth.admin.createUser`)
- `profiles` (upsert)
- `cleaner_profiles` (upsert)

Used by pages/components:
- Форма/диалог “Create cleaner” в админке

---

### POST /api/admin/cleaners/[id]/avatar

Purpose:
- Загрузить/обновить аватар клинера.

Auth:
- Требуется

Roles:
- Staff/admin/operator роли через `requireStaffApiAuth()`

Request body:
- `multipart/form-data`
  - `file`: File (обязательно)

Query params:
- Нет

Response success:
- `200`: `{ data: ActiveCleaner, error: null }` (обновлённый клинер)

Response errors:
- `400`: Invalid form data / file is required / некорректный файл (тип/размер) / invalid cleaner id / cleaner not found / profile is not a cleaner
- `401`: Unauthorized
- `403`: Forbidden
- `503`: Проблема конфигурации (`SUPABASE_SERVICE_ROLE_KEY`)
- `500`: `{ data: null, error: string }`

Database tables:
- `profiles` (avatar_url — зависит от реализации `uploadCleanerAvatar`)
- Supabase Storage bucket/object (деталь реализации)

Used by pages/components:
- UI загрузки аватара в профиле клинера (админка)

---

### GET /api/admin/reviews

Purpose:
- Список отзывов клиентов по завершённым заказам.

Auth / Roles:
- Staff/admin/operator (`requireStaffApiAuth()`)

Response success:
- `200`: `{ data: AdminReviewListItem[], error: null }`

Поля `AdminReviewListItem`:
- `id`, `orderId`, `orderDisplayId`, `clientId`, `clientName`, `clientEmail`
- `cleanerId`, `cleanerName`, `rating` (1–5), `comment`, `createdAt`

Database tables:
- `reviews`, `profiles`, `orders`

Used by pages/components:
- `/app/admin/reviews` — `AdminReviewsList`

---

### GET /api/admin/complaints

Purpose:
- Список жалоб клиентов.

Auth / Roles:
- Staff/admin/operator

Response success:
- `200`: `{ data: AdminComplaintListItem[], error: null }`

Поля `AdminComplaintListItem`:
- `id`, `orderId`, `orderDisplayId`, `clientId`, `clientName`, `clientEmail`
- `status`, `statusLabel`, `reason`, `reasonLabel`, `description`, `adminNote`, `createdAt`, `updatedAt`

Database tables:
- `complaints`, `profiles`, `orders`

Used by pages/components:
- `/app/admin/complaints` — `AdminComplaintsList`

---

### PATCH /api/admin/complaints/[id]

Purpose:
- Обновить статус жалобы и внутреннюю заметку админа.

Auth / Roles:
- Staff/admin/operator

Request body (JSON):
- `status?`: `open` | `in_progress` | `resolved` | `closed`
- `adminNote?`: string | null

Response success:
- `200`: `{ data: AdminComplaintListItem, error: null }`

Response errors:
- `400`: Invalid status / no fields to update
- `404`: Complaint not found

Database tables:
- `complaints` (update `status`, `admin_note`, `updated_at`)

---

## 2. Cleaner API

### GET /api/cleaner/orders

Purpose:
- Получить список заказов, назначенных текущему клинеру.

Auth:
- Требуется

Roles:
- Только cleaner (`profiles.role === "cleaner"`)

Request body:
- Нет

Query params:
- Нет

Response success:
- `200`: `{ data: CleanerOrder[], error: null }`

Response errors:
- `401`: Unauthorized
- `403`: Forbidden
- `500`: `{ data: null, error: string }`

Database tables:
- `orders` (select где `assigned_cleaner_id = currentUserId`)
- `addresses` (join)
- `profiles` (данные клиента через join)

Used by pages/components:
- Страница клинера “My orders”

---

### GET /api/cleaner/orders/[id]

Purpose:
- Детальная информация о заказе для клинера.
- Доступ только если `orders.assigned_cleaner_id === currentUserId`.

Auth:
- Требуется

Roles:
- Только cleaner

Request body:
- Нет

Query params:
- Нет

Response success:
- `200`: `{ data: CleanerOrderDetail, error: null }`

Дополнительные поля `CleanerOrderDetail`:
- `serviceDetails` — нормализованные детали услуги (как в admin detail, без admin-only полей)
- `operationalNotes` — `accessNotes`, `petsInfo`, `suppliesNote`, `equipmentNote` (без `internal_note`, pricing breakdown)

Response errors:
- `401`: Unauthorized
- `403`: Forbidden (заказ не принадлежит этому клинеру)
- `404`: Order not found
- `500`: `{ data: null, error: string }`

Database tables:
- `orders` (select, incl. operational note columns)
- `addresses` (join)
- `profiles` (данные клиента через join)
- `*_details` service table (via `fetchOrderServiceDetails`)

Used by pages/components:
- Страница клинера “Order detail”

---

### PATCH /api/cleaner/orders/[id]/start

Purpose:
- Перевести заказ в `in_progress` (начать уборку).
- Записать историю статусов.

Auth:
- Требуется

Roles:
- Только cleaner; заказ должен принадлежать этому клинеру

Request body:
- Нет

Query params:
- Нет

Response success:
- `200`: `{ data: CleanerOrderDetail, error: null }`

Response errors:
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Order not found
- `409`: Нельзя начать уборку из текущего статуса
- `500`: `{ data: null, error: string }`

Database tables:
- `orders` (update `status = in_progress`)
- `order_status_history` (insert)

Used by pages/components:
- Кнопка “Start” в деталях заказа клинера

---

### PATCH /api/cleaner/orders/[id]/complete

Purpose:
- Завершить уборку: перевести заказ из `in_progress` в `completed`.
- Обновить `order_assignments.status = completed` и `completed_at`.
- Записать историю статусов.

Auth:
- Требуется

Roles:
- Только cleaner; заказ должен принадлежать этому клинеру

Request body:
- Нет

Query params:
- Нет

Response success:
- `200`: `{ data: CleanerOrderDetail, error: null }`

Response errors:
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Order not found
- `409`: Нельзя завершить уборку из текущего статуса
- `500`: `{ data: null, error: string }`

Database tables:
- `orders` (update `status = completed`)
- `order_assignments` (update `status`, `completed_at`)
- `order_status_history` (insert)

Used by pages/components:
- Кнопка “Complete” в деталях заказа клинера

---

### GET /api/cleaner/orders/[id]/files

Purpose:
- Список файлов/фото заказа с **signed URL** (private bucket `order-files`).
- Клинер видит все вложения заказа, назначенного ему.

Auth:
- Требуется

Roles:
- Только `cleaner` (`requireCleanerApiAuth()`)

Access:
- `orders.assigned_cleaner_id === currentUserId` (profiles.id / auth.uid)

Request body:
- Нет

Response success:
- `200`: `{ data: CleanerOrderFile[], error: null }`

Каждый `CleanerOrderFile` — как `AdminOrderFile`, плюс:
- `canDelete: boolean` — `true`, если `uploaded_by === currentUserId`

Response errors:
- `401`: Unauthorized
- `403`: Forbidden (заказ не назначен этому клинеру)
- `404`: Order not found
- `500` / `503`: DB, Storage или отсутствует `SUPABASE_SERVICE_ROLE_KEY`

Database / Storage:
- `order_files` (select)
- Storage bucket `order-files` (signed URLs)

Used by pages/components:
- `CleanerOrderFilesCard` на `/app/cleaner/orders/[id]`

---

### POST /api/cleaner/orders/[id]/files

Purpose:
- Загрузить фото к заказу (клинер).

Auth / Roles:
- Только cleaner; заказ должен быть назначен текущему клинеру

Request:
- `multipart/form-data`
  - `file` (required)
  - `category` (required): `before_photo` | `after_photo` | `damage_photo` | `other`
  - Категория `document` **запрещена**

Validation:
- MIME: `image/jpeg`, `image/png`, `image/webp` (без PDF)
- Max size: 10MB

Storage path:
- `orders/{orderId}/cleaner/{timestamp}-{sanitizedFilename}`

Response success:
- `201`: `{ data: CleanerOrderFile, error: null }` (`canDelete: true`)

Response errors:
- `400` validation
- `403` Forbidden
- `404` order not found
- `500` / `503`

Database / Storage:
- Storage upload + `order_files` insert (`uploaded_by = current user`)

---

### DELETE /api/cleaner/orders/[id]/files/[fileId]

Purpose:
- Удалить файл, загруженный **текущим** клинером.

Auth / Roles:
- Только cleaner; заказ назначен клинеру

Rules:
- `order_files.uploaded_by` должен совпадать с `currentUserId`
- Иначе `403` с сообщением «You can only delete files you uploaded»

Response success:
- `200`: `{ data: { id: string }, error: null }`

Response errors:
- `401`, `403`, `404` (order or file), `500` / `503`

Database / Storage:
- Storage remove + `order_files` delete

Used by pages/components:
- Кнопка удаления в `CleanerOrderFilesCard` (только при `canDelete`)

---

## 3. Client API

### GET /api/client/orders

Purpose:
- Получить список заказов текущего клиента.

Auth:
- Требуется

Roles:
- Только client (`profiles.role === "client"`)

Request body:
- Нет

Query params:
- Нет

Response success:
- `200`: `{ data: ClientOrder[], error: null }`

Response errors:
- `401`: Unauthorized
- `403`: Forbidden
- `500`: `{ data: null, error: string }`

Database tables:
- `orders` (select где `client_id = currentUserId`)
- `addresses` (join)

Used by pages/components:
- Страница клиента “My orders”

---

### GET /api/client/orders/[id]

Purpose:
- Детальная информация о заказе для клиента.
- Доступ только если `orders.client_id === currentUserId`.

Auth:
- Требуется

Roles:
- Только client

Request body:
- Нет

Query params:
- Нет

Response success:
- `200`: `{ data: ClientOrderDetail, error: null }`

Дополнительные поля `ClientOrderDetail` (отзывы/жалобы):
- `canLeaveReview`, `canOpenComplaint` — можно ли отправить сейчас
- `hasReview`, `hasActiveComplaint` — уже отправлено
- `serviceDetails` — детали услуги (m², rooms, extras, package, windows, …)
- `operationalNotes` — публичные заметки (`accessNotes`, `petsInfo`, `suppliesNote`, `equipmentNote`); **без** `internal_note`, margin, payout

Response errors:
- `400`: Order id is required
- `401`: Unauthorized
- `403`: Forbidden (заказ не принадлежит этому клиенту)
- `404`: Order not found
- `500`: `{ data: null, error: string }`

Database tables:
- `orders` (select)
- `addresses` (join)
- `reviews`, `complaints` (проверка существующих записей)

Used by pages/components:
- Страница клиента “Order detail”

---

### POST /api/client/orders/[id]/review

Purpose:
- Оставить отзыв (рейтинг 1–5 и опциональный комментарий) по заказу.

Auth / Roles:
- Только client; `orders.client_id === currentUserId`

Rules:
- Заказ в статусе `completed`
- Один отзыв на заказ (`reviews.order_id` unique)

Request body (JSON):
- `rating`: number (1–5, обязательно)
- `comment?`: string

Response success:
- `201`: `{ data: { review, order }, error: null }`

Response errors:
- `400`: Invalid rating
- `403`: Forbidden
- `404`: Order not found
- `409`: Не completed / отзыв уже существует

Database tables:
- `reviews` (insert: `order_id`, `client_id`, `cleaner_id` из `assigned_cleaner_id`, `rating`, `comment`)

Used by pages/components:
- Форма “Leave a review” в `ClientOrderDetailView`

---

### POST /api/client/orders/[id]/complaint

Purpose:
- Открыть жалобу по заказу.

Auth / Roles:
- Только client; заказ принадлежит клиенту

Rules:
- Статус заказа: `in_progress`, `completed`, или `problem` (если нет open complaint)
- При создании: `orders.status` → `problem` (если ещё не `problem`); `order_status_history` с комментарием `Complaint created: <reason label>`
- Одна **open** жалоба на заказ → `409` если open complaint уже есть

Request body (JSON):
- `reason`: `quality` | `access` | `billing` | `damage` | `other`
- `description`: string (обязательно)

Response success:
- `201`: `{ data: { complaint, order }, error: null }`

Response errors:
- `400`: Invalid reason / description required
- `403`: Forbidden
- `404`: Order not found
- `409`: Статус не позволяет / open complaint уже есть

Database tables:
- `complaints` (insert, `status = open`)
- `orders` (update `status` → `problem` при новой жалобе)
- `order_status_history` (transition → `problem`)

Used by pages/components:
- Форма “Open a complaint” в `ClientOrderDetailView`

---

### PATCH /api/client/orders/[id]/cancel

Purpose:
- Отмена заказа клиентом.
- Применяет политику отмены (fee rules) по времени/статусу/цене.
- Обновляет статус на `cancelled_by_client`.
- Пишет историю статусов с комментарием, содержащим policy summary.

Auth:
- Требуется

Roles:
- Только client; заказ должен принадлежать этому клиенту

Request body:
- Нет

Query params:
- Нет

Response success:
- `200`: `{ data: ClientOrderCancelResult, error: null }`
  - Включает обновлённый `order` и блок `cancellation` (policy, feePercent, feeAmount, message).

Response errors:
- `400`: Order id is required
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Order not found
- `409`: Отмена не разрешена политикой/статусом/окном времени
- `500`: `{ data: null, error: string }`

Database tables:
- `orders` (update `status`)
- `order_status_history` (insert)

Used by pages/components:
- Кнопка “Cancel” в деталях заказа клиента

---

### POST /api/client/orders/[id]/reschedule-request

Purpose:
- Запросить перенос/изменение времени заказа сообщением.
- **Не меняет** статус заказа; записывает внутренний запрос в `order_status_history`.

Auth:
- Требуется

Roles:
- Только client; заказ должен принадлежать этому клиенту

Request body:
- JSON: `ClientRescheduleRequestBody`
  - `message?: string` (по факту обязателен; пустое значение запрещено)

Query params:
- Нет

Response success:
- `200`: `{ data: { ok: true }, error: null }`

Response errors:
- `400`: Invalid JSON body / message missing / failed to submit request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Order not found
- `409`: Перенос недоступен для текущего статуса

Database tables:
- `order_status_history` (insert с `old_status == new_status` и комментарием `[Reschedule request] ...`)

Used by pages/components:
- UI “Request reschedule” в деталях заказа клиента

---

## 4. Auth (кратко)

- Логин: `supabase.auth.signInWithPassword()`
- Роли: `public.profiles.role`

## 5. ID model (кратко)

- `profiles.id = auth.users.id`
- `orders.client_id = profiles.id` клиента
- `orders.assigned_cleaner_id = profiles.id` клинера
- `cleaner_profiles.profile_id = profiles.id`
- `order_assignments.cleaner_id = profiles.id`

## 6. API-first rule

- UI страницы/компоненты должны использовать `/api/*`
- server queries/mutations (`src/server/**`) используются внутри `route.ts`
- Исключений больше нет: создание заказа также реализовано через REST (`POST /api/admin/orders`).

## 7. Order confirmation links (MVP, no email sender)

### POST /api/admin/orders/[id]/confirmation-link

Purpose:
- Сгенерировать confirmation link для клиента вручную (без отправки email).

Auth:
- Требуется (`requireStaffApiAuth()`)

Roles:
- `admin`, `operator`

Response success:
- `201`: `{ data: { confirmationUrl, token, expiresAt }, error: null }`

Rules:
- secure random token (base64url)
- `expires_at = now + 7 days`
- insert в `order_confirmation_tokens`

Response errors:
- `400`, `401`, `403`, `404`, `500`

Database tables:
- `orders` (existence check)
- `order_confirmation_tokens` (insert)

Policy:
- only latest active token valid (regeneration invalidates previous active tokens for the order)

---

### GET /api/admin/orders/[id]/confirmation-link

Purpose:
- Получить latest token state для операционного UI.

Auth:
- Требуется (`requireStaffApiAuth()`)

Roles:
- `admin`, `operator`

Response success:
- `200`: `{ data: LatestToken | null, error: null }`

`LatestToken`:
- `token`
- `createdAt`
- `expiresAt`
- `usedAt`
- `isExpired`
- `confirmationUrl`

If no token:
- `data = null`

Response errors:
- `400`, `401`, `403`, `500`

Database tables:
- `order_confirmation_tokens` (select latest by `created_at desc`)

---

### GET /api/public/order-confirmations/[token]

Purpose:
- Проверить token и вернуть order summary для public confirm page.

Auth:
- Не требуется

Response success:
- `200`: `{ data: { token, expiresAt, usedAt, canConfirm, statusReason, order }, error: null }`

`statusReason`:
- `used` | `expired` | `terminal_order_status` | `null`

Response errors:
- `400`, `404`, `500`

Database tables:
- `order_confirmation_tokens` (select)
- `orders` (join summary)

---

### POST /api/public/order-confirmations/[token]/confirm

Purpose:
- Подтвердить заказ клиентом по token.

Auth:
- Не требуется

Rules:
- token exists, not expired, not used
- order не в terminal status (`completed`, `cancelled_*`, `refunded`, `canceled`)
- при успехе:
  - `order_confirmation_tokens.used_at = now`
  - `orders.status = confirmed`
  - insert в `order_status_history` (best effort)
  - create notifications для `admin`/`operator`

Response success:
- `200`: `{ data: { ok: true, orderId }, error: null }`

Response errors:
- `400`, `404`, `409`, `410`, `500`

Database tables:
- `order_confirmation_tokens` (select/update)
- `orders` (select/update)
- `order_status_history` (insert)
- `notifications` (insert via staff notifications service)

---

### GET /api/admin/cleaners/workload

Purpose:
- Вернуть оперативную загрузку клинера по дате.

Auth:
- Требуется (`admin`, `operator`)

Query:
- `cleaner_id` (required, `profiles.id`)
- `date` (required, `YYYY-MM-DD`)

Response success:
- `200`: `{ data: { workload, availabilityStatus, availabilityNote, isAcceptingOrders, maxDailyHours, maxOrdersPerDay }, error: null }`

`workload`:
- `totalOrders`
- `totalMinutes`
- `totalHours`
- `overlaps`
- `exceedsMaxHours`
- `exceedsMaxOrders`

---

### GET /api/admin/orders/[id]/suggested-cleaners

Purpose:
- Вернуть top recommended cleaners для диспетчера (recommendation-only).

Auth:
- Требуется (`admin`, `operator`)

Response success:
- `200`: `{ data: SuggestedCleanerCandidate[], error: null }`

Candidate includes:
- `cleaner`
- `score`
- `reasons[]`
- `warnings[]`
- `workloadToday`
- `reliability`

Important:
- Endpoint does not assign cleaner automatically.
- Final decision remains with admin/operator.

---

### GET/POST /api/admin/clients/[id]/preferred-cleaners

Purpose:
- Manage preferred cleaners for a client.

GET:
- returns list of preferred cleaners for `client_id`

POST body:
- `cleanerId` (required)
- `isPrimary` (optional, default true)

Behavior:
- upsert by unique `(client_id, cleaner_id)`
- when `isPrimary=true`, other preferred cleaners for this client are demoted (`is_primary=false`)

---

### DELETE /api/admin/clients/[id]/preferred-cleaners/[preferredId]

Purpose:
- Remove preferred cleaner record.

Important:
- preference affects recommendation only; assignment remains manual.

---

### Security / RLS Notes

RLS hardening baseline:
- `supabase/migrations/014_rls_hardening.sql`
- Audit document: `docs/RLS_SECURITY_AUDIT.md`

Model:
- admin/operator manage all operational tables
- client scoped to own orders/payments/reviews/complaints/notifications
- cleaner scoped to assigned orders/payouts/files and own availability read
- `order_confirmation_tokens` is staff-only (no direct public/client SDK table access)

Service-role usage remains backend-only for privileged operations (auth admin, storage/signed URLs, privileged notifications, confirmation-token backend flows).

---

### GET/PATCH /api/admin/cleaners/[id]

Purpose:
- Read/update cleaner operational settings.

PATCH fields:
- `maxDailyHours`
- `maxOrdersPerDay`
- `preferredWorkCities`
- `isAcceptingOrders`

---

### GET/POST /api/admin/cleaners/[id]/availability

Purpose:
- Read/update cleaner availability records.

GET:
- optional `from`, `to` date range

POST body:
- `date`
- `status`: `available` | `unavailable` | `vacation` | `sick` | `preferred_day_off`
- `note` (optional)

Behavior:
- Upsert by unique key `(cleaner_id, date)`


