-- Planning Checklist and Packing List tables
-- Run this in Supabase SQL Editor

-- ═══ PLANNING CHECKLIST ═══
CREATE TABLE planning_checklist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE planning_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their planning checklist"
  ON planning_checklist FOR ALL
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()))
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

-- ═══ PACKING LIST ═══
CREATE TABLE packing_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  is_packed BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE packing_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their packing list"
  ON packing_list FOR ALL
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()))
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));
