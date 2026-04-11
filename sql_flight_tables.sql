-- Flight Options: each trip can have multiple flight itinerary options to compare
CREATE TABLE flight_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Option',
  total_price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  source_url TEXT,
  screenshot_url TEXT,
  notes TEXT,
  is_selected BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Flight Legs: individual flight segments within an option
CREATE TABLE flight_legs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  option_id UUID NOT NULL REFERENCES flight_options(id) ON DELETE CASCADE,
  leg_order INTEGER DEFAULT 0,
  direction TEXT DEFAULT 'outbound',
  airline_code TEXT,
  airline_name TEXT,
  flight_number TEXT,
  departure_airport TEXT NOT NULL,
  arrival_airport TEXT NOT NULL,
  departure_date DATE,
  departure_time TIME,
  arrival_date DATE,
  arrival_time TIME,
  duration_minutes INTEGER,
  cabin_class TEXT DEFAULT 'economy',
  aircraft_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE flight_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_legs ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can manage flight options for their own trips
CREATE POLICY "Users can manage their flight options"
  ON flight_options FOR ALL
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()))
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their flight legs"
  ON flight_legs FOR ALL
  USING (option_id IN (
    SELECT fo.id FROM flight_options fo
    JOIN trips t ON fo.trip_id = t.id
    WHERE t.user_id = auth.uid()
  ))
  WITH CHECK (option_id IN (
    SELECT fo.id FROM flight_options fo
    JOIN trips t ON fo.trip_id = t.id
    WHERE t.user_id = auth.uid()
  ));
