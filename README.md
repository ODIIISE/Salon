# Forehand Salon

A production-minded Persian RTL booking system for nail studios, evolving the visual language of `ODIIISE/nailbook` into a reliable operational product.

## Current position

The reference prototype is a strong visual concept, not a launchable booking system. The first release of this repository is intentionally foundation-first: product decisions, architecture, security boundaries, booking invariants, and delivery gates live in `docs/` before feature work.

## Non-negotiables

- The server and PostgreSQL are the source of truth.
- No credentials, customer records, roles, audit logs, or booking authority in the browser.
- Availability is advisory; only an atomic server transaction can finalize a booking.
- All appointment instants are stored in UTC and displayed in `Asia/Tehran` with Jalali presentation.
- Every customer-facing flow is Persian-first, RTL, keyboard-accessible, and resilient when assets or APIs fail.
- No launch claim until the blocker/high test suite and operational QA gates pass.

## Delivery order

1. Read the product brief and launch gates in `docs/PRODUCT-BRIEF.md`.
2. Implement the typed server boundary and schema in `docs/ARCHITECTURE.md`.
3. Implement auth, tenancy, availability, holds, and atomic booking before redesigning visuals.
4. Add notification/payment lifecycle and owner operations.
5. Run the quality gates in `docs/ROADMAP.md`.

## Reference material

- [Reference app](https://github.com/ODIIISE/nailbook)
- Launch-readiness review: supplied with the project brief on 2026-10-08

## Local development

The application scaffold will be added after the foundation decisions below are reviewed in code. Never commit `.env` files, provider credentials, OTP values, or customer data.
