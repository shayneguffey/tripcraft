-- Transportation Options table: stores car rentals, trains, buses, ferries, transfers, and rideshare options for comparison
-- Each transportation option belongs to a trip and can be marked as booked
CREATE TABLE transportation_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid(),

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'other',
    -- categories: car_rental, train, bus, ferry, transfer, rideshare, other

  -- Location/Route
  pickup_location TEXT,
  dropoff_location TEXT,

  -- Dates and times
  departure_date DATE,
  departure_time TEXT,        -- e.g. "09:00"
  arrival_date DATE,
  arrival_time TEXT,          -- e.g. "14:30"

  -- Duration
  duration_minutes INTEGER,

  -- Pricing
  price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  price_per TEXT DEFAULT 'total',
    -- 'total' (entire journey), 'person' (per passenger), 'day' (daily rate)

  -- Passengers and vehicle details
  passengers INTEGER,
  vehicle_type TEXT,          -- e.g. "economy", "SUV", "van", "private car", "shared shuttle", "speedboat"
  class_type TEXT,            -- e.g. "first class", "standard", "cabin"
  service_name TEXT,          -- route number, train name, ferry line, etc.
  is_private BOOLEAN DEFAULT false,

  -- Car rental specific
  insurance_included BOOLEAN DEFAULT false,
  mileage_policy TEXT,        -- "unlimited", "limited", etc.

  -- Provider and booking
  provider TEXT,              -- e.g. "Hertz", "Trainline", "FlixBus", "Rome2Rio"
  booking_reference TEXT,

  -- Rating & reviews
  rating NUMERIC(2,1),        -- e.g. 4.7
  review_count INTEGER,

  -- Source info
  source_url TEXT,
  screenshot_url TEXT,        -- stored as base64 data URL

  -- Status
  is_selected BOOLEAN DEFAULT false,
  is_booked BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE transportation_options ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit transportation for their own trips
CREATE POLICY "Users can view their own transportation"
  ON transportation_options FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own transportation"
  ON transportation_options FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own transportation"
  ON transportation_options FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own transportation"
  ON transportation_options FOR DELETE
  USING (user_id = auth.uid());

-- Index for fast lookups by trip
CREATE INDEX idx_transportation_options_trip_id ON transportation_options(trip_id);
CREATE INDEX idx_transportation_options_departure_date ON transportation_options(departure_date);
