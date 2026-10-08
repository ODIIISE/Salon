# Test strategy

## Unit tests

Pure functions cover Jalali conversion boundaries, Tehran midnight, service plus add-on duration, resolution rounding, buffer, breaks, blocks, lead time, Friday/holiday rules, strict latest finish, capped overflow, gap minimization, and any-artist eligibility.

## Integration tests

Use a real PostgreSQL test database for migrations, tenancy filters, authorization, holds, expiry, booking finalization, exclusion conflicts, cancellation/reschedule transitions, webhook idempotency, audit events, and CSV formula neutralization.

## End-to-end tests

- Customer: service, add-on, Jalali date, slot, OTP, hold, confirm, receipt, cancel, reschedule.
- Owner: sign in, view day, status update, block time, manual override with warning and audit event.
- Race: two sessions request the same artist/time; exactly one succeeds and one receives conflict.
- Resilience: API outage, retry, expired session, hold expiry, blocked poster/video, malformed non-sensitive draft, reduced motion.

## Accessibility checks

Automate semantics and focus where possible. Manually verify keyboard-only flow, focus trap and restoration, live announcements, calendar grid, timeline controls, 200% text, screen reader output, and visible focus at 360px and desktop.

## Release evidence

Every release candidate records commit SHA, migration result, test output, build result, environment check, smoke test, rollback target, and unresolved assumptions. No test evidence means no launch approval.
