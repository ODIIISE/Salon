# Status

Updated 2026-10-08.

## Complete

- Single-salon-first scope accepted; schema remains tenancy-ready.
- Product brief, architecture, roadmap, delivery plan, risk register, database runbook, Vercel deployment guide, and test strategy committed.
- Persian RTL booking shell with dark-luxury visual direction and reduced-motion CSS policy.
- Environment contract, pooled database boundary, no-store private response headers, and readiness endpoint.
- PostgreSQL schema with memberships, artists, services, add-ons, schedule, blocks, holds, bookings, events, audit logs, overlap exclusion, OTP/session, and rate-limit tables.
- Auth schema, migration runner, hashed OTP/session primitives, provider adapter, OTP request/verify with phone/IP rate limits, session lookup, current-user, logout, and staff authorization.
- Server-side service-aware availability engine with resolution, lead time, strict latest-finish/capped overflow, Tehran weekday calculation, active booking exclusion, artist blocks, and regression tests.
- Authenticated service-aware five-minute hold endpoint with artist eligibility and any-artist resolution.
- Booking finalize endpoint uses a transaction and database overlap constraint.
- Tehran/Jalali conversion helpers and boundary tests.
- Pure booking policy primitives and regression tests for duration, finish policy, intervals, and CSV formula safety.

## Next

1. Add integration tests against PostgreSQL for holds, expiry, authorization, and concurrent finalize.
2. Connect the visual flow to API states: conflict, hold expiry, offline, retry, and confirmed receipt.
3. Add notifications, cancellation/reschedule, owner timeline, and deployment smoke checks.
4. Replace fixed scheduling defaults with salon-configured resolution, buffer, breaks, days off, lead time, and overflow settings.
