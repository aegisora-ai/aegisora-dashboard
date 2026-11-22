-- Answers collected by the first-sign-in wizard (company size, role, agent stack).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding jsonb;