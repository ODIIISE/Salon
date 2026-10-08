# Salon

A production-minded Persian RTL booking system for nail salons, built from the visual direction of [ODIIISE/nailbook](https://github.com/ODIIISE/nailbook) and designed around server-owned booking correctness.

## Current scope

This is a single-salon product with tenancy-ready data boundaries. PostgreSQL and the server are authoritative for identity, catalog, schedule, holds, bookings, payments, notifications, and audit history. Appointment instants are stored in UTC and presented in Asia/Tehran with Jalali dates.

The implemented surface includes:

- Persian-first customer booking with service-aware availability, five-minute holds, OTP sign-in, confirmation, cancellation, and rescheduling.
- Owner day timeline, booking status transitions, manual bookings with explicit conflict override, schedule settings, days off, blocks, and safe CSV export.
- Durable FarazSMS notification jobs with retry-safe claiming, provider message IDs, and terminal failure visibility.
- PostgreSQL overlap protection, idempotent booking finalization, migration checksums, protected cron routes, security headers, and recovery states.
- Pay-at-salon and deposit-policy contracts only. No live payment gateway is enabled.

## Local development

Requirements: Node.js 22+, npm, and PostgreSQL 16+.

```bash
cp .env.example .env.local
npm install
# fill POSTGRES_URL and local development secrets in .env.local
npm run verify-migrations
node scripts/apply-migrations.mjs
npm run dev
```

Open `http://localhost:3000`. For a complete local quality pass:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

`npm run check` runs migration verification, typechecking, tests, and the production build. Integration tests run when `POSTGRES_URL` points to a migrated PostgreSQL database; otherwise the database-dependent contract is skipped and the output must not be treated as launch evidence.

## Environment

Use `.env.example` as the source of truth. FarazSMS is configured with `SMS_PROVIDER=farazsms`, `SMS_API_KEY`, `SMS_LINE_NUMBER`, and `SMS_PATTERN_CODE`. Do not introduce `FARAZSMS_*` aliases. Production also requires `POSTGRES_URL`, both session secrets, `CRON_SECRET`, and `NEXT_PUBLIC_SALON_ID`.

Never commit `.env` files, provider credentials, OTP values, session tokens, or customer data.

## Architecture

The app is a Next.js App Router modular monolith. Route handlers validate input and authorization at the server boundary, domain code lives under `lib/`, and PostgreSQL migrations live under `db/migrations/`. Notification delivery is a durable database queue processed by protected Vercel cron routes. The database exclusion constraint is the final defense against double booking; availability is advisory only.

## Database migrations

Migrations are ordered SQL files under `db/migrations/`. The current repository contains seven migrations, `001_initial.sql` through `007_payments.sql`. Check them before applying with `npm run verify-migrations`, then apply them from a protected operator environment with `node scripts/apply-migrations.mjs`.

## CI and deployment

A CI workflow is prepared to run lint, typecheck, tests, build, migration verification, and PostgreSQL-backed integration setup, but GitHub rejected its commit because the connected token lacks repository `workflow` permission. Grant that permission and push `.github/workflows/ci.yml` before treating CI as active.

For deployment, create separate Vercel Preview and Production PostgreSQL connections, configure the variables from `.env.example`, apply migrations, deploy Preview, run `npm run smoke` with `SMOKE_BASE_URL`, verify FarazSMS delivery, and only then promote. See the launch checklist and runbook for release evidence and rollback steps.

## Docs

- [Product brief](docs/PRODUCT-BRIEF.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Decisions](docs/DECISIONS.md)
- [Roadmap](docs/ROADMAP.md)
- [Risk register](docs/RISK-REGISTER.md)
- [Test strategy](docs/TEST-STRATEGY.md)
- [Payments](docs/PAYMENTS.md)
- [Launch runbook](docs/LAUNCH-RUNBOOK.md)
- [Release checklist](docs/RELEASE-CHECKLIST.md)
- [Accessibility QA](docs/ACCESSIBILITY-QA.md)
