# Launch runbook

1. Create separate Vercel Preview and Production Postgres integrations.
2. Configure all variables from `.env.example`, including `SMS_PROVIDER=farazsms`, FarazSMS credentials, `CRON_SECRET`, session secrets, and `NEXT_PUBLIC_SALON_ID`.
3. Apply migrations from a protected operator environment: `node scripts/apply-migrations.mjs`.
4. Deploy Preview and run `npm run smoke` with `SMOKE_BASE_URL` set to the preview URL.
5. Verify OTP delivery through FarazSMS, then verify a customer booking, owner confirmation, cancellation, reschedule, and notification retry.
6. Run the concurrent finalization test against the Preview database. Expected result: one booking and one conflict.
7. Complete `docs/RELEASE-CHECKLIST.md` and `docs/ACCESSIBILITY-QA.md` with evidence.
8. Promote to Production only after every release blocker is cleared.

Rollback: promote the previous known-good deployment, stop cron processing if needed, preserve the database, and do not rerun migrations backward without a reviewed migration.
