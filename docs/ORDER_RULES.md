# CatClean — бизнес-логика заказов (Order Rules)

Документ описывает **целевые бизнес-правила** CatClean и то, как они соотносятся с **текущей CRM** (`catclean-crm`).  
Это **только документация** — код по этому файлу не меняется.

**Структура данных заказа** (поля `orders`, `addresses`, detail tables по 7 `service_type`, pricing / cleaner / admin views): **[ORDER_MODEL.md](./ORDER_MODEL.md)**.

**Авторизация и роли (текущее + целевое):** **[AUTH_MODEL.md](./AUTH_MODEL.md)**.

**Связанные сущности в БД:** `orders`, `order_assignments`, `order_status_history`, `profiles`, `cleaner_profiles`, detail tables (`regular_cleaning_details`, …).

**Ключевые поля заказа:**
- `orders.status` — жизненный цикл заказа
- `orders.payment_status` — `unpaid` | `paid` | `card_hold` (в UI: **Partial / pending**; для MVP не блокирует назначение клинера)
- `orders.assigned_cleaner_id` — **всегда `profiles.id`** (не `cleaner_profiles.id`)
- `order_assignments.cleaner_id` — **тоже `profiles.id`**

---

## 1. Order statuses

Полный список статусов в типе `OrderStatus` и админском UI (`src/lib/constants/order-status.ts`).

| Status | Label (UI) | Значение |
|--------|------------|----------|
| `awaiting_confirmation` | Awaiting confirmation | Заказ создан и ожидает подтверждения клиента по confirmation link. |
| `new` | New | Legacy/ручной статус. Новые admin-заказы в CRM стартуют с `awaiting_confirmation`. |
| `waiting_for_payment` | Waiting for payment | Ожидает оплаты клиентом (ссылка, холд, счёт). |
| `paid` | Paid | Оплата получена (или подтверждена оператором), можно искать/назначать клинера. |
| `searching_cleaner` | Searching cleaner | Активный поиск клинера (пул, расписание, ручной подбор). |
| `cleaner_assigned` | Cleaner assigned | Клинер назначен (`assigned_cleaner_id` заполнен). В CRM при назначении статус **автоматически** выставляется в `cleaner_assigned`. |
| `confirmed` | Confirmed | Дата/время и состав услуги подтверждены клиентом и/или оператором; клинер может выехать. |
| `in_progress` | In progress | Уборка начата (клинер нажал Start). Отмена клиентом **не допускается** — только жалоба. |
| `problem` | Problem | Клиент открыл жалобу или admin вручную пометил проблему. Требует разбора staff. |
| `completed` | Completed | Уборка завершена. Отмена **не допускается** — отзыв / жалоба. |
| `cancelled_by_client` | Cancelled by client | Отмена инициирована клиентом (с учётом правил штрафа, см. §7). |
| `cancelled_by_cleaner` | Cancelled by cleaner | Отмена по инициативе клинера (форс-мажор, болезнь и т.д.). |
| `cancelled_by_admin` | Cancelled by admin | Отмена оператором/админом (в т.ч. override штрафов). |
| `refunded` | Refunded | Возврат оформлен (ручной процесс, см. §9). |
| `canceled` | Canceled | Устаревший/алиасный вариант написания; в CRM нормализуется из `cancelled` → `canceled`. |

**Терминальные статусы (дальнейшие переходы только через admin):**  
`completed`, `cancelled_by_*`, `refunded`, `canceled`.

**Статус проблемы (операционный, не терминальный для dashboard):**  
`problem` — попадает в Attention; client cancel/reschedule **запрещены**; отзыв только при `completed`.

**Активные статусы до начала уборки:**  
`new` … `confirmed` (включительно) — допускают отмену клиентом по правилам §7.

---

## 2. Role permissions

Роли в `profiles.role`: `client`, `cleaner`, `admin`, `operator`.  
В API CRM staff = `admin` | `operator` (`requireStaffApiAuth`).

### 2.1 Client (`client`)

