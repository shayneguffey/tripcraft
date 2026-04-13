-- Create wish list table
CREATE TABLE IF NOT EXISTS wish_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  destination TEXT NOT NULL,
  notes TEXT,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE wish_list ENABLE ROW LEVEL SECURITY;

-- Users can only see their own wish list items
CREATE POLICY "Users can view own wish list" ON wish_list
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own wish list" ON wish_list
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own wish list" ON wish_list
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own wish list" ON wish_list
  FOR DELETE USING (user_id = auth.uid());
