# Implementation status

Updated 2026-10-08.

## Complete

- Single-salon-first scope accepted; schema remains tenancy-ready.
- Product brief, architecture, roadmap, delivery plan, risk register, database runbook, and test strategy committed.
- Persian RTL booking shell with dark-luxury visual direction and reduced-motion CSS policy.
- Environment contract and server-only database boundary added.
- Initial PostgreSQL schema added with memberships, artists, services, add-ons, schedule, blocks, holds, bookings, events, audit logs, and artist overlap exclusion constraint.
- Pure booking policy primitives and regression tests added for duration, finish policy, intervals, and CSV formula safety.
- Health endpoint now reports database readiness separately from application availability.

## Next implementation slice

1. Add migration runner with checksum tracking and backup hooks.
2. Add OTP/session provider interfaces and server-side session storage.
3. Add policy middleware for salon membership and role permissions.
4. Add server availability calculation, hold creation, and atomic booking finalization.
5. Add integration tests against PostgreSQL, then connect the existing visual flow to the API.

## Known setup note

GitHub Actions workflow creation requires repository workflow permission, which is not currently available to the connected GitHub account. The quality-gate commands are still defined in `package.json` and should be added to CI once that permission is enabled.
