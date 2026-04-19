-- Saved packing list templates (user-created reusable templates)
-- Users can save their current packing list as a template and reuse it across trips.

CREATE TABLE saved_packing_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by user
CREATE INDEX idx_saved_packing_templates_user ON saved_packing_templates(user_id);

-- RLS: users can only manage their own templates
ALTER TABLE saved_packing_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own templates"
  ON saved_packing_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
  ON saved_packing_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON saved_packing_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON saved_packing_templates FOR DELETE
  USING (auth.uid() = user_id);

-- items JSONB format:
-- [
--   { "text": "Swimsuit", "category": "clothing" },
--   { "text": "Sunscreen", "category": "toiletries" },
--   ...
-- ]
