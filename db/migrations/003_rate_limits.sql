CREATE TABLE IF NOT EXISTS auth_rate_limits (
  key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 0 CHECK (request_count >= 0)
);
