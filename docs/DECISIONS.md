# Architecture decision record

Status: proposed unless marked accepted. This file is the source of truth for choices that would otherwise drift between sessions.

## ADR-001: server-owned state

**Decision:** PostgreSQL plus a typed API owns identity, catalog, schedules, holds, bookings, payments, notifications, and audit history. Browser storage is limited to non-sensitive UI preferences and a short-lived booking draft.

**Why:** the reference app lost cross-device consistency, exposed private data, and allowed last-write-wins double bookings.

## ADR-002: modular monolith first

**Decision:** start as one deployable Next.js modular monolith with clear domain modules and a worker boundary. Do not split services before measured need.

**Why:** fastest path to correctness, fewer distributed failure modes, simpler deployment and observability.

## ADR-003: PostgreSQL overlap protection

**Decision:** represent active appointment time as a PostgreSQL range and enforce non-overlap per artist with an exclusion constraint. Holds participate in the same protection until expiry.

**Why:** application-level availability checks cannot close a concurrency race.

## ADR-004: OTP-first identity

**Decision:** phone OTP with HttpOnly Secure SameSite sessions is the primary customer and staff sign-in. No client PINs or demo accounts.

**Why:** matches the Iran operating context while removing plaintext credential exposure. Provider details stay behind an adapter.

## ADR-005: Jalali at the edge

**Decision:** persist UTC instants and salon timezone; convert to Jalali only at validation and presentation boundaries. The supported date range and leap-year behavior are tested explicitly.

**Why:** prevents timezone arithmetic and display calendars from contaminating core scheduling logic.

## ADR-006: latest-finish policy

**Decision:** default policy is strict latest finish at shift close. Overflow is a separate, explicit salon setting with a hard minute cap and visible staff/customer copy.

**Why:** the prototype silently produced appointments ending after close.

## ADR-007: visual direction

**Decision:** preserve the dark-luxury, low-density, Persian-first language. Improve hierarchy and resilience before adding decorative 3D or heavy motion.

**Why:** the brand is the strongest part of the prototype; the product needs operational trust, not more spectacle.

## ADR-008: provider adapters

**Decision:** SMS, payments, storage, and jobs use interfaces with local/test implementations. Routes never call a vendor SDK directly.

**Why:** provider changes, retries, idempotency, and testability are operational concerns, not UI concerns.

## ADR-009: single-salon first

**Decision:** build and validate the operational product for one salon first, while retaining `salon_id` and membership boundaries in the schema so a future multi-salon product does not require a rewrite.

**Why:** it reduces product and operational complexity during the highest-risk phase. Tenancy-ready data boundaries preserve the expansion path without forcing SaaS billing, onboarding, cross-salon administration, and support concerns into the launch-critical path.

**Accepted:** 2026-10-08 by Mehrdad Rastadfar.

## Open decisions requiring owner input

1. Deployment/database choice: Vercel + Neon/Postgres, or a different controlled host.
2. SMS provider: Kavenegar, Ghasedak, or another provider with delivery-status support.
3. Payment timing: pay-at-salon first, deposit in MVP, or deposit immediately after booking correctness.
