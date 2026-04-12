-- Travel Documents table + Supabase Storage setup
-- Run this in Supabase SQL Editor

-- ═══ TRAVEL DOCUMENTS TABLE ═══
CREATE TABLE travel_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  doc_type TEXT DEFAULT 'general',        -- booking, visa, insurance, passport, itinerary, receipt, voucher, map, ticket, general
  category TEXT DEFAULT 'other',          -- flights, accommodation, transport, activities, personal, financial, other
  file_url TEXT,                          -- Supabase Storage URL or external share link
  thumbnail_url TEXT,                     -- screenshot/preview image stored in Supabase Storage
  file_type TEXT,                         -- image/png, application/pdf, etc.
  file_size INTEGER,                      -- bytes
  source TEXT DEFAULT 'upload',           -- upload, screenshot, share_link
  reference_number TEXT,                  -- booking ref, policy number, etc. extracted by AI
  dates TEXT,                             -- relevant dates extracted by AI
  provider TEXT,                          -- airline, hotel, insurance company, etc.
  ai_summary TEXT,                        -- AI-generated brief summary
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE travel_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their travel documents"
  ON travel_documents FOR ALL
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()))
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

-- ═══ SUPABASE STORAGE BUCKET ═══
-- Run these one at a time if needed:

-- Create the storage bucket for travel documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('travel-docs', 'travel-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to travel-docs bucket
CREATE POLICY "Users can upload travel docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'travel-docs'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to read their files
CREATE POLICY "Users can read travel docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'travel-docs'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete their files
CREATE POLICY "Users can delete travel docs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'travel-docs'
    AND auth.role() = 'authenticated'
  );
