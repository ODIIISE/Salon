# Accessibility and resilience QA

## Required customer checks

- `html` is `lang=fa` and `dir=rtl`.
- Every interactive control has a visible focus state and a Persian accessible name.
- OTP fields expose labels, invalid state, error description, and live status.
- Booking confirmation, conflict, expiry, outage, and retry messages use `aria-live` without exposing secrets.
- Sheets/dialogs trap focus, make the background inert, focus the first useful control, and restore focus on close.
- Calendar uses grid semantics with keyboard navigation and announces selected date/availability.
- 360px and 390px viewports have no horizontal overflow.
- Reduced motion removes splash delay, pulse, decorative transitions, and nonessential animation.
- Blocked assets render the poster/CSS fallback; blocked API calls render recovery actions.

## Evidence

Record browser, viewport, keyboard path, screen-reader result, reduced-motion setting, network condition, and pass/fail. A screenshot alone is not accessibility evidence.
