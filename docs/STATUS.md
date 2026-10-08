# Status

Updated 2026-10-08.

## Complete

- Single-salon-first scope accepted; schema remains tenancy-ready.
- Product brief, architecture, roadmap, delivery plan, risk register, database runbook, Vercel deployment guide, launch runbook, release checklist, accessibility QA contract, and test strategy committed.
- Persian RTL customer booking shell and protected owner timeline surface with dark-luxury visual direction and reduced-motion CSS policy.
- Production security headers: no sniffing, strict referrer policy, frame denial, permissions policy, and HSTS.
- Stable API error-code/message contract for customer recovery UI.
- Environment contract rejects incomplete production configuration and mock SMS in production.
- Pooled database boundary, no-store private response headers, readiness endpoint, Vercel cron configuration, protected notification worker route, and recovery error screen.
- Migration verification script, release smoke command, and database-ready smoke check.
- PostgreSQL schema with memberships, artists, services, add-ons, schedule, blocks, holds, bookings, events, audit logs, overlap exclusion, OTP/session, rate-limit, schedule settings, days off, notification jobs, booking idempotency, and payment policy/payment tables.
- Auth schema, migration runner, hashed OTP/session primitives, FarazSMS provider boundary, OTP request/verify with phone/IP rate limits, session lookup, current-user, logout, and staff authorization.
- OTP requests invalidate the challenge when FarazSMS delivery fails, so an undelivered code cannot remain usable.
- FarazSMS adapter captures provider response IDs and uses pattern SMS for OTP plus simple SMS for transactional messages.
- Protected notification worker sends pending SMS jobs through FarazSMS, persists provider message IDs, retries transient failures up to five attempts, and marks terminal failures visibly.
- Server-side service-aware availability engine with owner-configured resolution, buffer, lead time, strict latest-finish/capped overflow, Tehran weekday/date filtering, days off, active booking exclusion, artist blocks, and corrected Tehran-local interval overlap comparison.
- Authenticated service-aware five-minute hold endpoint with artist eligibility and any-artist resolution.
- Booking finalize endpoint uses a transaction, database overlap constraint, idempotency key, booking event, and queued confirmation notification.
- Tehran/Jalali conversion helpers and boundary tests.
- Public catalog endpoint and customer UI wiring for live catalog, availability, OTP, hold, finalize, conflict, API failure, and confirmed receipt states.
- Customer booking history, cancellation, rescheduling, and lifecycle SMS notifications.
- Owner day timeline, protected status transitions, manual booking with explicit conflict override/audit, block controls, schedule settings, days off, formula-safe authorized CSV export, and payment/cancellation policy controls.
- Public payment policy endpoint exposes only safe customer-facing fields.
- PostgreSQL integration test contract scaffold, including a Tehran-local overlap regression.
- Pure booking policy primitives and regression tests for duration, finish policy, intervals, and CSV formula safety.

## Next

1. Run migrations and smoke checks against separate Vercel Preview/Production databases.
2. Configure FarazSMS API key, sender line, and OTP pattern code; verify delivery and retry behavior.
3. Complete production accessibility/device QA and connect remaining owner UI surfaces.
4. Add a real payment gateway adapter only after the pay-at-salon/deposit policy is validated with the salon.

## Release blockers

The app is not public-launch ready until a real database is migrated, `CRON_SECRET` is configured, FarazSMS is real, integration/race tests pass against PostgreSQL, the notification worker is provider-wired, and no mock provider remains enabled in production.
