CREATE TABLE IF NOT EXISTS payment_policies (
  salon_id uuid PRIMARY KEY REFERENCES salons(id) ON DELETE CASCADE,
  mode text NOT NULL DEFAULT 'pay_at_salon' CHECK (mode IN ('pay_at_salon','deposit_required')),
  deposit_percent integer NOT NULL DEFAULT 0 CHECK (deposit_percent BETWEEN 0 AND 100),
  cancellation_hours integer NOT NULL DEFAULT 24 CHECK (cancellation_hours >= 0 AND cancellation_hours <= 720),
  no_show_percent integer NOT NULL DEFAULT 0 CHECK (no_show_percent BETWEEN 0 AND 100),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'manual',
  provider_reference text,
  amount_irr bigint NOT NULL CHECK (amount_irr >= 0),
  status text NOT NULL CHECK (status IN ('pending','paid','failed','refunded')),
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
