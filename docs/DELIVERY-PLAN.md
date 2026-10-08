# Delivery plan

## Slice 1: trust boundary

**Outcome:** a deployable app with no fake authority.

- Validate environment at startup.
- Add database client and migration runner.
- Add salon, user, membership, role, service, artist, schedule, block, hold, booking, and event tables.
- Add health/readiness endpoints that distinguish app-up from database-ready.
- Add CI for lint, typecheck, tests, build, and migration checks.

## Slice 2: identity and tenancy

**Outcome:** customers and staff can sign in without client secrets.

- Request/verify OTP through an adapter.
- Hash OTPs, expire them, cap retries, rate-limit abuse.
- Issue revocable server sessions.
- Enforce salon membership and role permissions in a single policy layer.
- Test positive and negative authorization paths.

## Slice 3: booking correctness

**Outcome:** availability can be trusted.

- Build pure scheduling functions around UTC instants and Tehran display helpers.
- Implement service/add-on duration, buffers, breaks, blocks, days off, lead time, Friday configuration, and strict latest finish.
- Add `GET availability`, `POST holds`, `POST bookings`.
- Finalize in a transaction with range exclusion and any-artist assignment.
- Return stable 409 conflict and 410 expired-hold errors.

## Slice 4: operational lifecycle

**Outcome:** the appointment survives beyond the receipt screen.

- Booking event history and explicit status transitions.
- Customer cancel/reschedule policy.
- Owner timeline/list with server pagination.
- SMS confirmation/reminder jobs, retries, delivery status, and owner notifications.
- Visible failure states and idempotent retries.

## Slice 5: product hardening

**Outcome:** a polished, accessible release candidate.

- Replace remote critical assets with local assets and poster-first hero.
- Shared dialog/sheet primitive with focus contract.
- Calendar grid and keyboard timeline controls.
- Authorized, formula-safe export.
- Performance budgets and 360px/390px device QA.
- Backup/restore and rollback runbooks.

## Acceptance format for every pull request

- Problem and user outcome.
- Domain/data boundary.
- Failure and retry behavior.
- Authorization impact.
- Automated tests and manual QA notes.
- Migration/rollback impact.
- Screenshot or trace only when it proves behavior, not as a substitute for tests.