| Можно | Нельзя |
|-------|--------|
| Создавать заказ (сайт / будущее приложение) | Назначать клинера |
| Просматривать **свои** заказы | Менять `orders.status` напрямую |
| Отменять заказ до `in_progress` по правилам §7 | Отменять заказ в `in_progress` / `completed` |
| Запрашивать перенос даты/времени (reschedule) | Менять `assigned_cleaner_id` |
| Оставить отзыв после `completed` | Выполнять refund без участия admin |
| Открыть жалобу (complaint) в любой подходящий момент | Видеть заказы других клиентов |
| Оплачивать заказ (внешний платёж / ссылка) | Стартовать/завершать уборку как клинер |

*В CRM реализованы `/app/client`, API `/api/client/orders*` (список, детали, cancel, reschedule-request, review, complaint).*

### 2.2 Cleaner (`cleaner`)

| Можно | Нельзя |
|-------|--------|
| Видеть заказы, где `assigned_cleaner_id = profiles.id` текущего пользователя | Видеть чужие заказы |
| **Start cleaning:** `confirmed` или `cleaner_assigned` → `in_progress` (API `POST /api/cleaner/orders/[id]/start`) | Start из других статусов |
| **Complete cleaning:** `in_progress` → `completed` (API `POST /api/cleaner/orders/[id]/complete`) | Complete не из `in_progress` |
| Просматривать детали назначенного заказа | Назначать себя или других на заказ |
| Сообщить о проблеме на объекте (report problem) — *планируется* | Менять статус заказа вручную (кроме start/complete) |
| Загружать фото до/после — *планируется* | Отменять заказ от имени admin |
| | Менять оплату / refund |

Доступ к API: `requireCleanerApiAuth` — роль строго `cleaner`.

### 2.3 Admin / Operator (`admin`, `operator`)

Права **одинаковые** в CRM API (staff).

| Можно | Нельзя |
|-------|--------|
| Просматривать все заказы | Действовать без авторизации |
| Создавать заказ (`createOrderAction` / admin new order) | Подменять клинера без записи в `order_assignments` / истории |
| Редактировать поля заказа (адрес, услуга, цена, заметки) — *по мере реализации форм* | Использовать `cleaner_profiles.id` в `assigned_cleaner_id` |
| Назначать/переназначать клинера, если `orders.status` в списке §8 | Назначать клинера при `in_progress`, `completed`, отменах, `refunded` |
| Менять `orders.status` вручную (любой допустимый статус из списка §1) | Автоматически списывать refund без ручного процесса (MVP) |
| Отменять заказ → `cancelled_by_admin` (override штрафов §7) | Блокировать назначение из‑за `payment_status = unpaid` (MVP) |
| Обрабатывать жалобы, проблемы, refund позже — *операционный процесс* | |
| Просматривать `payment_status` | |

---

## 3. Status transitions

Таблица: **откуда** → **куда** → **кто может изменить**.

Легенда:
- **CRM** — реализовано и проверяется в коде сейчас
- **Business** — целевое правило продукта (может выполняться через admin вручную, если автомат ещё нет)

