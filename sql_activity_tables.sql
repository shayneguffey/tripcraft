-- Activity Options table: stores tour/experience options for comparison
-- Each activity belongs to a trip and can be assigned to a calendar day
CREATE TABLE activity_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid(),

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'experience',
    -- categories: experience, tour, attraction, show, day_trip, outdoor, class, other

  -- Pricing
  price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  price_per TEXT DEFAULT 'person',  -- 'person', 'group', 'total'

  -- Timing
  duration_minutes INTEGER,
  start_time TEXT,          -- e.g. "09:00" or "14:30"
  scheduled_date DATE,      -- which trip day this is assigned to (null = unassigned)

  -- Location
  location_name TEXT,       -- e.g. "Phi Phi Islands", "Grand Palace"
  address TEXT,

  -- Provider info
  provider TEXT,            -- e.g. "Viator", "GetYourGuide", "Airbnb Experiences"
  rating NUMERIC(2,1),      -- e.g. 4.7
  review_count INTEGER,

  -- Media & links
  source_url TEXT,
  screenshot_url TEXT,      -- stored as base64 data URL

  -- Status
  is_selected BOOLEAN DEFAULT false,
  is_booked BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE activity_options ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit activities for their own trips
CREATE POLICY "Users can view their own activities"
  ON activity_options FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own activities"
  ON activity_options FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own activities"
  ON activity_options FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own activities"
  ON activity_options FOR DELETE
  USING (user_id = auth.uid());

-- Index for fast lookups by trip
CREATE INDEX idx_activity_options_trip_id ON activity_options(trip_id);
CREATE INDEX idx_activity_options_scheduled_date ON activity_options(scheduled_date);
