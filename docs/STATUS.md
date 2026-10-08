# Implementation status

Updated 2026-10-08.

## Complete

- Single-salon-first scope accepted; schema remains tenancy-ready.
- Product brief, architecture, roadmap, delivery plan, risk register, database runbook, and test strategy committed.
- Persian RTL booking shell with dark-luxury visual direction and reduced-motion CSS policy.
- Environment contract and server-only database boundary added.
- Initial PostgreSQL schema added with memberships, artists, services, add-ons, schedule, blocks, holds, bookings, events, audit logs, and artist overlap exclusion constraint.
- Auth migration added for OTP challenges and revocable sessions.
- Migration runner added with ordered files, checksum tracking, and transactional application.
- Hashed OTP/session token primitives and provider adapter boundary added.
- OTP request and verification routes added with secure session cookie issuance.
- Pure booking policy primitives and regression tests added for duration, finish policy, intervals, and CSV formula safety.
- Health endpoint reports database readiness separately from application availability.

## Next implementation slice

1. Add request rate limits and OTP delivery audit events.
2. Add authenticated session lookup, logout, and salon membership/role policy.
3. Add server availability calculation, hold creation, and atomic booking finalization.
4. Add integration tests against PostgreSQL, then connect the existing visual flow to the API.
5. Revisit GitHub Actions once repository workflow permission is granted.

## Known setup note

The GitHub connection still cannot create `.github/workflows` because the connected account lacks repository workflow permission. This does not block local quality commands or application implementation.
