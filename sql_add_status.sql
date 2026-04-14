-- Add status column to trips for card labeling
ALTER TABLE trips ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'planning';

-- Backfill: mark trips with past end dates as "traveled"
UPDATE trips SET status = 'traveled' WHERE end_date < CURRENT_DATE AND status = 'planning';
