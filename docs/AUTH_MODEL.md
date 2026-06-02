# CatClean CRM — модель авторизации (Auth Model)

**Статус:** целевая спецификация + **phone infrastructure** (нормализация в коде, без Phone OTP login). `/login` UI подготовлен под tabs (**Staff login** + **Phone login coming soon**), но реальная auth-логика пока прежняя (email + password).

**Цель документа:** зафиксировать, как CatClean CRM должна аутентифицировать staff, клиентов и клинеров **до** отдельной задачи на миграцию auth. Документ практический: что есть сейчас, куда идём, какие шаги и риски.

**Связанные документы:**

- [API_MAP.md](./API_MAP.md) — REST endpoints, проверки ролей, текущий create order / send-password-recovery
- [ORDER_RULES.md](./ORDER_RULES.md) — права ролей на заказы (client / cleaner / staff)
- [ORDER_MODEL.md](./ORDER_MODEL.md) — поля клиента в заказе (email, phone на форме)
- [TELEGRAM_BOT_PLAN.md](./TELEGRAM_BOT_PLAN.md) — Telegram как **операционный** канал для клинера (не замена auth)

---

## 1. Принципы

| Принцип | Описание |
|---------|----------|
| **Один auth user = один `profiles.id`** | `profiles.id` всегда равен `auth.users.id` (как сейчас в CRM). |
| **Роль в приложении** | `profiles.role`: `client` \| `cleaner` \| `admin` \| `operator`. |
| **Разные способы входа по роли** | Staff — email + password. Client и cleaner (web) — phone OTP. |
| **Phone — operational + auth для client/cleaner** | E.164, уникальный; без телефона нет входа по OTP. |
| **Смена телефона — только staff** | Client/cleaner не меняют `phone` сами; только admin action. |
| **Service role только на сервере** | Создание пользователей, invite/recovery, admin-only операции — never в браузере. |

---

## 2. Текущая модель (as-is в `catclean-crm`)

### 2.1 Supabase Auth

- **Провайдер:** Supabase Auth, email + password.
- **Сессия:** cookies через `@supabase/ssr` (`createSupabaseServerClient`, middleware `updateSession`).
- **Login UI:** `/login` — 2 вкладки: **Staff login** (рабочая email/password форма) и **Phone login** (disabled "coming soon", без OTP API).
- **Роутинг после входа:** `/app` читает `profiles.role` и редиректит на `/app/admin`, `/app/cleaner` или `/app/client`.

### 2.2 Роли и доступ к API

| Роль | UI | API guard |
|------|-----|-----------|
| `admin`, `operator` | `/app/admin/*` | `requireStaffApiAuth()` |
| `cleaner` | `/app/cleaner/*` | `requireCleanerApiAuth()` |
| `client` | `/app/client/*` | `requireClientApiAuth()` |

Подробности: [API_MAP.md](./API_MAP.md) §0 (Auth & roles).

### 2.3 Создание клиентов сегодня

| Сценарий | Поведение |
|----------|-----------|
| **Admin → Create client** | `POST /api/admin/clients` — Auth user + `profiles` + `client_profiles`, пароль задаёт admin. |
| **Admin → Create order** | `POST /api/admin/orders` — если клиента нет по email, **auto-create** через service role: Auth user + email + **temporary password** (не показывается) + `profiles` + `client_profiles`. |
| **Invite / recovery** | `POST /api/admin/clients/[id]/send-password-recovery` — письмо со ссылкой сброса пароля на `profiles.email`. |

**Ограничения текущей модели (login):**

- Client и cleaner **не могут** войти без пароля (нужен email + password или recovery link).
- Auto-created client привязан к **email**; temporary password + recovery email.

### 2.4 Phone infrastructure (реализовано, migration 008)

Подготовка к phone-first auth **без** включения Supabase Phone OTP:

| Компонент | Путь / таблица |
|-----------|----------------|
| Нормализация | `src/lib/phone/normalize-phone.ts` — `normalizePhone()`, `isValidPhone()` |
| Валидация профиля | `src/lib/phone/profile-phone.ts` — E.164, duplicate check |
| БД | `profiles.phone` (legacy, сохраняется) + **`profiles.phone_normalized`** (E.164, unique where not null) |
| Миграция | `supabase/migrations/008_phone_normalization.sql` |
| Backfill script | `npm run normalize:phones` → `scripts/normalize-existing-phones.ts` |
| Create flows | `createAdminClient`, `createAdminCleaner`, `createAdminOrder` (auto-client) — пишут оба поля |
| Resolve client | При create order: поиск клиента **сначала по `phone_normalized`**, затем по email |
| Update (готово к API) | `src/server/mutations/profiles/updateProfilePhone.ts` |

