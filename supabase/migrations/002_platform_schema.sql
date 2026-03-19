-- ============================================================
-- KORA INTELLIGENCE — Platform Schema Migration
-- Run in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- Run AFTER 001_part2_schema.sql
-- ============================================================

-- ============================================================
-- B1. Enable pgvector extension
-- Required for knowledge_chunks embeddings (1536-dim vectors)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- B2. business_clients
-- One row per business using the Kora platform.
-- archetype: which AI archetype is active for this client.
-- ============================================================

CREATE TABLE IF NOT EXISTS business_clients (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  business_name  TEXT NOT NULL,
  industry       TEXT,
  archetype      TEXT NOT NULL CHECK (archetype IN ('salar', 'lyra', 'noor')),
  tier           TEXT DEFAULT 'starter' CHECK (tier IN ('starter', 'growth', 'scale')),
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE business_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients access own business"
  ON business_clients
  FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_business_clients_user
  ON business_clients(user_id);

-- ============================================================
-- B3. knowledge_chunks
-- Chunked + embedded business data per client.
-- embedding: 1536-dim vector from OpenAI text-embedding-3-small
-- Used for RAG retrieval in unified-stream.ts and analyst.ts
-- ============================================================

CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id    UUID REFERENCES business_clients(id) ON DELETE CASCADE NOT NULL,
  content      TEXT NOT NULL,
  embedding    vector(1536),
  source_file  TEXT,
  chunk_index  INTEGER,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Service role (server-side) can manage all chunks
CREATE POLICY "Service role manages knowledge chunks"
  ON knowledge_chunks
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- IVFFlat index for fast approximate cosine similarity search
-- Requires pgvector 0.4+. Run AFTER inserting first batch of data.
-- (Creating on empty table is fine — it'll just be a trivial index.)
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding
  ON knowledge_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_client
  ON knowledge_chunks(client_id);

-- ============================================================
-- B4. business_snapshots
-- Nightly AI-generated business intelligence snapshots.
-- insights: array of { title, detail, trend, action } objects.
-- Produced by /api/cron/analyse.ts, consumed by dashboard.
-- NEVER stores AI metrics — always business performance facts.
-- ============================================================

CREATE TABLE IF NOT EXISTS business_snapshots (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id          UUID REFERENCES business_clients(id) ON DELETE CASCADE NOT NULL,
  snapshot_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  headline           TEXT,
  insights           JSONB NOT NULL DEFAULT '[]'::jsonb,
  data_coverage_pct  INTEGER DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT now(),

  -- One snapshot per client per day
  UNIQUE(client_id, snapshot_date)
);

ALTER TABLE business_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages snapshots"
  ON business_snapshots
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for dashboard queries (last 7 days per client)
CREATE INDEX IF NOT EXISTS idx_business_snapshots_client_date
  ON business_snapshots(client_id, snapshot_date DESC);

-- ============================================================
-- B5. analyst_sessions
-- Conversation history for the dashboard analyst chat panel.
-- messages: JSONB array of { role, content, created_at }.
-- ============================================================

CREATE TABLE IF NOT EXISTS analyst_sessions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id   UUID REFERENCES business_clients(id) ON DELETE CASCADE NOT NULL,
  messages    JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE analyst_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages analyst sessions"
  ON analyst_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_analyst_sessions_client
  ON analyst_sessions(client_id, updated_at DESC);

-- ============================================================
-- B6. build_enquiries
-- Submissions from the /build landing page.
-- No user account required — anonymous inbound leads.
-- ============================================================

CREATE TABLE IF NOT EXISTS build_enquiries (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name    TEXT NOT NULL,
  industry         TEXT,
  city             TEXT,
  job_description  TEXT,
  has_data         BOOLEAN DEFAULT false,
  email            TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- No RLS — server-side insert only via service role key
ALTER TABLE build_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages build enquiries"
  ON build_enquiries
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- B7. subscriptions
-- Stripe subscription state per business client.
-- Mirrors tova subscription architecture.
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id            UUID REFERENCES business_clients(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id   TEXT,
  stripe_subscription_id TEXT,
  tier                 TEXT NOT NULL CHECK (tier IN ('starter', 'growth', 'scale')),
  status               TEXT NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
  current_period_end   TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now(),

  -- One subscription per client
  UNIQUE(client_id)
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages subscriptions"
  ON subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_subscriptions_client
  ON subscriptions(client_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer
  ON subscriptions(stripe_customer_id);

-- ============================================================
-- B8. Vector similarity search function
-- Used by ingest RAG retrieval and analyst.ts
-- Returns top-k knowledge chunks for a given client + query vector.
-- ============================================================

CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  query_embedding   vector(1536),
  match_client_id   UUID,
  match_count       INT DEFAULT 5
)
RETURNS TABLE (
  id           UUID,
  content      TEXT,
  source_file  TEXT,
  similarity   FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.content,
    kc.source_file,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM knowledge_chunks kc
  WHERE kc.client_id = match_client_id
    AND kc.embedding IS NOT NULL
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
