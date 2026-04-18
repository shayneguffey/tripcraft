-- ═══════════════════════════════════════════════════════════════
-- Migration 12: Itineraries & Itinerary Selections
-- Multiple itinerary versions per trip for comparison
-- ═══════════════════════════════════════════════════════════════

-- ─── Table: itineraries ───
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL DEFAULT 'Itinerary 1',
  description TEXT,
  num_travelers INTEGER NOT NULL DEFAULT 1,
  start_date DATE,
  end_date DATE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: itinerary_selections ───
CREATE TABLE itinerary_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  option_type TEXT NOT NULL, -- 'flight', 'accommodation', 'activity', 'dining', 'transportation'
  option_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(itinerary_id, option_type, option_id)
);

-- ─── RLS Policies: itineraries ───
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own itineraries"
  ON itineraries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own itineraries"
  ON itineraries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own itineraries"
  ON itineraries FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own itineraries"
  ON itineraries FOR DELETE
  USING (user_id = auth.uid());

-- ─── RLS Policies: itinerary_selections ───
ALTER TABLE itinerary_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view selections for their itineraries"
  ON itinerary_selections FOR SELECT
  USING (
    itinerary_id IN (
      SELECT id FROM itineraries WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert selections for their itineraries"
  ON itinerary_selections FOR INSERT
  WITH CHECK (
    itinerary_id IN (
      SELECT id FROM itineraries WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete selections for their itineraries"
  ON itinerary_selections FOR DELETE
  USING (
    itinerary_id IN (
      SELECT id FROM itineraries WHERE user_id = auth.uid()
    )
  );

-- ─── Data Migration: Create default itinerary for each existing trip ───
-- and migrate existing is_selected states into itinerary_selections

INSERT INTO itineraries (trip_id, user_id, title, start_date, end_date, num_travelers, sort_order)
SELECT id, user_id, 'Itinerary 1', start_date, end_date, COALESCE(num_travelers, 1), 0
FROM trips;

-- Migrate selected flights
INSERT INTO itinerary_selections (itinerary_id, option_type, option_id)
SELECT i.id, 'flight', fo.id
FROM flight_options fo
JOIN itineraries i ON i.trip_id = fo.trip_id
WHERE fo.is_selected = true;

-- Migrate selected accommodations
INSERT INTO itinerary_selections (itinerary_id, option_type, option_id)
SELECT i.id, 'accommodation', ao.id
FROM accommodation_options ao
JOIN itineraries i ON i.trip_id = ao.trip_id
WHERE ao.is_selected = true;

-- Migrate selected activities
INSERT INTO itinerary_selections (itinerary_id, option_type, option_id)
SELECT i.id, 'activity', ao.id
FROM activity_options ao
JOIN itineraries i ON i.trip_id = ao.trip_id
WHERE ao.is_selected = true;

-- Migrate selected dining
INSERT INTO itinerary_selections (itinerary_id, option_type, option_id)
SELECT i.id, 'dining', d.id
FROM dining_options d
JOIN itineraries i ON i.trip_id = d.trip_id
WHERE d.is_selected = true;

-- Migrate selected transportation
INSERT INTO itinerary_selections (itinerary_id, option_type, option_id)
SELECT i.id, 'transportation', t.id
FROM transportation_options t
JOIN itineraries i ON i.trip_id = t.trip_id
WHERE t.is_selected = true;

-- ─── Indexes for performance ───
CREATE INDEX idx_itineraries_trip_id ON itineraries(trip_id);
CREATE INDEX idx_itinerary_selections_itinerary_id ON itinerary_selections(itinerary_id);
CREATE INDEX idx_itinerary_selections_option ON itinerary_selections(option_type, option_id);