**E.164 policy (MVP):** Germany-focused; `0178…` → `+49178…`, `0049…` → `+49…`. Invalid → validation error на create.

**Unique phone:** partial unique index `profiles_phone_normalized_unique_idx`. Duplicate → `400` с сообщением «A profile with this phone number already exists».

---

## 3. Целевая модель по ролям

### 3.1 Admin / Operator (staff)

| Аспект | Целевое поведение |
|--------|-------------------|
| **Вход** | Email + password (как сейчас). |
| **Маршрут** | `/app/admin` (и staff API). |
| **Phone** | Контактный номер в `profiles.phone` (опционально для staff). **Не** используется для входа staff. |
| **Создание staff** | Отдельный admin flow (вне scope client OTP); по-прежнему email + password. |

Staff не переходят на phone OTP — это снижает риск путаницы ролей и упрощает ops (один привычный login для офиса).

### 3.2 Client

| Аспект | Целевое поведение |
|--------|-------------------|
| **Вход** | **Phone OTP** (SMS), без пароля. |
| **Primary identifier** | `profiles.phone_normalized` (E.164, напр. `+491781623227`); `profiles.phone` дублирует E.164 в новых записях. |
| **Уникальность** | Один номер → один profile (`phone_normalized` unique index). |
| **Email** | **Optional** — для чеков, счетов, переписки; **не** обязателен для auth. |
| **Доступ** | Только свои заказы (`orders.client_id = profiles.id`), см. [ORDER_RULES.md](./ORDER_RULES.md) §2.1. |
| **Смена phone** | Только admin/operator (см. §4). |

### 3.3 Cleaner

| Аспект | Целевое поведение |
|--------|-------------------|
| **Web cabinet** | Вход через **phone OTP** (как client, отдельный UI flow после verify). |
| **Phone** | Operational contact + auth для web; E.164, уникальный. |
| **Telegram** | Отдельный канал уведомлений/действий ([TELEGRAM_BOT_PLAN.md](./TELEGRAM_BOT_PLAN.md)); **не заменяет** полностью Supabase session для web/API, пока не спроектирована явная привязка `telegram_user_id` → `profiles.id`. |
| **Смена phone** | Только admin/operator. |

---

## 4. Правила для телефона (phone rules)

### 4.1 Формат и хранение

- В БД и в API — **только E.164**: `+` + country code + national number, без пробелов/скобок.
- Примеры: `+491781623227`, `+491701234567`.
- В UI допускается ввод «человеческого» формата; перед сохранением — **`normalizePhone()`** (см. §6).

**Германия (MVP-рынок):**

- Страна по умолчанию при нормализации: `DE` (+49).
- Локальные форматы `0178…`, `0049…`, `49 178 …` приводятся к E.164.
- Валидация: длина и префикс после нормализации; отклонять явно невалидные номера на create/update.

### 4.2 Уникальность и обязательность

| Правило | Client | Cleaner | Staff |
|---------|--------|---------|-------|
| Unique `profiles.phone` | Да (для role client) | Да (для role cleaner) | Нет (или optional unique — не требуется для MVP) |
| Обязателен для OTP login | Да | Да | N/A (staff не логинится по phone) |
| Нет phone → OTP login | **Запрещён** | **Запрещён** | — |

Рекомендация схемы: **partial unique index** на `profiles(phone)` WHERE `phone IS NOT NULL` AND `role IN ('client','cleaner')`, либо отдельные проверки в приложении + unique на уровне БД для всех non-null phone (проще, но staff phone тоже должен быть unique если заполнен).

### 4.3 Кто может менять phone

| Действие | Client | Cleaner | Admin/operator |
|----------|--------|---------|----------------|
| Изменить свой phone в UI | **Нет** | **Нет** | — |
| Изменить phone клиента/клинера | — | — | **Да** (отдельный admin action + audit log позже) |
| При смене | — | — | Проверить unique; при необходимости обновить `auth.users.phone` в Supabase Auth |

**Почему client/cleaner не меняют сами:** phone = фактор входа; self-service смена без верификации владения номера = риск account takeover.

### 4.4 Admin action: смена телефона (целевое)

Планируемый endpoint (не реализован):

- `PATCH /api/admin/clients/[id]/phone` (и аналог для cleaners)
- Body: `{ phone: string }` → normalize → unique check → update `profiles` + sync Auth user phone

