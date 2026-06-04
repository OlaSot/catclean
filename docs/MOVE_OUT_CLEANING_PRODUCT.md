# CatClean — Move Out Cleaning (продуктовая модель)

Документ фиксирует **продуктовую модель Move In / Move Out Cleaning** перед разработкой публичного wizard и доработкой pricing.

**Связанные документы:** [ORDER_MODEL.md](./ORDER_MODEL.md) (поля БД), [API_MAP.md](./API_MAP.md) (`POST /api/public/bookings`).

**Код по этому файлу не меняется** — только спецификация продукта, UX и интеграции с CRM.

---

## Решение по пакетам (MVP)

Для MVP используются **два пакета**:

| Пакет | Назначение |
|-------|------------|
| **Standard** | Обычные квартиры в нормальном состоянии перед передачей |
| **Premium** | Сложные случаи: сильный налёт, жир, больше времени, интенсивнее кухня/ванная |

**Basic не используется** как отдельный пакет — чтобы не создавать у клиента ожидание «минимальной» уборки, которая по факту не соответствует move-out scope.

**Слоган (DE, для сайта и wizard):**

> **Standard für normale Wohnungen – Premium für alles, was darüber hinausgeht.**

---

## 1. Pricing model

| Параметр | Значение |
|----------|----------|
| База расчёта | Цена **по m²** (`property_size_m2`) |
| Минимальная площадь | **30 m²** (квартира) |
| Минимальная длительность | **~3 часа** (ориентир для планирования и клинера) |
| Standard rate | **TBD** (€/m² или фикс. минимум + m²) |
| Premium rate | **TBD** (множитель или отдельная €/m²) |

Дополнительные надбавки (окна, балкон, пустая квартира, strong limescale / heavy grease при Standard) — уточняются в pricing engine на этапе реализации wizard; в MVP wizard должен **собирать флаги**, даже если часть надбавок включена в Premium по умолчанию.

---

## 2. Standard package

**Для кого:** обычные квартиры в **нормальном** состоянии перед передачей ключей (move-out / move-in handover).

### Входит в Standard

**Общие помещения**

- Пылесос **всегда**
- Мытьё полов **без** снятия старой краски / въевшихся пятен
- Все **доступные** поверхности
- Подоконники
- Ручки дверей, выключатели, розетки

**Кухня** (глубже, чем Home Care)

- Столешницы
- Раковина
- Смеситель
- **Снаружи** шкафов
- **Снаружи** плиты
- **Внутри** пустых шкафов
- Полки **внутри**, если пустые

**Ванная / санузел**

- Унитаз
- Раковина
- Ванна / душ
- Смесители
- Зона душа
- Плитка в зонах контакта с водой
- **Обычный** известковый налёт (см. §3)

**Дополнительно**

- Холодильник **внутри**
- Духовка **внутри**
- Вынос мусора (в рамках обычного объёма на объекте)
- Финальная **визуальная** проверка

---

## 3. Standard — пояснение по известковому налёту (Kalk)

Текст для клиента (DE), wizard и подтверждения заказа:

> **Im Standard-Paket entfernen wir übliche Kalkspuren, die bei normaler Nutzung entstehen und sich mit professioneller Reinigung lösen lassen.**  
> **Sehr starke oder über längere Zeit entstandene Kalkablagerungen können zusätzlichen Aufwand erfordern und sind nicht im Standard-Paket enthalten.**

**Продуктовый смысл:** Standard покрывает «нормальный» Kalk после обычной эксплуатации. Клиент с сильным/долгим налётом должен выбирать **Premium** или явно отмечать strong limescale в wizard (с подсказкой перейти на Premium).

---

## 4. Premium package

**Для кого:** сложные случаи, когда Standard недостаточен.

### Premium добавляет / усиливает

- **Сильный** известковый налёт (limescale)
- **Сильный** жир (heavy grease), в т.ч. на кухне
- **Больше** времени на объект (в рамках согласованной длительности / extra hours по pricing)
- **Пароочиститель**, если возможен на объекте (оборудование / доступ — operational note)
- **Более интенсивная** обработка кухни и ванной по сравнению со Standard

Premium **не заменяет** restoration и не обещает «как новое» для повреждённых поверхностей (см. §5–6).

---

## 5. Premium — ограничения (что Premium НЕ обещает)

Premium **не включает** и **не гарантирует**:

- Удаление **плесени** (Schimmel)
- **Реставрацию** / восстановление поверхностей
- Уборку **строительной пыли** (post-construction)
- Снятие **краски, цемента**, силикона, строительных загрязнений
- Работу с **опасными отходами**
- Гарантию, что **старые повреждённые** поверхности будут выглядеть как новые

