-- ============================================================
-- KORA INTELLIGENCE — Part 2 Schema Migrations
-- Run these in order in the Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- ============================================================
-- A1. brand_profiles table (NEW)
-- Stores workspace-level brand memory per authenticated user.
-- This is the prerequisite for brand context injection into
-- all companion prompts.
-- ============================================================

CREATE TABLE IF NOT EXISTS brand_profiles (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  brand_name  TEXT,
  industry    TEXT,
  tone_keywords      TEXT[],
  messaging_pillars  TEXT[],
  target_audience    TEXT,
  brand_voice_notes  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- RLS: users can only access their own brand profile
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own brand profile"
  ON brand_profiles
  FOR ALL
  USING (auth.uid() = user_id);

-- Unique: one brand profile per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_brand_profiles_user_id
  ON brand_profiles(user_id);

-- ============================================================
-- A2. Extend sessions table
-- Adds title, mode, status, summary columns.
-- companion_slug already exists — skip it.
-- ============================================================

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS title       TEXT,
  ADD COLUMN IF NOT EXISTS mode        TEXT,
  ADD COLUMN IF NOT EXISTS status      TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS summary     TEXT;

-- Index for sidebar session list queries (user sessions, newest first)
CREATE INDEX IF NOT EXISTS idx_sessions_user_status
  ON sessions(user_id, status, last_updated DESC);

-- ============================================================
-- A3. Extend messages table
-- Adds a dedicated metadata JSONB column.
-- Shape: { companion, mode, tone, workflowStage, nextActions[] }
-- Currently metadata is being stored inside attachments._meta
-- as a workaround — this is the proper column.
-- ============================================================

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Index for efficient metadata queries
CREATE INDEX IF NOT EXISTS idx_messages_metadata
  ON messages USING gin(metadata);

-- ============================================================
-- A4. uploaded_files table (NEW)
-- Persists uploaded files across sessions.
-- Currently files are parsed in-memory and discarded.
-- ============================================================

CREATE TABLE IF NOT EXISTS uploaded_files (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id        UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES user_profiles(id),
  file_name         TEXT NOT NULL,
  file_type         TEXT,
  storage_path      TEXT,
  extracted_text    TEXT,
  file_size_bytes   INTEGER,
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own files"
  ON uploaded_files
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- A5. generated_exports table (NEW)
-- Persists generated documents (DOCX / PDF / XLSX) so they
-- appear in the Deliverables Panel across sessions.
-- ============================================================

CREATE TABLE IF NOT EXISTS generated_exports (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id     UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES user_profiles(id),
  companion_slug TEXT,
  mode           TEXT,
  export_type    TEXT,  -- 'docx' | 'pdf' | 'xlsx'
  file_name      TEXT,
  storage_path   TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE generated_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own exports"
  ON generated_exports
  FOR ALL
  USING (auth.uid() = user_id);

-- Index for deliverables panel queries
CREATE INDEX IF NOT EXISTS idx_generated_exports_user
  ON generated_exports(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_exports_session
  ON generated_exports(session_id, created_at DESC);
