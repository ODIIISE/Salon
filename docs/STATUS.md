# Status

Updated 2026-10-08.

## Complete

- Single-salon-first scope accepted; schema remains tenancy-ready.
- Product brief, architecture, roadmap, delivery plan, risk register, database runbook, Vercel deployment guide, and test strategy committed.
- Persian RTL booking shell with dark-luxury visual direction and reduced-motion CSS policy.
- Environment contract, pooled database boundary, no-store private response headers, and readiness endpoint.
- PostgreSQL schema with memberships, artists, services, add-ons, schedule, blocks, holds, bookings, events, audit logs, and artist overlap exclusion constraint.
- Auth schema, migration runner, hashed OTP/session primitives, provider adapter, OTP request/verify, session lookup, current-user, logout, staff authorization, and rate-limit table.
- Server-side service-aware availability engine with resolution, lead time, strict latest-finish/capped overflow, active booking exclusion, artist blocks, and regression tests.
- Authenticated service-aware five-minute hold endpoint with artist eligibility and any-artist resolution.
- Booking finalize endpoint uses a transaction and database overlap constraint.
- Pure booking policy primitives and regression tests for duration, finish policy, intervals, and CSV formula safety.

## Next

1. Add full Jalali conversion helpers and test month/leap/year boundaries; current API accepts Gregorian date keys and returns Tehran policy metadata.
2. Add request/IP/phone rate limits and OTP audit events.
3. Add integration tests against PostgreSQL for holds, expiry, authorization, and concurrent finalize.
4. Connect the visual flow to API states: conflict, hold expiry, offline, retry, and confirmed receipt.
5. Add notifications, cancellation/reschedule, owner timeline, and deployment smoke checks.