До реализации: смена через Supabase Dashboard + ручное обновление `profiles` (не для production ops).

---

## 5. Auto-created clients при создании заказа

### 5.1 Текущее поведение (код)

См. [API_MAP.md](./API_MAP.md) — `POST /api/admin/orders`:

- Admin вводит **email, name, phone** (и остальные поля заказа).
- Поиск клиента по **email**; если нет — auto-create Auth user с **temporary password** + `profiles` + `client_profiles`.
- Recovery: `POST /api/admin/clients/[id]/send-password-recovery`.

### 5.2 Целевое поведение

| Шаг | Поведение |
|-----|-----------|
| 1 | Admin вводит **phone** (обязательно) и **email** (опционально) на create order. |
| 2 | Поиск client: сначала по **normalized phone**, затем по email (если указан). |
| 3 | Если не найден — создать Auth user **с phone** (Supabase Phone provider), `email_confirm` не обязателен. |
| 4 | `profiles`: `role=client`, `phone` E.164, `email` nullable. |
| 5 | `client_profiles`: `client_type=private` по умолчанию. |
| 6 | **Не** полагаться на temporary password как основной доступ. |
| 7 | После создания заказа admin может отправить клиенту **SMS OTP invite** или инструкцию «войдите по номеру на /login» (продуктовое решение). |

**Primary identifier для client:** `phone`, не email.

**Доступ в кабинет:** client заходит на `/login` → вкладка «Client» → вводит phone → OTP.

---

## 6. Technical plan (переход)

Порядок работ — отдельная **auth migration** задача после проверки настроек Supabase.

### 6.1 Supabase Dashboard

1. **Enable Phone Auth** в Authentication → Providers.
2. Подключить **SMS provider** (Twilio, MessageBird, Vonage и т.д. — по выбору CatClean).
3. Настроить **Site URL** и redirect URLs для OTP callback (если используется magic link flow).
4. Проверить лимиты, стоимость SMS, sandbox для DE номеров.
5. Убедиться, что **service role** остаётся только на сервере (`.env.local`, не `NEXT_PUBLIC_*`).

### 6.2 Database / `profiles`

1. Миграция: `profiles.phone` — комментарий E.164; **unique** (partial или full — см. §4.2).
2. Backfill: нормализовать существующие `phone` где возможно; пометить дубликаты для ручного разбора.
3. Опционально: `profiles.email` nullable для `role=client` (если сейчас NOT NULL — ослабить constraint).

### 6.3 Shared helper

**Реализовано:** `src/lib/phone/normalize-phone.ts`, `src/lib/phone/profile-phone.ts`.

- Input: raw string (формы admin)
- Output: E.164 в `phone` + `phone_normalized`
- Использовать в: create order, create client/cleaner, будущий OTP start, admin phone update

### 6.4 Server: create / resolve client

Обновить (в отдельной задаче):

- `createAdminOrder` — `ensureClientProfileId` ищет по phone, создаёт Auth user с phone.
- `createAdminClient` — опция «без пароля», phone required.
- Убрать зависимость от temporary password для **новых** clients (legacy users — см. §7).

### 6.5 Login UI

Разделить `/login`:

| Вкладка / route | Поля | API |
|-----------------|------|-----|
| **Staff** | email + password | `signInWithPassword` (как сейчас) |
| **Client / Cleaner** | phone → OTP code | см. §6.6 |

После OTP: тот же `/app` redirect по `profiles.role`.

Опционально: `/login/staff` и `/login/client` для ясности URL.

Текущее состояние: tabs уже внедрены в UI, но вкладка Phone intentionally disabled. Это подготовка интерфейса; `supabase.auth.signInWithOtp` и `verifyOtp` пока **не подключены**.

### 6.6 Phone OTP API vs client SDK

**Вариант A — Supabase client SDK в браузере (предпочтительно для MVP):**

```ts
// start
supabase.auth.signInWithOtp({ phone: '+49...' })
// verify
supabase.auth.verifyOtp({ phone, token, type: 'sms' })
```

- Плюсы: меньше своего кода, официальный flow.
- Минусы: rate limits на клиенте; нужен корректный RLS и не светить лишнее.

**Вариант B — собственные API routes:**

- `POST /api/auth/phone/start` — body `{ phone }` → normalize → server вызывает Admin API или проксирует OTP (если нужен rate limit / logging).
- `POST /api/auth/phone/verify` — body `{ phone, code }` → session cookie.

Выбор: начать с **варианта A**; вынести в API только если нужны централизованные лимиты, аудит или скрытие provider keys.

