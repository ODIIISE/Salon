# Status

Updated 2026-10-08.

## Complete

- Single-salon-first scope accepted; schema remains tenancy-ready.
- Product brief, architecture, roadmap, delivery plan, risk register, database runbook, Vercel deployment guide, and test strategy committed.
- Persian RTL booking shell with dark-luxury visual direction and reduced-motion CSS policy.
- Environment contract, pooled database boundary, no-store private response headers, and readiness endpoint.
- PostgreSQL schema with memberships, artists, services, add-ons, schedule, blocks, holds, bookings, events, audit logs, and artist overlap exclusion constraint.
- Auth schema, migration runner, hashed OTP/session primitives, provider adapter, OTP request/verify, session lookup, current-user, logout, and staff authorization.
- Server availability read boundary, authenticated five-minute hold endpoint, and booking finalize endpoint using a transaction and database overlap constraint.
- Pure booking policy primitives and regression tests for duration, finish policy, intervals, and CSV formula safety.

## Next

1. Replace placeholder availability slot generation with full Tehran/Jalali service-aware scheduling, breaks, blocks, lead time, Friday, and explicit overflow policy.
2. Add request/IP/phone rate limits and OTP audit events.
3. Add integration tests against PostgreSQL for holds, expiry, authorization, and concurrent finalize.
4. Connect the visual flow to API states: conflict, hold expiry, offline, retry, and confirmed receipt.
5. Add notifications, cancellation/reschedule, owner timeline, and deployment smoke checks.

## Vercel

Use Vercel Postgres/Neon pooled connection variables and separate Preview/Production databases. The deployment guide is in `docs/VERCEL-DEPLOYMENT.md`.
