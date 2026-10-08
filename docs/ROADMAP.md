# Launch roadmap

## Phase 0: foundation

- [x] Product brief, architecture, security boundaries, and launch gates committed.
- [ ] Choose deployment services and record decisions in ADRs.
- [ ] Add typed app scaffold, environment validation, database client, migrations, lint, typecheck, and test harness.
- [ ] Add CI checks: lint, typecheck, unit tests, build, migration validation.

## Phase 1: launch blockers

- [ ] Salon tenancy, memberships, roles, least-privilege authorization.
- [ ] OTP/session auth with provider adapter, rate limits, revocation, consent.
- [ ] PostgreSQL schema and safe migrations with raw backup before migration.
- [ ] Server-side availability with Tehran timezone and explicit latest-finish policy.
- [ ] Redis/database-backed short holds and atomic booking finalization.
- [ ] Exclusion constraint or equivalent transaction-safe overlap protection.
- [ ] Customer confirmation, cancellation, reschedule, and owner notification job.
- [ ] Recovery boundary, visible API/offline state, no seed fallback, non-sensitive draft only.
- [ ] Self-hosted critical assets, poster-first hero, blocked-asset fallback.
- [ ] RTL accessibility primitives, calendar grid semantics, keyboard timeline controls, reduced-motion policy.

## Phase 2: first 30 days after blocker pass

- [ ] Iranian payment/deposit provider adapter and idempotent webhook reconciliation.
- [ ] No-show policy, waitlist, cancellation windows, reminder schedule.
- [ ] Owner notifications and calendar export.
- [ ] Hardened authorized CSV export and audit history.
- [ ] Mobile device QA, performance budget, and production observability.
- [ ] Basic attendance/revenue/utilization reporting.

## Phase 3: later

- [ ] Reviews and per-artist portfolio.
- [ ] Loyalty and gift cards.
- [ ] Multi-branch tenancy expansion.
- [ ] Forecasting and a restrained, static-fallback brand moment.

## Definition of done for public launch

- No blocker or high finding remains open without an approved, documented exception.
- Concurrent booking E2E proves one winner and one conflict response.
- Authz tests prove cross-salon and cross-role access is denied.
- Migration, corrupted input, API outage, blocked assets, retry, and expired-session tests pass.
- Customer and owner manual QA passes at 360px, 390px, desktop, keyboard, screen reader, 200% text, and reduced motion.
- Production secrets are configured outside the repository; no demo credentials or personal data are committed.
- Backup/restore, incident contact, retention, and rollback runbooks are written.

## Working rule

Do not add visual polish, 3D, loyalty, or analytics to mask an unsafe booking core. Every feature must name its owner, data boundary, failure state, and automated test before implementation.
