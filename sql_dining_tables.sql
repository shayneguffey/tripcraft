-- Dining Options table: stores restaurant/venue options for comparison
-- Each dining option belongs to a trip and can be assigned to a calendar day
CREATE TABLE dining_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid(),

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  cuisine_type TEXT DEFAULT 'Other',
    -- examples: Thai, Italian, Seafood, Japanese, Mexican, Cafe, Street Food, Other

  -- Pricing
  price_range TEXT,          -- "$", "$$", "$$$", "$$$$"
  avg_meal_cost NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',

  -- Location
  location_name TEXT,       -- e.g. "Old Town", "Near BTS Chiang Mai"
  address TEXT,
  neighborhood TEXT,

  -- Hours & reservation
  hours TEXT,               -- e.g. "11am-10pm" or "Mon-Sat 12pm-9pm"
  reservation_required BOOLEAN DEFAULT false,

  -- Menu & specialties
  known_for TEXT,           -- signature dishes, specialties
  dietary_options TEXT,     -- comma-separated: vegetarian, vegan, halal, gluten-free, etc.

  -- Provider info
  provider TEXT,            -- e.g. "Google Maps", "Yelp", "TripAdvisor"
  rating NUMERIC(2,1),      -- e.g. 4.7
  review_count INTEGER,

  -- Timing & scheduling
  scheduled_date DATE,      -- which trip day this is assigned to (null = unassigned)
  meal_type TEXT,           -- breakfast, lunch, dinner, snack, dessert, drinks

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
ALTER TABLE dining_options ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit dining options for their own trips
CREATE POLICY "Users can view their own dining options"
  ON dining_options FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own dining options"
  ON dining_options FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own dining options"
  ON dining_options FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own dining options"
  ON dining_options FOR DELETE
  USING (user_id = auth.uid());

-- Index for fast lookups by trip
CREATE INDEX idx_dining_options_trip_id ON dining_options(trip_id);
CREATE INDEX idx_dining_options_scheduled_date ON dining_options(scheduled_date);