| from_status | allowed_to_status | who_can_change | Примечание |
|-------------|-------------------|----------------|------------|
| `awaiting_confirmation` | `confirmed`, `cancelled_by_*`, `cancelled_by_admin` | client (confirmation), admin | CRM + Business |
| `new` | `waiting_for_payment`, `paid`, `searching_cleaner`, `cancelled_by_*`, `cancelled_by_admin` | client (оплата/отмена), admin | Business |
| `waiting_for_payment` | `paid`, `cancelled_by_client`, `cancelled_by_admin` | client, admin | Business |
| `paid` | `searching_cleaner`, `cleaner_assigned`, `cancelled_by_*`, admin statuses | admin | Назначение → `cleaner_assigned` (**CRM**) |
| `searching_cleaner` | `cleaner_assigned`, `cancelled_by_*` | admin | **CRM** assign |
| `cleaner_assigned` | `confirmed`, `in_progress`, `cancelled_by_*` | admin, cleaner | **CRM:** cleaner → `in_progress` (start) |
| `confirmed` | `in_progress`, `cancelled_by_*` | cleaner, admin | **CRM:** cleaner → `in_progress` (start) |
| `in_progress` | `completed`, `problem`, `cancelled_by_cleaner`, `cancelled_by_admin` | cleaner, admin, client (complaint) | **CRM:** cleaner → `completed` (complete). Client cancel **запрещён** |
| `in_progress`, `completed` | `problem` | client (complaint), admin | **CRM:** `POST /api/client/orders/[id]/complaint` → `problem` + `order_status_history` |
| `problem` | `completed`, `in_progress`, `refunded`, `cancelled_by_admin`, … | admin | **CRM:** `PATCH .../status` (ручной override) |
| `completed` | `problem`, `refunded` | client (complaint), admin | Complaint → `problem` (**CRM**) |
| `completed` | `refunded` | admin | Refund manual MVP |
| `cancelled_by_client` | `refunded` | admin | При необходимости возврата |
| `cancelled_by_cleaner` | `searching_cleaner`, `cleaner_assigned`, `cancelled_by_admin` | admin | Переназначение / отмена |
| `cancelled_by_admin` | `refunded`, `new` (reopen) | admin | Reopen — по политике оператора |
| `refunded` | — | — | Терминальный |
| *любой (кроме terminal)* | *любой из §1* | admin | **CRM:** `updateAdminOrderStatus` без whitelist переходов — **полный override** |

**Автоматические переходы в CRM:**

| Действие | from (типично) | to | who |
|----------|----------------|-----|-----|
| Assign cleaner | `new`, `waiting_for_payment`, `paid`, `searching_cleaner`, `cleaner_assigned`, `confirmed` | `cleaner_assigned` | admin/operator |
| Start cleaning | `confirmed`, `cleaner_assigned` | `in_progress` | cleaner |
| Complete cleaning | `in_progress` | `completed` | cleaner |
| Open complaint | `in_progress`, `completed`, `problem`* | `problem` | client |

\* Если заказ уже `problem` без open complaint (например, admin выставил вручную), client может открыть жалобу без повторной смены статуса.

История фиксируется в `order_status_history` (`recordOrderStatusHistory`).

---

## 4. Client actions

| Действие | Условия | Результат | Статус в CRM |
|----------|---------|-----------|--------------|
| **Cancel order** | До `scheduled_start` по правилам §7; не в `in_progress` / `completed` | `cancelled_by_client` + расчёт штрафа | **CRM:** `PATCH /api/client/orders/[id]/cancel` |
| **Request reschedule** | Заказ не в terminal; не в `in_progress` | Заявка в `order_status_history` (статус не меняется) | **CRM:** `POST /api/client/orders/[id]/reschedule-request` |
| **Leave review** | Только `completed` | Отзыв привязан к заказу/клинеру | Business |
| **Open complaint** | `in_progress`, `completed`, `problem` (без open complaint); одна open жалоба на заказ | `problem` + запись в `order_status_history` (`Complaint created: …`) | **CRM:** `POST /api/client/orders/[id]/complaint` |

---

## 5. Cleaner actions

| Действие | Условия | Результат | Статус в CRM |
|----------|---------|-----------|--------------|
| **Start cleaning** | `assigned_cleaner_id` = текущий `profiles.id`; status ∈ `confirmed`, `cleaner_assigned` | `in_progress` | **Реализовано** |
| **Complete cleaning** | Тот же клинер; status = `in_progress` | `completed`, `order_assignments.completed_at` | **Реализовано** |
| **Report problem** | Назначен на заказ | Уведомление admin, заметка/флаг (без смены статуса или → `cancelled_by_cleaner` по решению admin) | Планируется |
| **Upload before/after photos** | Обычно `in_progress` или сразу после `completed` | Файлы в storage, привязка к заказу | Планируется |

---

## 6. Admin actions

