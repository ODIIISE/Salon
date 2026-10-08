CREATE TABLE IF NOT EXISTS schedule_settings (
  salon_id uuid PRIMARY KEY REFERENCES salons(id) ON DELETE CASCADE,
  resolution_minutes integer NOT NULL DEFAULT 15 CHECK (resolution_minutes IN (5,10,15,20,30,60)),
  buffer_minutes integer NOT NULL DEFAULT 0 CHECK (buffer_minutes >= 0 AND buffer_minutes <= 120),
  lead_minutes integer NOT NULL DEFAULT 0 CHECK (lead_minutes >= 0 AND lead_minutes <= 1440),
  overflow_enabled boolean NOT NULL DEFAULT false,
  overflow_minutes integer NOT NULL DEFAULT 0 CHECK (overflow_minutes >= 0 AND overflow_minutes <= 240),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS days_off (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  day date NOT NULL,
  reason text NOT NULL DEFAULT '',
  UNIQUE (salon_id, day)
);
