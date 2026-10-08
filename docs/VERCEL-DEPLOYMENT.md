# Vercel deployment guide

## Services

Use Vercel for the Next.js app and Vercel Postgres/Neon for PostgreSQL. Keep SMS, payments, and media behind provider interfaces so Vercel deployment does not couple domain code to a vendor.

## First deployment

1. Import `ODIIISE/Salon` into Vercel.
2. Add a Postgres storage integration from the Vercel project dashboard.
3. Configure `OWNER_SESSION_SECRET`, `CUSTOMER_SESSION_SECRET`, `BOOTSTRAP_OWNER_SECRET`, `APP_URL`, and the selected provider variables in Vercel Environment Variables. Never commit values.
4. Deploy a preview and verify `/api/health`. A healthy app with no database should report `needs-database`, not pretend to be ready.
5. Run migrations from a protected deployment step or local operator command against the production connection. Never run schema changes from a public request.
6. Run the booking race smoke test against a disposable preview database before production.

## Environment separation

Use separate Preview and Production databases. Do not point previews at production data. Keep production secrets out of local development and rotate bootstrap credentials after first setup.

## Vercel constraints to design around

- Serverless handlers may be retried, so all writes need idempotency keys.
- Background work belongs behind a durable job boundary; do not rely on an in-memory timer.
- Database connections must use the Vercel/Neon pooled connection string.
- Logs must be redacted and structured; never log OTP codes, session tokens, customer notes, or full phone numbers.
- Set cache behavior explicitly for availability and private owner routes. Availability must not be served from a stale public cache.

## Release gates

Database readiness, migrations, auth smoke test, availability smoke test, concurrent booking test, and rollback target must be green before production promotion.
