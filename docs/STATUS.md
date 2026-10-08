# Status

Updated 2026-10-08.

## Verified in repository

- Single-salon-first scope is accepted; schema remains tenancy-ready.
- The application is implemented as a Next.js App Router modular monolith with PostgreSQL migrations, typed server boundaries, security headers, API recovery states, and a production build path.
- Seven migrations exist in exact lexical order: `001_initial.sql` through `007_payments.sql`.
- OTP/session auth, role authorization, service-aware Tehran/Jalali availability, five-minute holds, transactional booking finalization, PostgreSQL overlap protection, notification queueing, FarazSMS adapters, owner timeline operations, manual conflict overrides, payment policy, and formula-safe exports are present in code.
- `vercel.json` already contains both cron schedules: notification processing and expired-hold cleanup, each route protected by `CRON_SECRET`.

## Slices completed

- Replaced the stale README with local setup, scripts, environment, architecture, migration, CI, deployment, and documentation links.
- Standardized the documented FarazSMS variables to the names already used by runtime code: `SMS_API_KEY`, `SMS_LINE_NUMBER`, and `SMS_PATTERN_CODE`.
- Added an explicit accepted FarazSMS decision and removed stale provider-choice ambiguity from the decision record.
- Added `npm run verify-migrations` and included it in `npm run check`.
- Hardened runtime validation for production database, session, cron, salon, SMS, and payment configuration.
- Fixed the hold race: hold creation now serializes availability decisions per salon/artist, removes expired holds, and checks active holds as well as bookings before inserting.
- Replaced the placeholder integration contract with PostgreSQL tests for concurrent booking exclusion, expired-hold cleanup, idempotency-key uniqueness, and Tehran-local/UTC range overlap.
- Attempted to add `.github/workflows/ci.yml` with a PostgreSQL service, migration application, lint, typecheck, tests, and build. GitHub rejected the commit because the connected token lacks repository `workflow` permission; no workflow file was created.

## Verification

Not run in this environment: dependency install, lint, typecheck, build, and PostgreSQL integration tests. The repository has no local database connection here, so those results remain unverified until CI or a developer environment runs them.

## Next

1. Grant repository workflow permission and commit `.github/workflows/ci.yml`.
2. Run the new PostgreSQL suite in CI and fix any environment-specific failures.
3. Audit all private routes and UI failure/accessibility states, then finish remaining owner management surfaces.

## Release blockers

The app is not public-launch ready until a real database is migrated, `CRON_SECRET` is configured, FarazSMS is real, integration/race tests pass against PostgreSQL, the notification worker is provider-wired, and no mock provider remains enabled in production.

Owner-only actions remain: connect Vercel Preview and Production Postgres, set production secrets, verify real FarazSMS delivery, and run the first real Vercel deployment.
