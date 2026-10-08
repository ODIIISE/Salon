# Target architecture

## Shape

A typed Next.js application with server route handlers, PostgreSQL, a small job worker/queue, and object storage for non-sensitive media. The UI may cache a non-sensitive booking draft only. It must never be the source of truth.

## Domain boundaries

- **Identity**: phone OTP, sessions, rate limits, revocation, consent.
- **Tenancy**: salon is the authorization boundary; every domain row carries `salon_id`.
- **Catalog**: salons, artists, services, add-ons, eligibility and pricing snapshots.
- **Schedule**: working hours, breaks, days off, blocks, timezone policy.
- **Booking**: holds, bookings, add-ons, status transitions, reschedules, events.
- **Operations**: payments, notification jobs, audit logs, authorized exports.

## Persistence model

Core tables: `salons`, `users`, `memberships`, `roles`, `artists`, `services`, `addons`, `artist_services`, `working_hours`, `breaks`, `days_off`, `blocks`, `booking_holds`, `bookings`, `booking_addons`, `booking_events`, `payments`, `notification_jobs`, `audit_logs`.

Store `starts_at` and `ends_at` as UTC timestamps plus salon timezone metadata. Derive Jalali date/time for reads. Keep immutable price, duration, service, artist, and timezone snapshots on a booking so catalog edits cannot rewrite history.

## API contract

- `POST /api/auth/otp/request`
- `POST /api/auth/otp/verify`
- `POST /api/auth/logout`
- `GET /api/public/salons/:slug`
- `GET /api/public/availability?salonId=&serviceId=&date=`
- `POST /api/booking-holds`
- `POST /api/bookings`
- `GET /api/me/bookings`
- `PATCH /api/me/bookings/:id` for cancellation/reschedule
- `GET /api/owner/day`
- `PATCH /api/owner/bookings/:id`
- `POST /api/owner/manual-bookings` with explicit override payload
- `POST /api/payments/webhook` with idempotency key

All mutating endpoints validate input at runtime, require authorization, emit an audit event where relevant, and return stable error codes. Private fields are selected explicitly, never returned by broad queries.

## Booking correctness

1. Availability is a read-only candidate calculation.
2. A hold is short-lived, scoped to salon/customer/slot/selection, and expires server-side.
3. Finalization rechecks service duration, add-ons, artist eligibility, schedule, breaks, blocks, lead time, cancellation policy, and latest-finish/overflow policy.
4. PostgreSQL prevents overlap with an exclusion constraint over an `tstzrange` for active holds/bookings per artist. Application checks are not enough.
5. “Any artist” resolves to exactly one eligible artist inside the transaction.
6. Payment webhooks are idempotent and cannot create a second booking.
7. Manual overrides require a visible conflict warning, explicit confirmation, permission, reason, and audit event.

## Security baseline

- HttpOnly, Secure, SameSite session cookies; CSRF protection for cookie mutations.
- OTP values hashed at rest, single-use, short expiry, retry/lockout and per-phone/IP limits.
- Server-side salon membership and role checks on every private route.
- No PINs, secrets, customer lists, notes, roles, audit logs, or session tokens in client bundles or localStorage.
- Redacted structured logs, retention/deletion policy, explicit transactional/marketing consent.
- CSV exports limited to authorized fields and prefix cells beginning with `=`, `+`, `-`, or `@` with an apostrophe.

## Failure behavior

Schema validation, migrations, and backups are mandatory. A malformed cache is discarded only with an explicit recovery UI, never replaced with seed data. Add a top-level error boundary, visible offline/API outage states, retry affordances, and idempotency keys for retried writes.
