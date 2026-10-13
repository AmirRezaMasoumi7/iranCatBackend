-- Generated from local DB — safe to re-run (upsert by name)
BEGIN;

INSERT INTO public.price (name, price) VALUES
  ('USD', 150000.00),
  ('damping', 0.20),
  ('palladium', 70.00),
  ('platinum', 100.00),
  ('rhodium', 400.00)
ON CONFLICT (name) DO UPDATE SET price = EXCLUDED.price;

COMMIT;
