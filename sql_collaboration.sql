-- =============================================
-- Trip Collaboration Tables & Updated RLS
-- =============================================

-- 1. Trip Collaborators table
CREATE TABLE IF NOT EXISTS trip_collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invite_token UUID DEFAULT gen_random_uuid() UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(trip_id, invited_email)
);

-- Enable RLS
ALTER TABLE trip_collaborators ENABLE ROW LEVEL SECURITY;

-- RLS policies for trip_collaborators
-- Trip owner and existing collaborators can view collaborators
CREATE POLICY "Trip members can view collaborators"
  ON trip_collaborators FOR SELECT
  USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
    OR trip_id IN (SELECT trip_id FROM trip_collaborators WHERE user_id = auth.uid() AND status = 'accepted')
    OR user_id = auth.uid()
    OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Trip owner and accepted collaborators can invite others
CREATE POLICY "Trip members can invite collaborators"
  ON trip_collaborators FOR INSERT
  WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
    OR trip_id IN (SELECT trip_id FROM trip_collaborators WHERE user_id = auth.uid() AND status = 'accepted')
  );

-- Users can update their own invite (accept/decline)
CREATE POLICY "Users can update own invites"
  ON trip_collaborators FOR UPDATE
  USING (
    user_id = auth.uid()
    OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- Trip owner can remove collaborators
CREATE POLICY "Trip owner can delete collaborators"
  ON trip_collaborators FOR DELETE
  USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
    OR user_id = auth.uid()
  );

