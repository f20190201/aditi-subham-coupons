
-- Whitelist table
CREATE TABLE public.allowed_emails (
  email TEXT PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.allowed_emails TO authenticated;
GRANT ALL ON public.allowed_emails TO service_role;
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Whitelisted users can read whitelist"
  ON public.allowed_emails FOR SELECT TO authenticated
  USING (lower((auth.jwt() ->> 'email')) IN (SELECT lower(email) FROM public.allowed_emails));

-- Helper function: is current user whitelisted?
CREATE OR REPLACE FUNCTION public.is_whitelisted()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.allowed_emails
    WHERE lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- Coupons
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT,
  cooldown_days INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Whitelisted can read coupons"
  ON public.coupons FOR SELECT TO authenticated
  USING (public.is_whitelisted());

-- Activations log
CREATE TABLE public.coupon_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  activated_by_email TEXT NOT NULL,
  activated_by_user_id UUID NOT NULL,
  note TEXT,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX coupon_activations_coupon_idx ON public.coupon_activations(coupon_id, activated_at DESC);
GRANT SELECT, INSERT ON public.coupon_activations TO authenticated;
GRANT ALL ON public.coupon_activations TO service_role;
ALTER TABLE public.coupon_activations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Whitelisted can read activations"
  ON public.coupon_activations FOR SELECT TO authenticated
  USING (public.is_whitelisted());
CREATE POLICY "Whitelisted can insert own activations"
  ON public.coupon_activations FOR INSERT TO authenticated
  WITH CHECK (
    public.is_whitelisted()
    AND activated_by_user_id = auth.uid()
    AND lower(activated_by_email) = lower(auth.jwt() ->> 'email')
  );

-- Seed allowed emails
INSERT INTO public.allowed_emails (email, display_name) VALUES
  ('subhamptl00@gmail.com', 'Subham'),
  ('2aditi.dash@gmail.com', 'Aditi');

-- Seed coupons
INSERT INTO public.coupons (slug, title, description, emoji, cooldown_days, max_uses, sort_order) VALUES
  ('excuse-duration', 'Excuse Me for the Duration', 'I have tasks and heavy-lifting coming up for the next few days. I may not be as available as usual. I expect your cooperation and patience. ❤️', '🛠️', 90, NULL, 10),
  ('breakfast-in-bed', 'Breakfast in Bed', 'Redeem for one delicious breakfast served in bed, made with love and zero complaints.', '🍳', 30, NULL, 20),
  ('movie-night-pick', 'Movie Night, My Pick', 'I get to choose the movie tonight — no veto, no eye-rolls. Snacks included.', '🎬', 14, NULL, 30),
  ('long-hug', 'A Really Long Hug', 'Stop everything. Drop what you''re doing. One long, no-time-limit hug. Cashable anytime, anywhere.', '🤗', 0, NULL, 40),
  ('day-off-chores', 'Day Off from Chores', 'A full day where I take over all your chores. You rest. That''s the deal.', '🧺', 60, NULL, 50),
  ('random-date', 'Surprise Date Night', 'I plan everything — place, time, vibe. You just show up looking cute.', '💐', 45, NULL, 60),
  ('forgive-small', 'Free Forgiveness Pass', 'One small mistake — forgotten thing, late reply, dumb comment — wiped clean. No I-told-you-so.', '🕊️', 30, NULL, 70),
  ('rant-mode', 'Unlimited Rant Mode', 'I get one full hour to vent about anything. You just listen and nod. No fixing, no solutions.', '🗣️', 21, NULL, 80),
  ('foot-massage', '20-Minute Foot Massage', 'No questions asked. Just sit down and put your feet up.', '💆', 14, NULL, 90),
  ('ice-cream-run', 'Late Night Ice Cream Run', 'Whatever flavor, wherever it''s open. I''ll go get it.', '🍦', 7, NULL, 100),
  ('skip-event', 'Skip One Social Event', 'Get out of one party / wedding / family thing of your choice. I''ll handle the excuse.', '🫥', 120, NULL, 110),
  ('handwritten-letter', 'A Handwritten Love Letter', 'A real, on-paper, in-my-handwriting love letter. Delivered to your hands.', '💌', 180, NULL, 120);
