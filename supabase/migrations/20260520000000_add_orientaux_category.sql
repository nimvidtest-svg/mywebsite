ALTER TABLE perfumes
  DROP CONSTRAINT IF EXISTS perfumes_category_check;

ALTER TABLE perfumes
  ADD CONSTRAINT perfumes_category_check
  CHECK (category IN ('FEMMES','HOMMES','NICHE','BEST SELLERS','ORIENTAUX'));