| Действие | Описание | CRM |
|----------|----------|-----|
| **Create order** | Ручное создание; **sqm-first** auto-pricing для regular/move/office; manual override цены. Стартовый статус `awaiting_confirmation` | Да (`POST /api/admin/orders`) |
| **Generate confirmation link** | Генерирует public token URL для клиента (no email sender в MVP). Политика: только latest active token valid | Да (`GET/POST /api/admin/orders/[id]/confirmation-link`) |
| **Edit order** | Адрес, услуга, цена, клиент, заметки, дата/время | Частично (формы admin) |
| **Assign cleaner** | Выбор активного клинера; запись в `order_assignments` + `assigned_cleaner_id` | Да (`PATCH .../assign-cleaner`) |
| **Change status** | Ручной выбор любого статуса из списка §1 + комментарий в историю | Да (`PATCH .../status`) |
| **Cancel order** | → `cancelled_by_admin`; может игнорировать штрафы §7 | Через change status |
| **Handle problem / refund** | Вне автоматики MVP: заметки, `refunded`, связь с платёжкой | Ручной процесс |

---

## 7. Cancellation rules (MVP)

Расчёт от **`scheduled_start`** (дата + время начала уборки в заказе).

| Время до `scheduled_start` | Отмена клиентом | Штраф |
|----------------------------|-----------------|-------|
| **> 24 часов** | Разрешена | **0%** (бесплатная отмена) |
| **12–24 часа** | Разрешена | **50%** от суммы заказа |
| **< 12 часов** | Разрешена | **100%** (полная стоимость) |
| **`in_progress` или `completed`** | **Запрещена** | Только **complaint** / разбор admin |
| Любой случай | **Admin override** | Admin может выставить `cancelled_by_admin` и скорректировать штраф/refund вручную |

Клиентский UI должен показывать предупреждение о штрафе до подтверждения отмены.  
Автоматическое удержание средств в MVP **не обязательно** — достаточно фиксации правила и ручного refund (§9).

---

## 8. Assignment rules

1. **`payment_status` не блокирует назначение (MVP).**  
   Проверяется только `orders.status` (`canAssignCleanerToOrder` / `canAssignCleanerForOrder` — `payment_status` игнорируется).

2. **Назначение разрешено**, если статус ∈  
   `new`, `waiting_for_payment`, `paid`, `searching_cleaner`, `cleaner_assigned`, `confirmed`.

3. **Назначение запрещено**, если статус ∈  
   `in_progress`, `completed`, `cancelled_by_client`, `cancelled_by_cleaner`, `cancelled_by_admin`, `refunded`, `canceled` / `cancelled`.

4. **Клинер должен быть active** (`cleaner_profiles.status = active`).

5. **Идентификаторы:**
   - `orders.assigned_cleaner_id` = **`profiles.id`**
   - `order_assignments.cleaner_id` = **`profiles.id`**
   - Если в UI/API передан `cleaner_profiles.id`, CRM **резолвит** в `profiles.id` (`resolveCleanerProfileId`).

6. При успешном назначении в CRM:
   - upsert `order_assignments` (status `accepted`)
   - `orders.assigned_cleaner_id` = `profiles.id`
   - `orders.status` → **`cleaner_assigned`** (даже если до этого был `paid` / `searching_cleaner`)

7. Клинер видит заказ в кабинете только если `assigned_cleaner_id` совпадает с его `profiles.id`.
8. Availability/workload policy (warning-only):
   - При назначении CRM показывает предупреждения, если клинер:
     - перегружен по `max_daily_hours` / `max_orders_per_day`
     - имеет пересечения по времени
     - имеет availability status `vacation` / `sick` / `unavailable`
     - `is_accepting_orders = false`
   - Назначение не блокируется автоматически (диспетчер может override решением).

---

## 9. Payment rules (MVP)

| `payment_status` | Значение |
|----------------|----------|
| `unpaid` | Не оплачен |
| `paid` | Оплачен |
| `card_hold` | Частично оплачен / pending (технический status key) |

**Правила MVP:**

