# Vercel deployment guide

## Services

Use Vercel for the Next.js app and Vercel Postgres/Neon for PostgreSQL. SMS is FarazSMS only, behind the provider adapter.

## First deployment

1. Import `ODIIISE/Salon` into Vercel.
2. Add a Postgres storage integration from the Vercel project dashboard.
3. Configure `OWNER_SESSION_SECRET`, `CUSTOMER_SESSION_SECRET`, `BOOTSTRAP_OWNER_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_SALON_ID`, `SMS_PROVIDER=farazsms`, `SMS_API_KEY`, `SMS_LINE_NUMBER`, `SMS_PATTERN_CODE`, `APP_URL`, and the selected environment variables in Vercel. Never commit values.
4. Deploy a preview and verify `/api/health`. A healthy app with no database should report `needs-database`, not pretend to be ready.
5. Run migrations from a protected deployment step or local operator command against the production connection. Never run schema changes from a public request.
6. Run the booking race smoke test against a disposable preview database before production.

## Environment separation

Use separate Preview and Production databases. Do not point previews at production data. Keep production secrets out of local development and rotate bootstrap credentials after first setup.

## Vercel constraints

- Serverless handlers may be retried, so writes use idempotency keys.
- The notification cron runs every five minutes through `/api/internal/process-notifications` and requires `Authorization: Bearer $CRON_SECRET`.
- Pending SMS jobs are claimed with `SKIP LOCKED`, sent through FarazSMS, store the provider message ID, retry up to five attempts, then become terminal failures.
- Database connections use the Vercel/Neon pooled connection string.
- Logs are redacted; never log OTP codes, session tokens, customer notes, or full phone numbers.
- Availability and private owner routes are explicitly no-store.

## Release gates

Database readiness, migrations, auth smoke test, availability smoke test, concurrent booking test, FarazSMS OTP delivery, notification retry test, and rollback target must be green before production promotion.
