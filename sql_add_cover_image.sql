-- Add cover_image column to trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS cover_image TEXT;