Документировать в [API_MAP.md](./API_MAP.md) после реализации.

### 6.7 Staff flows (без изменений по сути)

- Staff login остаётся email/password.
- `send-password-recovery` остаётся для staff и для **legacy clients** с email/password до полной миграции.

### 6.8 Existing users fallback

| Когорта | Fallback |
|---------|----------|
| Client с email/password, без нормального phone | Вход по email/password до дедлайна; admin дополняет phone; затем только OTP |
| Client с phone в профиле, но Auth без phone | Admin action: link phone в Auth + profile |
| Duplicate phones в данных | Ручной merge в admin (один profile остаётся) |
| Cleaner только email | Аналогично client |

Рекомендация: feature flag `AUTH_PHONE_OTP_ENABLED` — включать поэтапно.

---

## 7. Migration risks

| Риск | Описание | Митигация |
|------|----------|-----------|
| **Existing email/password users** | Клиенты уже созданы через auto-create + recovery email. | Период dual login; коммуникация; admin заполняет phone. |
| **Duplicate phone numbers** | В `profiles` могут быть дубли до unique constraint. | Скрипт аудита до миграции; ручное слияние. |
| **Invalid phone formats** | `+49…`, `0178…`, пустые строки. | `normalizePhone` + отчёт non-normalizable rows. |
| **SMS cost and limits** | OTP на каждый login; злоупотребление start endpoint. | Rate limit per phone/IP; captcha позже; мониторинг provider billing. |
| **Users without phone** | Не смогут войти по OTP. | Блокировать create client/order без phone; backfill перед cutover. |
| **Phone ownership verification** | OTP доказывает владение только в момент входа; смена номера — только admin. | Admin SOP; позже audit log на смену phone. |
| **German formatting** | Локальные форматы без country code. | Default region DE в normalizer; тест-кейсы в CI. |
| **Auth user / profile drift** | Auth user есть, profile нет (или наоборот). | `ensureClientProfileId` уже чинит часть кейсов; расширить на phone lookup. |
| **Supabase phone + email on same user** | Один user с двумя идентификаторами. | Политика: client primary = phone; email как metadata. |
| **RLS и session** | Новый login path не должен обходить `client_id` checks. | Без изменений правил в [ORDER_RULES.md](./ORDER_RULES.md); тесты API. |

---

## 8. MVP recommendation (сейчас)

**Не менять код auth в текущей итерации.**

Сделано / делаем сейчас:

1. **Этот документ** (`AUTH_MODEL.md`) — согласовать с командой.
2. **Проверить Supabase:** Phone provider, SMS, тестовый OTP на staging, цены.
3. **Аудит данных:** выгрузка `profiles` (role, phone, email); список дублей и пустых phone у clients.
4. **Отдельный тикет:** «Auth migration — phone OTP» с чеклистом из §6.

До миграции **продолжать использовать:**

- Auto-create client при create order (email + temp password).
- `POST /api/admin/clients/[id]/send-password-recovery` для выдачи доступа.

Не удалять email/password для clients, пока не включён phone OTP и не заполнены телефоны.

---

## 9. Сводная таблица: текущее vs целевое

| | Сейчас | Целевое |
|---|--------|---------|
| Staff login | Email + password | Email + password |
| Client login | Email + password (или recovery) | Phone OTP |
| Cleaner web login | Email + password | Phone OTP |
| Client primary id | Email (поиск при create order) | Phone (E.164) |
| Client email | Обязателен на формах | Optional |
| Auto-create client | Auth + temp password | Auth + phone, без пароля |
| Phone unique | Нет | Да (client/cleaner) |
| Смена phone | Не регламентировано | Admin only |
| Telegram (cleaner) | Нет | Ops channel, не full auth replacement |

---

## 10. Чеклист для разработчика (перед стартом кода)

- [ ] Supabase Phone Auth включён на staging
- [ ] SMS provider протестирован на DE номере
- [ ] Согласован `normalizePhone` (библиотека + default country)
- [ ] Миграция unique на `profiles.phone` + скрипт дедупа
- [ ] Решение: SDK vs `/api/auth/phone/*`
- [ ] Дизайн `/login` (staff vs client/cleaner)
- [ ] Обновлены [API_MAP.md](./API_MAP.md) и [ORDER_RULES.md](./ORDER_RULES.md) после реализации
- [ ] План fallback для legacy email clients
- [ ] Оценка SMS budget и rate limits

---

*Документ создан для фиксации целевой auth-модели. При изменении кода auth обновлять этот файл и [API_MAP.md](./API_MAP.md).*
