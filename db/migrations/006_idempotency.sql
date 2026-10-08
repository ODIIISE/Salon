CREATE TABLE IF NOT EXISTS booking_requests (
  idempotency_key text PRIMARY KEY,
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS booking_requests_customer_idx ON booking_requests(customer_id, created_at DESC);