-- 2. Create a helper function to check if user has access to a trip
-- (either as owner or accepted collaborator)
CREATE OR REPLACE FUNCTION user_has_trip_access(check_trip_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM trips WHERE id = check_trip_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM trip_collaborators
    WHERE trip_id = check_trip_id
      AND user_id = auth.uid()
      AND status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update trips table RLS to allow collaborators to view trips
-- First drop existing policies if they exist (run these one at a time if needed)
DROP POLICY IF EXISTS "Users can view own trips" ON trips;
DROP POLICY IF EXISTS "Users can insert own trips" ON trips;
DROP POLICY IF EXISTS "Users can update own trips" ON trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON trips;

-- New trips policies
CREATE POLICY "Users can view accessible trips"
  ON trips FOR SELECT
  USING (
    user_id = auth.uid()
    OR id IN (SELECT trip_id FROM trip_collaborators WHERE user_id = auth.uid() AND status = 'accepted')
  );

CREATE POLICY "Users can insert own trips"
  ON trips FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Trip members can update trips"
  ON trips FOR UPDATE
  USING (
    user_id = auth.uid()
    OR id IN (SELECT trip_id FROM trip_collaborators WHERE user_id = auth.uid() AND status = 'accepted')
  );

CREATE POLICY "Only owner can delete trips"
  ON trips FOR DELETE
  USING (user_id = auth.uid());

-- 4. Update RLS on all child tables to use trip access helper
-- Flight options
DROP POLICY IF EXISTS "Users can manage own flight_options" ON flight_options;
DROP POLICY IF EXISTS "Users can view own flight_options" ON flight_options;
DROP POLICY IF EXISTS "Users can insert own flight_options" ON flight_options;
DROP POLICY IF EXISTS "Users can update own flight_options" ON flight_options;
DROP POLICY IF EXISTS "Users can delete own flight_options" ON flight_options;

CREATE POLICY "Trip members can view flight_options"
  ON flight_options FOR SELECT USING (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can insert flight_options"
  ON flight_options FOR INSERT WITH CHECK (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can update flight_options"
  ON flight_options FOR UPDATE USING (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can delete flight_options"
  ON flight_options FOR DELETE USING (user_has_trip_access(trip_id));

-- Flight legs
DROP POLICY IF EXISTS "Users can manage own flight_legs" ON flight_legs;
DROP POLICY IF EXISTS "Users can view own flight_legs" ON flight_legs;
DROP POLICY IF EXISTS "Users can insert own flight_legs" ON flight_legs;
DROP POLICY IF EXISTS "Users can update own flight_legs" ON flight_legs;
DROP POLICY IF EXISTS "Users can delete own flight_legs" ON flight_legs;

CREATE POLICY "Trip members can view flight_legs"
  ON flight_legs FOR SELECT
  USING (option_id IN (SELECT id FROM flight_options WHERE user_has_trip_access(trip_id)));
CREATE POLICY "Trip members can insert flight_legs"
  ON flight_legs FOR INSERT
  WITH CHECK (option_id IN (SELECT id FROM flight_options WHERE user_has_trip_access(trip_id)));
CREATE POLICY "Trip members can update flight_legs"
  ON flight_legs FOR UPDATE
  USING (option_id IN (SELECT id FROM flight_options WHERE user_has_trip_access(trip_id)));
CREATE POLICY "Trip members can delete flight_legs"
  ON flight_legs FOR DELETE
  USING (option_id IN (SELECT id FROM flight_options WHERE user_has_trip_access(trip_id)));

-- Activity options
DROP POLICY IF EXISTS "Users can select own activity options" ON activity_options;
DROP POLICY IF EXISTS "Users can insert own activity options" ON activity_options;
DROP POLICY IF EXISTS "Users can update own activity options" ON activity_options;
DROP POLICY IF EXISTS "Users can delete own activity options" ON activity_options;

CREATE POLICY "Trip members can view activity_options"
  ON activity_options FOR SELECT USING (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can insert activity_options"
  ON activity_options FOR INSERT WITH CHECK (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can update activity_options"
  ON activity_options FOR UPDATE USING (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can delete activity_options"
  ON activity_options FOR DELETE USING (user_has_trip_access(trip_id));

-- Accommodation options
DROP POLICY IF EXISTS "Users can select own accommodation options" ON accommodation_options;
DROP POLICY IF EXISTS "Users can insert own accommodation options" ON accommodation_options;
DROP POLICY IF EXISTS "Users can update own accommodation options" ON accommodation_options;
DROP POLICY IF EXISTS "Users can delete own accommodation options" ON accommodation_options;

CREATE POLICY "Trip members can view accommodation_options"
  ON accommodation_options FOR SELECT USING (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can insert accommodation_options"
  ON accommodation_options FOR INSERT WITH CHECK (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can update accommodation_options"
  ON accommodation_options FOR UPDATE USING (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can delete accommodation_options"
  ON accommodation_options FOR DELETE USING (user_has_trip_access(trip_id));

-- Dining options
DROP POLICY IF EXISTS "Users can select own dining options" ON dining_options;
DROP POLICY IF EXISTS "Users can insert own dining options" ON dining_options;
DROP POLICY IF EXISTS "Users can update own dining options" ON dining_options;
DROP POLICY IF EXISTS "Users can delete own dining options" ON dining_options;

CREATE POLICY "Trip members can view dining_options"
  ON dining_options FOR SELECT USING (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can insert dining_options"
  ON dining_options FOR INSERT WITH CHECK (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can update dining_options"
  ON dining_options FOR UPDATE USING (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can delete dining_options"
  ON dining_options FOR DELETE USING (user_has_trip_access(trip_id));

-- Transportation options
DROP POLICY IF EXISTS "Users can select own transportation options" ON transportation_options;
DROP POLICY IF EXISTS "Users can insert own transportation options" ON transportation_options;
DROP POLICY IF EXISTS "Users can update own transportation options" ON transportation_options;
DROP POLICY IF EXISTS "Users can delete own transportation options" ON transportation_options;

CREATE POLICY "Trip members can view transportation_options"
  ON transportation_options FOR SELECT USING (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can insert transportation_options"
  ON transportation_options FOR INSERT WITH CHECK (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can update transportation_options"
  ON transportation_options FOR UPDATE USING (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can delete transportation_options"
  ON transportation_options FOR DELETE USING (user_has_trip_access(trip_id));

-- Planning checklist
DROP POLICY IF EXISTS "Users can view own checklist items" ON planning_checklist;
DROP POLICY IF EXISTS "Users can insert own checklist items" ON planning_checklist;
DROP POLICY IF EXISTS "Users can update own checklist items" ON planning_checklist;
DROP POLICY IF EXISTS "Users can delete own checklist items" ON planning_checklist;

CREATE POLICY "Trip members can view checklist"
  ON planning_checklist FOR SELECT USING (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can insert checklist"
  ON planning_checklist FOR INSERT WITH CHECK (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can update checklist"
  ON planning_checklist FOR UPDATE USING (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can delete checklist"
  ON planning_checklist FOR DELETE USING (user_has_trip_access(trip_id));

-- Packing list
DROP POLICY IF EXISTS "Users can view own packing items" ON packing_list;
DROP POLICY IF EXISTS "Users can insert own packing items" ON packing_list;
DROP POLICY IF EXISTS "Users can update own packing items" ON packing_list;
DROP POLICY IF EXISTS "Users can delete own packing items" ON packing_list;

CREATE POLICY "Trip members can view packing_list"
  ON packing_list FOR SELECT USING (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can insert packing_list"
  ON packing_list FOR INSERT WITH CHECK (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can update packing_list"
  ON packing_list FOR UPDATE USING (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can delete packing_list"
  ON packing_list FOR DELETE USING (user_has_trip_access(trip_id));

-- Travel documents
DROP POLICY IF EXISTS "Users can view own travel documents" ON travel_documents;
DROP POLICY IF EXISTS "Users can insert own travel documents" ON travel_documents;
DROP POLICY IF EXISTS "Users can update own travel documents" ON travel_documents;
DROP POLICY IF EXISTS "Users can delete own travel documents" ON travel_documents;

CREATE POLICY "Trip members can view travel_documents"
  ON travel_documents FOR SELECT USING (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can insert travel_documents"
  ON travel_documents FOR INSERT WITH CHECK (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can update travel_documents"
  ON travel_documents FOR UPDATE USING (user_has_trip_access(trip_id));
CREATE POLICY "Trip members can delete travel_documents"
  ON travel_documents FOR DELETE USING (user_has_trip_access(trip_id));

-- 5. Create an index for faster collaborator lookups
CREATE INDEX IF NOT EXISTS idx_trip_collaborators_user_id ON trip_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_collaborators_trip_id ON trip_collaborators(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_collaborators_invite_token ON trip_collaborators(invite_token);
CREATE INDEX IF NOT EXISTS idx_trip_collaborators_email ON trip_collaborators(invited_email);