- Статус оплаты **отображается** в admin UI и в debug assign-форме.
- **Не блокирует** назначение клинера (§8).
- Для ledger `order_payments`: `status = refunded` уменьшает **net paid** (`netPaid = paid - refunded`).
- **Refund** — только **вручную** admin/operator: запись `order_payments` со `status=refunded` + операционная связь с платёжным провайдером вне CRM.
- Default cleaner payout percent: **50%**.
- Payout base: `orders.final_price`, fallback `orders.estimated_price`.
- Admin/operator может вручную override payout percent, adjustment amount и final payout amount.
- Payout management в MVP полностью manual (add/update/cancel payout rows внутри order finance block).
- Автоматические webhooks оплаты и авто-переход `waiting_for_payment` → `paid` — **вне scope MVP CRM** (могут быть на сайте).

---

## 10. Соответствие коду CRM (справочно)

### API-first (страницы → fetch)

| UI | API |
|----|-----|
| `/app/admin/orders` | `GET /api/admin/orders` |
| `/app/admin/orders/[id]` | `GET /api/admin/orders/[id]` |
| Assign / status (detail) | `PATCH /api/admin/orders/[id]/assign-cleaner`, `PATCH /api/admin/orders/[id]/status` |
| `/app/admin/clients` | `GET /api/admin/clients` |
| `/app/admin/cleaners` | `GET /api/admin/cleaners` |
| `/app/cleaner` | `GET /api/cleaner/orders` |
| `/app/cleaner/orders/[id]` | `GET /api/cleaner/orders/[id]`, start/complete |
| `/app/client` | `GET /api/client/orders` |
| `/app/client/orders/[id]` | `GET /api/client/orders/[id]`, cancel, reschedule |

**Исключение:** создание заказа admin — `createOrderAction` (Server Action), не REST. `orders.client_id` берётся из `profiles.id` по email клиента (`role = client`).

### ID-модель (обязательно)

| Поле | Значение |
|------|----------|
| `orders.client_id` | `profiles.id` клиента |
| `orders.assigned_cleaner_id` | `profiles.id` клинера |
| `order_assignments.cleaner_id` | `profiles.id` клинера |
| `cleaner_profiles.profile_id` | `profiles.id` клинера |

При назначении API принимает `profiles.id`; при ошибочной передаче `cleaner_profiles.id` — резолв в `profiles.id` (`resolveCleanerProfileId`).

### Статусы и история

- В коде используется **`completed`**, не `done`. Алиас `done` → `completed` в `order-status.utils.ts`.
- `order_status_history`: `old_status` / `new_status` нормализуются через `normalizeOrderStatus` перед записью.
- Reschedule request: запись в историю с **тем же** `old_status` и `new_status` + комментарий `[Reschedule request] …` (`recordOrderClientRequest`).

### Ключевые модули

| Правило | Файл / API |
|---------|------------|
| Список статусов | `src/lib/constants/order-status.ts`, `src/entities/order/order.types.ts` |
| Отмена клиентом §7 | `src/lib/orders/client-cancellation.ts`, `cancelClientOrder.ts` |
| Назначение клинера | `can-assign-cleaner.ts`, `assignAdminOrderCleaner.ts`, `PATCH /api/admin/orders/[id]/assign-cleaner` |
| Start / Complete | `startCleanerOrder.ts`, `completeCleanerOrder.ts`, `PATCH /api/cleaner/orders/[id]/start\|complete` |
| Ручная смена статуса | `updateAdminOrderStatus.ts`, `PATCH /api/admin/orders/[id]/status` |
| Auth | `requireStaffApiAuth`, `requireCleanerApiAuth`, `requireClientApiAuth` |

### Логирование

Отладочные `console.info` — только в `NODE_ENV=development` (`src/lib/dev-log.ts`). `console.error` / `console.warn` — для реальных сбоев.

---

## 11. Вне scope этого документа

- RLS Supabase и политики на уровне БД  
- Схема полей заказа и detail tables — см. [ORDER_MODEL.md](./ORDER_MODEL.md)  
- SLA уведомлений (SMS/email)  
- Интеграция платёжного шлюза  
- Email/SMS отправка confirmation links (в MVP подтверждение делается вручную ссылкой)  

При расхождении между продуктовой политикой и поведением CRM приоритет для **операций в CRM** — реализация в таблице §10; для **клиентского сайта** — §4–§7.

*Версия: MVP CatClean CRM. Дата актуализации: 2026-05-21 (QA pass).*
