# Product brief

## Product

Forehand is a calm, premium booking experience for Persian nail salons. Customers should be able to understand services, choose a Jalali date and slot, verify their phone, reserve once, and manage the appointment. Owners need a trustworthy daily timeline, controlled overrides, and clear operational states.

## Audience

- Customers booking from mobile in Iran.
- Salon owners and managers running one or more artists.
- Artists who need a focused schedule, not a dense back office.

## Product promise

**A beautiful booking flow that never lies about availability.** Visual polish supports trust; it never substitutes for a server decision.

## MVP scope

### Customer

- Public salon profile, services, add-ons, artist availability, Jalali calendar, Tehran timezone.
- Phone OTP authentication with consent for transactional reminders.
- Availability suggestions with explicit duration and latest-finish policy.
- Short-lived hold, atomic booking confirmation, receipt, cancellation and reschedule.
- Clear states for conflict, hold expiry, offline, unavailable API, and notification failure.

### Owner

- Authenticated owner/manager/artist roles.
- Daily timeline and list views.
- Booking status lifecycle: held, reserved, confirmed, checked-in, completed, cancelled, no-show.
- Services, add-ons, artists, working hours, breaks, days off, blocks.
- Manual booking only with visible conflict warning, explicit override confirmation, and audit event.
- Authorized export with formula-injection protection.

## Explicitly not MVP

Deposits and gateway integration, waitlist automation, loyalty, reviews, gift cards, multi-branch analytics, and heavy 3D effects. They follow only after booking correctness, auth, accessibility, and operational messaging are proven.

## UX principles

- Persian copy, `lang=fa`, `dir=rtl`, Persian digits where useful.
- One task per screen, visible duration/price/artist context, no surprise overflow.
- Native controls first. Sheets and dialogs have focus trap, inert background, initial focus, restoration, and live status.
- Poster-first visuals. Video and grain are optional enhancement, never critical content.
- Reduced motion removes splash delay, pulse, decorative transitions, and nonessential layout motion.

## Success criteria

- Two concurrent attempts for one slot produce exactly one booking.
- A customer booking appears for the authorized owner without refresh hacks or shared browser state.
- No unauthenticated response contains private customer data, roles, notes, or audit events.
- A failed API, malformed cache, or blocked asset produces a recoverable state, never silent seed reset or blank root.
- Customer and owner flows pass keyboard, screen-reader, 200% text, 360px viewport, and reduced-motion checks.
