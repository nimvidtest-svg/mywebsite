ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '[{"label":"50ml","price":79},{"label":"70ml","price":99},{"label":"100ml","price":149}]'::jsonb;
