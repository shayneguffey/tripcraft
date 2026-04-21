-- ═══════════════════════════════════════════════════════════════
-- Migration: Share Tokens for Public Itinerary Links
-- Adds a unique share_token to itineraries for unauthenticated access
-- ═══════════════════════════════════════════════════════════════

-- Add share_token column
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- Index for fast lookups by token
CREATE INDEX IF NOT EXISTS idx_itineraries_share_token ON itineraries(share_token);

-- ─── RLS policy: allow anonymous reads by share_token ───
-- This lets the public API route fetch itinerary data without auth
CREATE POLICY "Anyone can view itineraries by share_token"
  ON itineraries FOR SELECT
  USING (share_token IS NOT NULL);

-- ─── Read-only policies for option tables (public via trip_id) ───
-- These let the API route join through itinerary → trip_id to fetch options

CREATE POLICY "Public read flight_options via shared itinerary"
  ON flight_options FOR SELECT
  USING (
    trip_id IN (
      SELECT trip_id FROM itineraries WHERE share_token IS NOT NULL
    )
  );

CREATE POLICY "Public read flight_legs via shared itinerary"
  ON flight_legs FOR SELECT
  USING (
    option_id IN (
      SELECT fo.id FROM flight_options fo
      JOIN itineraries i ON i.trip_id = fo.trip_id
      WHERE i.share_token IS NOT NULL
    )
  );

CREATE POLICY "Public read accommodation_options via shared itinerary"
  ON accommodation_options FOR SELECT
  USING (
    trip_id IN (
      SELECT trip_id FROM itineraries WHERE share_token IS NOT NULL
    )
  );

CREATE POLICY "Public read activity_options via shared itinerary"
  ON activity_options FOR SELECT
  USING (
    trip_id IN (
      SELECT trip_id FROM itineraries WHERE share_token IS NOT NULL
    )
  );

CREATE POLICY "Public read dining_options via shared itinerary"
  ON dining_options FOR SELECT
  USING (
    trip_id IN (
      SELECT trip_id FROM itineraries WHERE share_token IS NOT NULL
    )
  );

CREATE POLICY "Public read transportation_options via shared itinerary"
  ON transportation_options FOR SELECT
  USING (
    trip_id IN (
      SELECT trip_id FROM itineraries WHERE share_token IS NOT NULL
    )
  );

CREATE POLICY "Public read itinerary_selections via shared itinerary"
  ON itinerary_selections FOR SELECT
  USING (
    itinerary_id IN (
      SELECT id FROM itineraries WHERE share_token IS NOT NULL
    )
  );

CREATE POLICY "Public read days via shared itinerary"
  ON days FOR SELECT
  USING (
    trip_id IN (
      SELECT trip_id FROM itineraries WHERE share_token IS NOT NULL
    )
  );

CREATE POLICY "Public read activities via shared itinerary"
  ON activities FOR SELECT
  USING (
    day_id IN (
      SELECT d.id FROM days d
      JOIN itineraries i ON i.trip_id = d.trip_id
      WHERE i.share_token IS NOT NULL
    )
  );

CREATE POLICY "Public read travel_documents via shared itinerary"
  ON travel_documents FOR SELECT
  USING (
    trip_id IN (
      SELECT trip_id FROM itineraries WHERE share_token IS NOT NULL
    )
  );

CREATE POLICY "Public read planning_checklist via shared itinerary"
  ON planning_checklist FOR SELECT
  USING (
    trip_id IN (
      SELECT trip_id FROM itineraries WHERE share_token IS NOT NULL
    )
  );

CREATE POLICY "Public read trips via shared itinerary"
  ON trips FOR SELECT
  USING (
    id IN (
      SELECT trip_id FROM itineraries WHERE share_token IS NOT NULL
    )
  );
