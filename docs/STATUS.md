# Status

Updated 2026-10-08.

## Complete

- Single-salon-first scope accepted; schema remains tenancy-ready.
- Product brief, architecture, roadmap, delivery plan, risk register, database runbook, Vercel deployment guide, and test strategy committed.
- Persian RTL booking shell with dark-luxury visual direction and reduced-motion CSS policy.
- Environment contract, pooled database boundary, no-store private response headers, and readiness endpoint.
- PostgreSQL schema with memberships, artists, services, add-ons, schedule, blocks, holds, bookings, events, audit logs, overlap exclusion, OTP/session, rate-limit, and notification job tables.
- Auth schema, migration runner, hashed OTP/session primitives, provider adapter, OTP request/verify with phone/IP rate limits, session lookup, current-user, logout, and staff authorization.
- Server-side service-aware availability engine with resolution, lead time, strict latest-finish/capped overflow, Tehran weekday/date filtering, active booking exclusion, artist blocks, and regression tests.
- Authenticated service-aware five-minute hold endpoint with artist eligibility and any-artist resolution.
- Booking finalize endpoint uses a transaction, database overlap constraint, booking event, and queued confirmation notification.
- Tehran/Jalali conversion helpers and boundary tests.
- Public catalog endpoint and customer UI wiring for live catalog, availability, OTP, hold, finalize, conflict, API failure, and confirmed receipt states.
- Customer booking history and cancellation endpoint.
- Notification processing boundary that fails visibly until a real provider is configured.
- Pure booking policy primitives and regression tests for duration, finish policy, intervals, and CSV formula safety.

## Next

1. Add integration tests against PostgreSQL for holds, expiry, authorization, and concurrent finalize.
2. Add customer reschedule with the same policy engine and hold flow.
3. Connect a real SMS provider and durable scheduled invocation for notification processing.
4. Add owner timeline, status transitions, owner notifications, and deployment smoke checks.
5. Replace fixed scheduling defaults with salon-configured resolution, buffer, breaks, days off, lead time, and overflow settings.
