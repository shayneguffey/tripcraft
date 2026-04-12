-- Budget Items table: stores manual/miscellaneous expenses not captured by other modules
-- Each item belongs to a trip
CREATE TABLE budget_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid(),

  -- Item info
  name TEXT NOT NULL,
  category TEXT DEFAULT 'other',
    -- categories: shopping, tips, insurance, visa, sim_card, souvenirs, parking, tolls, laundry, medical, other
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  scheduled_date DATE,    -- optional: which trip day
  notes TEXT,
  is_paid BOOLEAN DEFAULT false,

  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget items"
  ON budget_items FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own budget items"
  ON budget_items FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own budget items"
  ON budget_items FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own budget items"
  ON budget_items FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX idx_budget_items_trip_id ON budget_items(trip_id);
