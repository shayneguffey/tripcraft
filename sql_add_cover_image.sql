-- Add cover_image and archived columns to trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
