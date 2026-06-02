# CatClean CRM — Preferred Cleaners

## Purpose

Preferred cleaner is a **client preference signal** for dispatch.

- It increases recommendation score.
- It does **not** auto-assign cleaner.
- Final assignment stays manual by admin/operator.

## Data model

Table: `client_preferred_cleaners`

- `client_id` -> `profiles.id`
- `cleaner_id` -> `profiles.id`
- `is_primary`
- unique `(client_id, cleaner_id)`

## Dispatch behavior

- If cleaner is preferred for this client -> strong score bonus.
- If no preferred cleaners exist, previous successful client-cleaner history gives small bonus.
- Preferred bonus is stronger than plain history bonus.

## UI

- Client detail page has `Preferred cleaners` block:
  - add cleaner
  - remove cleaner
  - mark primary
- Order assignment suggestions highlight preferred cleaner with badge.

## Guardrails

- Preference is not guaranteed assignment.
- No client-facing cleaner marketplace.
- No automatic cleaner selection in CRM.
