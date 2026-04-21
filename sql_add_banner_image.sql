-- Add banner_image column to trips table
-- Stores the URL of the AI-generated panoramic banner for the trip planning page

ALTER TABLE trips ADD COLUMN IF NOT EXISTS banner_image TEXT;
