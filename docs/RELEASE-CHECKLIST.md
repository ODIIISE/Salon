# Release checklist

## Vercel

- [ ] Preview and Production use separate Postgres databases.
- [ ] `POSTGRES_URL`, session secrets, `CRON_SECRET`, `NEXT_PUBLIC_SALON_ID`, SMS provider and API key are configured in the correct environments.
- [ ] Bootstrap secret is rotated or removed after owner setup.
- [ ] `/api/health` returns database ready after migrations.
- [ ] Vercel cron invocation is authorized and notification jobs are observable.

## Booking

- [ ] Customer OTP request/verify works with a real Iranian number.
- [ ] Availability reflects Tehran date, Jalali display, hours, days off, blocks, buffer, lead time, and finish policy.
- [ ] Two simultaneous finalizations produce exactly one booking and one conflict.
- [ ] Hold expiry returns a clear recoverable state.
- [ ] Cancel and reschedule respect policy and create events.

## Security and privacy

- [ ] No demo credentials, PINs, customer notes, audit data, or secrets in client payloads.
- [ ] Cross-salon and cross-role negative tests pass.
- [ ] CSV formula injection test passes.
- [ ] Logs contain no OTP, session token, full phone, or customer notes.

## UX and accessibility

- [ ] 360px and 390px layouts have no horizontal overflow.
- [ ] Keyboard-only booking works with visible focus.
- [ ] Dialog/sheet focus trap and restoration pass.
- [ ] Screen reader announces errors, holds, conflicts, and success.
- [ ] Reduced motion removes splash/pulse/decorative motion.
- [ ] Blocked assets and API outage show intentional fallbacks.
