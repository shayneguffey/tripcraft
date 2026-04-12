-- Add num_travelers column to trips table
-- AND num_passengers column to flight_options table
-- Run this in Supabase SQL Editor

-- Trips: how many people are traveling
ALTER TABLE trips ADD COLUMN IF NOT EXISTS num_travelers integer DEFAULT 1;
UPDATE trips SET num_travelers = 1 WHERE num_travelers IS NULL;

-- Flight options: how many passengers this flight price covers
ALTER TABLE flight_options ADD COLUMN IF NOT EXISTS num_passengers integer DEFAULT 1;
UPDATE flight_options SET num_passengers = 1 WHERE num_passengers IS NULL;