Эти пункты должны быть видны в wizard (короткий блок «Nicht enthalten») и в CRM для клинера.

---

## 6. Не входит ни в Standard, ни в Premium

Общий список **Not included** (оба пакета):

| Категория | Примеры |
|-----------|---------|
| Плесень | Schimmelentfernung |
| Ремонт / стройка | Renovierungs- und Baustaub |
| Агрессивные загрязнения | Farbe, Zement, Silikonreste |
| Окна снаружи на высоте | Außenfenster in großer Höhe |
| Недоступные зоны | Bereiche ohne Zugang |
| Мебель | Schweres Möbel rücken |

Клиент может описать особые случаи в комментарии; финальное решение — на стороне CatClean (отказ, доп. согласование, отдельная услуга).

---

## 7. Сравнение пакетов (кратко)

| Аспект | Standard | Premium |
|--------|----------|---------|
| Состояние квартиры | Нормальное перед передачей | Сложнее: Kalk, Fett, больше времени |
| Kalk | Üblich / normal | Stark / langjährig |
| Küche / Bad | Tiefer als Home Care | Intensiver + ggf. Dampfreiniger |
| Ожидание «wie neu» | Нет | Нет (см. ограничения) |
| Цена | TBD (m²) | TBD (m², выше Standard) |

---

## 8. Wizard — implications (целевой public flow)

Публичный **Move Out wizard** (до реализации — требования к шагам):

| Вопрос / поле | Обязательность | Назначение |
|---------------|----------------|------------|
| Property size (m²) | **Да** | Pricing driver, min 30 m² |
| Package: Standard / Premium | **Да** | `package_type` |
| Empty apartment? | Рекомендуется | `empty_apartment` |
| Strong limescale? | Если Standard — подсказка Premium | `heavy_limescale` / routing |
| Heavy grease? | Опционально | Влияет на Premium / ops |
| Windows (inside)? | Опционально | `windows_inside` |
| Balcony? | Опционально | `balcony_included` |
| Parking / elevator / access | Опционально | Комментарий / `access_notes` |
| Photos | **Позже** (post-MVP) | Оценка сложности до визита |

**UX-правила:**

- При выборе Standard + strong limescale / heavy grease — мягкий upsell на Premium с текстом из §3.
- Не показывать пакет Basic.
- Показать блок «Nicht enthalten» (§5–6) перед подтверждением.
- Слоган § в hero или на шаге выбора пакета.

**Маршрут (предложение):** `/booking?service=move_out` (или `move_in_out`) — отдельный wizard, не путать с Home Care / Home Reset.

---

## 9. CRM — implications

Связка с существующей моделью заказа ([ORDER_MODEL.md](./ORDER_MODEL.md) §3):

| Слой | Значение |
|------|----------|
| `orders.booking_product` | `move_out` |
| `orders.service_type` | `move_in_out` |
| `move_cleaning_details.package_type` | `standard` \| `premium` |
| `move_cleaning_details.property_size_m2` | **Обязательно**, ≥ 30 |

**Отображение в CRM (целевое, после wizard):**

- Список / деталь / расписание: product label **Move Out Cleaning**, не только «Move In / Out».
- Service summary (пример): `65m² · premium · cabinets · oven`.
- Admin create order: те же поля package + m²; auto-pricing по `move_in_out` когда rates TBD → manual override допустим.

**Поля detail (ориентир, не исчерпывающий список для MVP wizard):**

- `empty_apartment`, `heavy_dirt`, `heavy_limescale`, `windows_inside`, `balcony_included`, `oven_cleaning`, `fridge_cleaning`, `inside_cabinets`
- `move_type`: для чистого Move Out product — по умолчанию `move_out` (move-in — отдельный маркетинговый вход при необходимости)

---

## 10. Открытые вопросы (до pricing TBD)

1. Точные €/m² для Standard и Premium и минимальная цена заказа.
2. Включены ли окна/балкон в базу пакета или только как extra.
3. Нужен ли отдельный продукт **Move In** с теми же пакетами или один wizard с выбором `move_type`.
4. Политика отмены / переноса для move-out дат (связь с [ORDER_RULES.md](./ORDER_RULES.md)).

---

## Changelog

| Дата | Изменение |
|------|-----------|
| 2026-06-03 | Первая версия продукта: 2 пакета (Standard / Premium), без Basic; wizard + CRM implications |
