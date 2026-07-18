-- Rate limits table for cross-instance rate limiting (Vercel serverless)
CREATE TABLE IF NOT EXISTS rate_limits (
  ip TEXT PRIMARY KEY,
  endpoint TEXT NOT NULL DEFAULT 'default',
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits (window_start);

-- Enable RLS (though only accessed via service_role)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
