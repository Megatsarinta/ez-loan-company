-- EasyLoan India - Initial database schema
-- Run this in your Supabase SQL Editor or with psql connected to your database.
-- Supabase: Project Settings -> SQL Editor -> New query -> paste and Run.

-- ==================== USERS ====================
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  cibil_score INTEGER NOT NULL DEFAULT 750,
  wallet_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  withdrawal_otp TEXT,
  personal_info_completed BOOLEAN NOT NULL DEFAULT FALSE,
  kyc_completed BOOLEAN NOT NULL DEFAULT FALSE,
  signature_completed BOOLEAN NOT NULL DEFAULT FALSE,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone_number);

-- ==================== ADMIN ====================
CREATE TABLE IF NOT EXISTS public.admin (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'SUPER_ADMIN',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================== PERSONAL INFO ====================
CREATE TABLE IF NOT EXISTS public.personal_info (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  id_type TEXT NOT NULL,
  id_number TEXT NOT NULL,
  gender TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  current_job TEXT NOT NULL,
  monthly_income NUMERIC(14,2) NOT NULL,
  loan_purpose TEXT NOT NULL,
  living_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_personal_info_user ON public.personal_info(user_id);

-- ==================== LOAN APPLICATIONS ====================
CREATE TABLE IF NOT EXISTS public.loan_applications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_number TEXT NOT NULL,
  amount_requested NUMERIC(14,2) NOT NULL,
  loan_term_months INTEGER NOT NULL,
  interest_rate NUMERIC(10,6) NOT NULL,
  annual_rate NUMERIC(10,4),
  status TEXT NOT NULL DEFAULT 'pending',
  currency TEXT NOT NULL DEFAULT 'INR',
  kyc_front_url TEXT,
  kyc_back_url TEXT,
  selfie_url TEXT,
  kyc_uploaded_at TIMESTAMPTZ,
  signature_url TEXT,
  is_signed BOOLEAN NOT NULL DEFAULT FALSE,
  signed_at TIMESTAMPTZ,
  admin_status_message TEXT,
  status_color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loan_applications_user ON public.loan_applications(user_id);

-- ==================== BANK DETAILS ====================
CREATE TABLE IF NOT EXISTS public.bank_details (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  branch TEXT NOT NULL,
  account_number TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_bank_details_user ON public.bank_details(user_id);

-- ==================== TRANSACTIONS ====================
CREATE TABLE IF NOT EXISTS public.transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  description TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);

-- ==================== LOANS (optional; app can use loan_applications alone) ====================
CREATE TABLE IF NOT EXISTS public.loans (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_number TEXT NOT NULL,
  order_number TEXT,
  status TEXT NOT NULL,
  status_color TEXT,
  status_description TEXT,
  loan_amount NUMERIC(14,2) NOT NULL,
  interest_rate NUMERIC(10,6) NOT NULL,
  annual_rate NUMERIC(10,4),
  loan_period_months INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  currency TEXT NOT NULL DEFAULT 'INR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loans_user ON public.loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_active ON public.loans(user_id, is_active) WHERE is_active = TRUE;

-- ==================== RLS (optional for Supabase; enable if using anon key with RLS) ====================
-- Uncomment and adjust if you use Row Level Security:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;
-- etc., and create policies as needed.
-- For server-side admin client (service role), RLS is bypassed, so tables work without policies.
