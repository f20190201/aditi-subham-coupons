-- Delete the requested existing coupons
DELETE FROM public.coupons 
WHERE slug IN (
  'breakfast-in-bed',
  'day-off-chores',
  'ice-cream-run',
  'skip-event',
  'handwritten-letter',
  'foot-massage'
);

-- Insert the new romantic coupons
INSERT INTO public.coupons (slug, title, description, emoji, cooldown_days, max_uses, sort_order) VALUES
  ('come-be-with-me', 'Come Be With Me', 'When I just need to feel your presence and know I''m desired. Drop what you''re doing and come over.', '❤️‍🔥', 75, NULL, 130),
  ('memory-lane', 'A Walk Down Memory Lane', 'Let''s pause and relive one of our favorite memories. From our first kiss to the cutest little moments, we talk about it until our hearts are full.', '✨', 21, NULL, 140),
  ('spicy-yours', 'Spicy & Yours', 'Feeling a little fiery. Whether it''s whispered words(when we''re away) or closing the door behind(when we''re together) us, your full, undivided, attention is required. Let''s get naked!', '🌶️', 10, NULL, 150),
  ('spoil-me', 'Spoil Me Rotten', 'No more sharing you with the world. For right now, you are completely at my service, ready to pamper, baby, and dote on me.', '🧸', 30, NULL, 160),
  ('gentle-realignment', 'A Gentle Realignment', 'A safe space for an honest conversation. Something has been weighing on my mind, and we need to talk it through and fix it together.', '🛋️', 150, NULL, 170);
