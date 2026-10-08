# Payments

The booking product currently supports `pay_at_salon` and stores the future `deposit_required` contract without pretending a gateway is live.

Payment code is provider-agnostic: create intent, verify signed webhook, idempotency key, amount check, payment ledger, and booking confirmation only after paid status.

Do not enable deposit collection until an Iranian gateway is selected, credentials are stored in Vercel, webhook signature verification is implemented, refunds are defined, and success/failure/replay tests pass.
