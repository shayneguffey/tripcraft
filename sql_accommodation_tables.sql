-- Accommodation Options table: stores hotel/airbnb/hostel options for comparison
-- Each accommodation belongs to a trip and can be marked as booked
CREATE TABLE accommodation_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid(),

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'hotel',
    -- categories: hotel, airbnb, hostel, resort, vacation_rental, boutique, other

  -- Pricing
  price_per_night NUMERIC(10,2),
  total_price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',

  -- Dates
  check_in_date DATE,
  check_out_date DATE,

  -- Room details
  room_type TEXT,            -- e.g. "Private Room", "Entire Place", "Shared Room"
  bedrooms INTEGER,
  bathrooms INTEGER,
  max_guests INTEGER,

  -- Rating & reviews
  rating NUMERIC(2,1),       -- e.g. 4.7
  review_count INTEGER,

  -- Amenities & policies
  amenities TEXT,            -- comma-separated: wifi, kitchen, pool, parking, ac, etc.
  cancellation_policy TEXT,

  -- Location
  location_name TEXT,        -- e.g. "Sukhumvit District", "Old Town"
  address TEXT,
  distance_info TEXT,        -- e.g. "5 min walk to city center"

  -- Provider info
  provider TEXT,             -- e.g. "Booking.com", "Airbnb", "Hotels.com"
  source_url TEXT,
  screenshot_url TEXT,       -- stored as base64 data URL

  -- Status
  is_selected BOOLEAN DEFAULT false,
  is_booked BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE accommodation_options ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit accommodations for their own trips
CREATE POLICY "Users can view their own accommodations"
  ON accommodation_options FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own accommodations"
  ON accommodation_options FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own accommodations"
  ON accommodation_options FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own accommodations"
  ON accommodation_options FOR DELETE
  USING (user_id = auth.uid());

-- Index for fast lookups by trip
CREATE INDEX idx_accommodation_options_trip_id ON accommodation_options(trip_id);
CREATE INDEX idx_accommodation_options_check_in_date ON accommodation_options(check_in_date);
CREATE INDEX idx_accommodation_options_check_out_date ON accommodation_options(check_out_date);
