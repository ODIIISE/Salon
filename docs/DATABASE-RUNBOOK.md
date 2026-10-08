# Database runbook

## Local

1. Copy `.env.example` to `.env.local`.
2. Set `POSTGRES_URL` to a disposable PostgreSQL database.
3. Apply migrations in filename order using the migration runner.
4. Verify the health endpoint reports database readiness before exercising private routes.

## Production

- Take a raw database backup before every migration.
- Apply migrations in the deployment pipeline, never from a public GET request.
- Record migration name, checksum, operator, start/end time, and result.
- Run schema smoke checks and the concurrent booking test after migration.
- Keep the previous application version available for rollback.

## Recovery rules

Never replace a failed or malformed dataset with demo seed data. Stop the deployment, preserve the raw state, show a recovery state, and restore from the last verified backup only through an explicit operator action.
