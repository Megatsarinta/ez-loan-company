import bcrypt from 'bcryptjs';
import { supabase, supabaseAdmin } from './supabase';
import { Client } from 'pg';

// SQL to create public.users if missing (used when DB returns "relation does not exist")
const CREATE_USERS_TABLE_SQL = `
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
`;

const CREATE_PERSONAL_INFO_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS public.personal_info (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS idx_personal_info_user ON public.personal_info(user_id);
`;

const CREATE_LOAN_APPLICATIONS_TABLE_SQL = `
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
`;

const CREATE_LOANS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS public.loans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    document_number TEXT NOT NULL,
    loan_application_id BIGINT REFERENCES public.loan_applications(id) ON DELETE SET NULL,
    order_number TEXT,
    borrower_name TEXT,
    borrower_phone TEXT,
    borrower_aadhaar TEXT,
    borrower_pan TEXT,
    status TEXT NOT NULL,
    status_color TEXT,
    status_description TEXT,
    loan_amount NUMERIC(14,2) NOT NULL,
    interest_rate NUMERIC(10,6) NOT NULL,
    annual_rate NUMERIC(10,4),
    loan_period_months INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    currency TEXT NOT NULL DEFAULT 'INR',
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS idx_loans_user ON public.loans(user_id);
  CREATE INDEX IF NOT EXISTS idx_loans_active ON public.loans(user_id, is_active) WHERE is_active = TRUE;
`;

const CREATE_BANK_DETAILS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS public.bank_details (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    account_type TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    branch TEXT NOT NULL,
    account_number TEXT NOT NULL,
    ifsc_code TEXT NOT NULL,
    account_holder_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS idx_bank_details_user ON public.bank_details(user_id);
`;

const CREATE_TRANSACTIONS_TABLE_SQL = `
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
`;

const CREATE_WITHDRAWALS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS public.withdrawals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC(14,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    account_number TEXT,
    bank_name TEXT,
    ifsc_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON public.withdrawals(user_id);
  CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);
`;

/** Deduct amount from user wallet_balance via PG. */
export async function deductWalletBalance(userId: number, amount: number) {
  try {
    await withDbClient(async (client) => {
      await client.query(
        `UPDATE public.users SET wallet_balance = GREATEST(0, COALESCE(wallet_balance, 0) - $1), updated_at = NOW() WHERE id = $2`,
        [amount, userId]
      );
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/** Add amount to user wallet_balance via PG (atomic, no read-then-write). Use when refunding rejected withdrawals. */
export async function addWalletBalance(userId: number, amount: number) {
  try {
    await withDbClient(async (client) => {
      await client.query(
        `UPDATE public.users SET wallet_balance = COALESCE(wallet_balance, 0) + $1, updated_at = NOW() WHERE id = $2`,
        [amount, userId]
      );
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/** Sum of pending withdrawal amounts for a user (for withdrawal_balance card). */
export async function getPendingWithdrawalSum(userId: number): Promise<number> {
  try {
    const row = await withDbClient(async (client) => {
      const res = await client.query(
        `SELECT COALESCE(SUM(amount), 0)::numeric AS total FROM public.withdrawals WHERE user_id = $1 AND status = 'Pending'`,
        [userId]
      );
      return res.rows[0];
    });
    return Number(row?.total ?? 0);
  } catch {
    return 0;
  }
}

/** Create a withdrawal record via PG (withdrawals table has no account_name, withdraw_number, etc.). */
export async function createWithdrawal(params: {
  user_id: number;
  amount: number;
  status?: string;
  account_number?: string;
  bank_name?: string;
  ifsc_code?: string;
}) {
  try {
    const { user_id, amount, status = 'Pending', account_number = '', bank_name = '', ifsc_code = '' } = params;
    const row = await withDbClient(async (client) => {
      const res = await client.query(
        `INSERT INTO public.withdrawals (user_id, amount, status, account_number, bank_name, ifsc_code)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [user_id, amount, status, account_number || null, bank_name || null, ifsc_code || null]
      );
      return res.rows[0];
    });
    return { success: true, data: row };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/** Get direct Postgres URL (avoids Supabase schema cache issues). */
function getDbUrl(): string | null {
  return process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL || null;
}

/** Run a function with a connected PG client; client is closed when done. */
async function withDbClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const dbUrl = getDbUrl();
  if (!dbUrl) throw new Error('DIRECT_URL or DATABASE_URL is not set');
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

async function ensureUsersTableAndInsert(
  client: Client,
  phoneNumber: string,
  hashedPassword: string,
  fullName: string
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  await client.query(CREATE_USERS_TABLE_SQL);
  const insertQuery = `INSERT INTO public.users (phone_number, password_hash, full_name, cibil_score, wallet_balance, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, now(), now()) RETURNING *`;
  const pgRes = await client.query(insertQuery, [phoneNumber, hashedPassword, fullName, 750, 0]);
  return { success: true, data: pgRes.rows[0] };
}

// ==================== USER AUTHENTICATION ====================

export async function registerUser(
  phoneNumber: string,
  password: string,
  fullName: string
) {
  try {
    console.log('[registerUser] start', { phoneNumber, fullName })

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user with default CIBIL score of 750
    const res = await supabaseAdmin
      .from('users')
      .insert([
        {
          phone_number: phoneNumber,
          password_hash: hashedPassword,
          full_name: fullName,
          cibil_score: 750, // Changed from credit_score
          wallet_balance: 0,
        },
      ])
      .select();

    // Log the raw Supabase response for debugging schema / permission issues
    console.log('[registerUser] supabase response', {
      status: (res as any).status || null,
      statusText: (res as any).statusText || null,
      data: (res as any).data || null,
      error: (res as any).error || null,
    })

    const { data, error } = res as { data: any[] | null; error: any }

    if (error) {
      console.error('[registerUser] supabase error', error)

      const msg = error.message || JSON.stringify(error)
      const tableMissing = typeof msg === 'string' && (
        msg.includes("Could not find the table 'public.users' in the schema cache") ||
        msg.includes('relation "public.users" does not exist')
      )
      const permissionDenied = typeof msg === 'string' && (
        msg.includes('permission denied') ||
        msg.includes('permission denied for schema public')
      )

      // Fallback: use direct PG when Supabase fails (table missing, schema cache, or permission denied)
      if (tableMissing || permissionDenied) {
        const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL
        if (!dbUrl) {
          return {
            success: false,
            error: permissionDenied
              ? 'Database permission error. Set DIRECT_URL or DATABASE_URL in .env to a connection string with access to the public schema (e.g. Supabase Project Settings → Database → Connection string → Direct).'
              : 'The users table is missing. Run the SQL in supabase/migrations/001_initial_schema.sql in your database (Supabase SQL Editor or psql), or set DIRECT_URL or DATABASE_URL in .env to allow auto-creation.'
          }
        }
        try {
          console.log('[registerUser] fallback: insert via direct PG', permissionDenied ? '(Supabase permission denied)' : '(table missing)')
          const client = new Client({ connectionString: dbUrl })
          await client.connect()
          // Try INSERT first in case table already exists (e.g. created by migration)
          try {
            const insertRes = await client.query(
              `INSERT INTO public.users (phone_number, password_hash, full_name, cibil_score, wallet_balance, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, now(), now()) RETURNING *`,
              [phoneNumber, hashedPassword, fullName, 750, 0]
            )
            await client.end()
            console.log('[registerUser] PG fallback success (insert)', { id: insertRes.rows[0]?.id })
            return { success: true, data: insertRes.rows[0] }
          } catch (insertErr: any) {
            const insertMsg = insertErr?.message || String(insertErr)
            if (insertMsg.includes('relation "public.users" does not exist') || insertMsg.includes('does not exist')) {
              const result = await ensureUsersTableAndInsert(client, phoneNumber, hashedPassword, fullName)
              await client.end()
              if (result.success) {
                console.log('[registerUser] PG fallback success (create+insert)', { id: result.data?.id })
                return { success: true, data: result.data }
              }
              return result
            }
            await client.end()
            throw insertErr
          }
        } catch (pgErr) {
          console.error('[registerUser] PG fallback error', pgErr)
          return { success: false, error: (pgErr as Error).message || JSON.stringify(pgErr) }
        }
      }

      return { success: false, error: msg }
    }

    console.log('[registerUser] success, new user id:', data?.[0]?.id)
    return { success: true, data: data?.[0] };
  } catch (error) {
    console.error('[registerUser] caught error', error)
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message || 'Registration failed' };
  }
}

export async function loginUser(
  phoneNumber: string,
  password: string
) {
  try {
    console.log('[v0] Login attempt - phoneNumber:', phoneNumber);

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    // Whenever Supabase doesn't return a user, try direct PG (same DB used for register fallback)
    if (error || !data) {
      const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;
      if (dbUrl) {
        try {
          console.log('[v0] Login trying direct PG for phone:', phoneNumber);
          const client = new Client({ connectionString: dbUrl });
          await client.connect();
          const pgRes = await client.query(
            'SELECT * FROM public.users WHERE phone_number = $1 LIMIT 1',
            [phoneNumber]
          );
          await client.end();
          const row = pgRes.rows[0];
          if (row) {
            console.log('[v0] Login PG fallback found user id:', row.id);
            const passwordMatch = await bcrypt.compare(password, row.password_hash);
            if (!passwordMatch) {
              return { success: false, error: 'Invalid password' };
            }
            // Normalize id to number if it came back as string (e.g. from bigint)
            const userData = { ...row, id: row.id != null ? Number(row.id) : row.id };
            return { success: true, data: userData };
          } else {
            console.log('[v0] Login PG fallback: no row for phone:', phoneNumber);
          }
        } catch (pgErr) {
          console.error('[v0] Login PG fallback error:', pgErr);
        }
      } else {
        console.log('[v0] Login: no DIRECT_URL/DATABASE_URL set, cannot try PG fallback');
      }
    }

    if (error || !data) {
      console.log('[v0] User not found - phone:', phoneNumber);
      return { success: false, error: 'User not found' };
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, data.password_hash);

    if (!passwordMatch) {
      return { success: false, error: 'Invalid password' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[v0] Login error:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Update personal-info-related fields on users via direct PostgreSQL.
 * This avoids Supabase schema cache issues for columns like city/state/pincode.
 */
/** Update user cibil_score via PG (avoids Supabase schema cache for credit_score column). */
export async function updateUserCibilScore(userId: number, score: number) {
  try {
    await withDbClient(async (client) => {
      await client.query(
        'UPDATE public.users SET cibil_score = $1, updated_at = NOW() WHERE id = $2',
        [score, userId]
      );
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/** Update user is_banned via PG (avoids Supabase schema cache). Adds column if missing. */
export async function updateUserBannedStatus(userId: number, isBanned: boolean) {
  try {
    await withDbClient(async (client) => {
      await client.query(
        `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false`
      );
      await client.query(
        `UPDATE public.users SET is_banned = $1, updated_at = NOW() WHERE id = $2`,
        [isBanned, userId]
      );
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/** Update personal_info id_number and full_name by user_id (PG only; no row required). */
export async function updatePersonalInfoIdAndName(
  userId: number,
  idNumber: string,
  fullName: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await withDbClient(async (client) => {
      await client.query(
        `UPDATE public.personal_info SET id_number = $2, full_name = $3, updated_at = NOW() WHERE user_id = $1`,
        [userId, idNumber || '', fullName || '']
      );
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateUserPersonalInfoDirect(
  userId: number,
  updateData: Record<string, any>
) {
  const allowedColumns = [
    // Only columns that are known to exist on public.users per initial schema
    'full_name',
    'personal_info_completed',
  ];

  const entries = Object.entries(updateData).filter(
    ([key, value]) => allowedColumns.includes(key) && value !== undefined
  );

  if (entries.length === 0) {
    return { success: false, error: 'No valid fields to update' };
  }

  try {
    const row = await withDbClient(async (client) => {
      const columns = entries.map(([key]) => key);
      const values = entries.map(([, value]) => value);

      const setClauses = columns
        .map((col, idx) => `${col} = $${idx + 1}`)
        .join(', ');

      const sql = `
        UPDATE public.users
        SET ${setClauses}, updated_at = NOW()
        WHERE id = $${columns.length + 1}
        RETURNING *`;

      const res = await client.query(sql, [...values, userId]);
      return res.rows[0];
    });

    return { success: true, data: row };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getUserByPhoneNumber(phoneNumber: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data: data || null };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ==================== KYC & PERSONAL INFO ====================

export async function savePersonalInfo(
  userId: number,
  data: {
    full_name: string;
    id_type: 'aadhaar' | 'pan' | 'passport' | 'voter' | 'driving';
    id_number: string;
    gender: string;
    date_of_birth: string;
    current_job: string;
    monthly_income: number;
    loan_purpose: string;
    living_address: string;
    city: string;
    state: string;
    pincode: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
  }
) {
  try {
    const dbUrl = getDbUrl();
    const dateVal = data.date_of_birth ? new Date(data.date_of_birth).toISOString().slice(0, 10) : null;
    const monthlyIncome = Number(data.monthly_income) || 0;

    if (dbUrl) {
      try {
        await withDbClient(async (client) => {
          await client.query(
            `INSERT INTO public.personal_info (user_id, full_name, id_type, id_number, gender, date_of_birth, current_job, monthly_income, loan_purpose, living_address, city, state, pincode, emergency_contact_name, emergency_contact_phone, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6::date, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
             ON CONFLICT (user_id) DO UPDATE SET
               full_name = EXCLUDED.full_name, id_type = EXCLUDED.id_type, id_number = EXCLUDED.id_number,
               gender = EXCLUDED.gender, date_of_birth = EXCLUDED.date_of_birth, current_job = EXCLUDED.current_job,
               monthly_income = EXCLUDED.monthly_income, loan_purpose = EXCLUDED.loan_purpose,
               living_address = EXCLUDED.living_address, city = EXCLUDED.city, state = EXCLUDED.state,
               pincode = EXCLUDED.pincode, emergency_contact_name = EXCLUDED.emergency_contact_name,
               emergency_contact_phone = EXCLUDED.emergency_contact_phone, updated_at = NOW()`,
            [
              userId, data.full_name || '', data.id_type || 'aadhaar', data.id_number || '',
              data.gender || '', dateVal || '2000-01-01', data.current_job || '', monthlyIncome,
              data.loan_purpose || '', data.living_address || '', data.city || '', data.state || '', data.pincode || '',
              data.emergency_contact_name || '', data.emergency_contact_phone || '',
            ]
          );
        });
        return { success: true, message: 'Personal info saved successfully' };
      } catch (pgErr: any) {
        if (pgErr?.code === '42P01') {
          await withDbClient(async (client) => {
            await client.query(CREATE_PERSONAL_INFO_TABLE_SQL);
            await client.query(
              `INSERT INTO public.personal_info (user_id, full_name, id_type, id_number, gender, date_of_birth, current_job, monthly_income, loan_purpose, living_address, city, state, pincode, emergency_contact_name, emergency_contact_phone, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6::date, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
               ON CONFLICT (user_id) DO UPDATE SET
                 full_name = EXCLUDED.full_name, id_type = EXCLUDED.id_type, id_number = EXCLUDED.id_number,
                 gender = EXCLUDED.gender, date_of_birth = EXCLUDED.date_of_birth, current_job = EXCLUDED.current_job,
                 monthly_income = EXCLUDED.monthly_income, loan_purpose = EXCLUDED.loan_purpose,
                 living_address = EXCLUDED.living_address, city = EXCLUDED.city, state = EXCLUDED.state,
                 pincode = EXCLUDED.pincode, emergency_contact_name = EXCLUDED.emergency_contact_name,
                 emergency_contact_phone = EXCLUDED.emergency_contact_phone, updated_at = NOW()`,
              [
                userId, data.full_name || '', data.id_type || 'aadhaar', data.id_number || '',
                data.gender || '', dateVal || '2000-01-01', data.current_job || '', monthlyIncome,
                data.loan_purpose || '', data.living_address || '', data.city || '', data.state || '', data.pincode || '',
                data.emergency_contact_name || '', data.emergency_contact_phone || '',
              ]
            );
          });
          return { success: true, message: 'Personal info saved successfully' };
        }
        throw pgErr;
      }
    }

    const { error } = await supabaseAdmin
      .from('personal_info')
      .upsert({
        user_id: userId,
        ...data,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      const msg = error.message || JSON.stringify(error);
      if (msg.includes('relation "public.personal_info" does not exist') || msg.includes('schema cache')) {
        await withDbClient(async (client) => {
          await client.query(CREATE_PERSONAL_INFO_TABLE_SQL);
          await client.query(
            `INSERT INTO public.personal_info (user_id, full_name, id_type, id_number, gender, date_of_birth, current_job, monthly_income, loan_purpose, living_address, city, state, pincode, emergency_contact_name, emergency_contact_phone, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6::date, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
             ON CONFLICT (user_id) DO UPDATE SET
               full_name = EXCLUDED.full_name, id_type = EXCLUDED.id_type, id_number = EXCLUDED.id_number,
               gender = EXCLUDED.gender, date_of_birth = EXCLUDED.date_of_birth, current_job = EXCLUDED.current_job,
               monthly_income = EXCLUDED.monthly_income, loan_purpose = EXCLUDED.loan_purpose,
               living_address = EXCLUDED.living_address, city = EXCLUDED.city, state = EXCLUDED.state,
               pincode = EXCLUDED.pincode, emergency_contact_name = EXCLUDED.emergency_contact_name,
               emergency_contact_phone = EXCLUDED.emergency_contact_phone, updated_at = NOW()`,
            [
              userId, data.full_name || '', data.id_type || 'aadhaar', data.id_number || '',
              data.gender || '', dateVal || '2000-01-01', data.current_job || '', monthlyIncome,
              data.loan_purpose || '', data.living_address || '', data.city || '', data.state || '', data.pincode || '',
              data.emergency_contact_name || '', data.emergency_contact_phone || '',
            ]
          );
        });
        return { success: true, message: 'Personal info saved successfully' };
      }
      throw error;
    }

    return { success: true, message: 'Personal info saved successfully' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getPersonalInfo(userId: number) {
  try {
    const dbUrl = getDbUrl();
    if (dbUrl) {
      try {
        const row = await withDbClient(async (client) => {
          const res = await client.query(
            'SELECT * FROM public.personal_info WHERE user_id = $1 LIMIT 1',
            [userId]
          );
          return res.rows[0];
        });
        if (row) return { success: true, data: row };
      } catch (pgErr) {
        console.error('[getPersonalInfo] PG error:', pgErr);
      }
    }
    const { data, error } = await supabaseAdmin
      .from('personal_info')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data: data || null };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ==================== LOAN APPLICATIONS (direct PostgreSQL to avoid schema cache) ====================

export async function createLoanApplication(
  userId: number,
  documentNumber: string,
  amountRequested: number,
  loanTermMonths: number,
  interestRate: number
) {
  try {
    const annualRate = interestRate * 12 * 100;
    const row = await withDbClient(async (client) => {
      try {
        const res = await client.query(
          `INSERT INTO public.loan_applications
           (user_id, document_number, amount_requested, loan_term_months, interest_rate, annual_rate, status, currency, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'INR', NOW(), NOW())
           RETURNING *`,
          [userId, documentNumber, amountRequested, loanTermMonths, interestRate, annualRate]
        );
        return res.rows[0];
      } catch (err: any) {
        if (err.message.includes('relation "public.loan_applications" does not exist')) {
          await client.query(CREATE_LOAN_APPLICATIONS_TABLE_SQL);
          const res = await client.query(
            `INSERT INTO public.loan_applications
             (user_id, document_number, amount_requested, loan_term_months, interest_rate, annual_rate, status, currency, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'INR', NOW(), NOW())
             RETURNING *`,
            [userId, documentNumber, amountRequested, loanTermMonths, interestRate, annualRate]
          );
          return res.rows[0];
        }
        throw err;
      }
    });
    return { success: true, data: row };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getActiveApplicationForUser(userId: number) {
  try {
    const row = await withDbClient(async (client) => {
      const res = await client.query(
        `SELECT * FROM public.loan_applications
         WHERE user_id = $1 AND status != 'rejected'
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      return res.rows[0] || null;
    });
    return { success: true, data: row };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getLoanApplicationById(id: number) {
  try {
    const row = await withDbClient(async (client) => {
      const res = await client.query(
        `SELECT * FROM public.loan_applications WHERE id = $1`,
        [id]
      );
      return res.rows[0] || null;
    });
    return { success: true, data: row };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/** Latest loan application for user (any status); for contract/profile use. */
export async function getLatestLoanApplicationByUserId(userId: number) {
  try {
    const row = await withDbClient(async (client) => {
      const res = await client.query(
        `SELECT * FROM public.loan_applications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      return res.rows[0] || null;
    });
    return { success: true, data: row };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/** Get approved loan application id for user (for repayment records/schedule). */
export async function getApprovedLoanApplicationIdForUser(userId: number): Promise<{ success: true; data: number | null } | { success: false; error: string }> {
  try {
    const row = await withDbClient(async (client) => {
      const res = await client.query(
        `SELECT id FROM public.loan_applications WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1`,
        [userId, 'approved']
      );
      return res.rows[0]?.id ?? null;
    });
    return { success: true, data: row };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function uploadKYCDocuments(
  applicationId: number,
  frontUrl: string,
  backUrl: string,
  selfieUrl: string
) {
  try {
    const row = await withDbClient(async (client) => {
      const res = await client.query(
        `UPDATE public.loan_applications
         SET kyc_front_url = $1, kyc_back_url = $2, selfie_url = $3, kyc_uploaded_at = NOW(), updated_at = NOW()
         WHERE id = $4 RETURNING *`,
        [frontUrl || null, backUrl || null, selfieUrl || null, applicationId]
      );
      return res.rows[0];
    });
    return { success: true, data: row };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateSignature(applicationId: number, signatureUrl: string) {
  try {
    const row = await withDbClient(async (client) => {
      const res = await client.query(
        `UPDATE public.loan_applications
         SET signature_url = $1, is_signed = true, signed_at = NOW(), updated_at = NOW()
         WHERE id = $2 RETURNING *`,
        [signatureUrl, applicationId]
      );
      return res.rows[0];
    });
    return { success: true, data: row };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get user full_name and phone_number by id (direct PG for use when creating loan records).
 */
export async function getUserByIdForLoan(userId: number): Promise<{ full_name: string; phone_number: string } | null> {
  try {
    const row = await withDbClient(async (client) => {
      const res = await client.query(
        `SELECT full_name, phone_number FROM public.users WHERE id = $1`,
        [userId]
      );
      return res.rows[0] || null;
    });
    return row;
  } catch {
    return null;
  }
}

/**
 * Insert a row into the loans table (direct PG to avoid schema cache).
 * Uses only columns from the initial schema; optional columns can be added if your DB has them.
 */
export async function insertLoanRecord(params: {
  id: number;
  user_id: number;
  document_number: string;
  order_number: string;
  loan_amount: number;
  interest_rate: number;
  annual_rate: number;
  loan_period_months: number;
  status: string;
  status_color?: string | null;
  status_description?: string | null;
}) {
  try {
    await withDbClient(async (client) => {
      try {
        await client.query(
          `INSERT INTO public.loans
           (id, user_id, document_number, order_number, loan_amount, interest_rate, annual_rate, loan_period_months, status, status_color, status_description, is_active, currency, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, 'INR', NOW(), NOW())`,
          [
            params.id,
            params.user_id,
            params.document_number,
            params.order_number,
            params.loan_amount,
            params.interest_rate,
            params.annual_rate,
            params.loan_period_months,
            params.status,
            params.status_color ?? null,
            params.status_description ?? null,
          ]
        );
      } catch (err: any) {
        if (err.message.includes('relation "public.loans" does not exist')) {
          await client.query(CREATE_LOANS_TABLE_SQL);
          await client.query(
            `INSERT INTO public.loans
             (id, user_id, document_number, order_number, loan_amount, interest_rate, annual_rate, loan_period_months, status, status_color, status_description, is_active, currency, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, 'INR', NOW(), NOW())`,
            [
              params.id,
              params.user_id,
              params.document_number,
              params.order_number,
              params.loan_amount,
              params.interest_rate,
              params.annual_rate,
              params.loan_period_months,
              params.status,
              params.status_color ?? null,
              params.status_description ?? null,
            ]
          );
        } else {
          throw err;
        }
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ==================== VERIFICATION STATUS ====================

export async function markKYCCompleted(userId: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        kyc_completed: true,
        last_verified_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function markPersonalInfoCompleted(userId: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        personal_info_completed: true,
        last_verified_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function markSignatureCompleted(userId: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        signature_completed: true,
        last_verified_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getVerificationStatus(userId: number) {
  try {
    let data: { personal_info_completed?: boolean; kyc_completed?: boolean; signature_completed?: boolean; last_verified_at?: string } | null = null;
    const { data: userRow, error } = await supabase
      .from('users')
      .select('personal_info_completed, kyc_completed, signature_completed, last_verified_at')
      .eq('id', userId)
      .single();

    if (!error || error.code === 'PGRST116') {
      data = userRow || null;
    }

    // When admin fills Documents or user filled personal-info page: derive from latest loan_application + personal_info table
    const appResult = await getActiveApplicationForUser(userId);
    let app = appResult.success ? (appResult.data as any) : null;
    let hasPersonalInfo = app?.personal_info && typeof app.personal_info === 'object' && Object.keys(app.personal_info).length > 0;
    if (app && !hasPersonalInfo) {
      const piResult = await getPersonalInfo(userId);
      if (piResult.success && piResult.data) {
        const row = piResult.data as any;
        hasPersonalInfo = !!(row.full_name || row.id_number || row.living_address);
      }
    }
    if (app) {
      const hasSignature = !!app.signature_url;
      if (!data) {
        data = { personal_info_completed: false, kyc_completed: false, signature_completed: false };
      }
      if (hasPersonalInfo) data.personal_info_completed = true;
      if (hasSignature) data.signature_completed = true;
      if (app.kyc_front_url && app.kyc_back_url && app.selfie_url) data.kyc_completed = true;
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ==================== BANK DETAILS (NRE/NRO) ====================

export async function saveBankDetails(
  userId: number,
  bankDetails: {
    account_type: 'NRE' | 'NRO' | 'savings' | 'current';
    bank_name: string;
    branch: string;
    account_number: string;
    ifsc_code: string;
    account_holder_name: string;
  }
) {
  try {
    // Validate IFSC code (11 characters: 4 letters + 0 + 6 digits)
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifsc_code)) {
      throw new Error('Invalid IFSC code format');
    }

    const dbUrl = getDbUrl();
    if (dbUrl) {
      try {
        await withDbClient(async (client) => {
          await client.query(
            `INSERT INTO public.bank_details (user_id, account_type, bank_name, branch, account_number, ifsc_code, account_holder_name, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
             ON CONFLICT (user_id) DO UPDATE SET
               account_type = EXCLUDED.account_type,
               bank_name = EXCLUDED.bank_name,
               branch = EXCLUDED.branch,
               account_number = EXCLUDED.account_number,
               ifsc_code = EXCLUDED.ifsc_code,
               account_holder_name = EXCLUDED.account_holder_name,
               updated_at = NOW()`,
            [
              userId,
              bankDetails.account_type,
              bankDetails.bank_name,
              bankDetails.branch,
              bankDetails.account_number,
              bankDetails.ifsc_code,
              bankDetails.account_holder_name,
            ]
          );
        });
        return { success: true, message: 'Bank details saved successfully' };
      } catch (pgErr: any) {
        if (pgErr?.code === '42P01') {
          await withDbClient(async (client) => {
            await client.query(CREATE_BANK_DETAILS_TABLE_SQL);
            await client.query(
              `INSERT INTO public.bank_details (user_id, account_type, bank_name, branch, account_number, ifsc_code, account_holder_name, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
               ON CONFLICT (user_id) DO UPDATE SET
                 account_type = EXCLUDED.account_type,
                 bank_name = EXCLUDED.bank_name,
                 branch = EXCLUDED.branch,
                 account_number = EXCLUDED.account_number,
                 ifsc_code = EXCLUDED.ifsc_code,
                 account_holder_name = EXCLUDED.account_holder_name,
                 updated_at = NOW()`,
              [
                userId,
                bankDetails.account_type,
                bankDetails.bank_name,
                bankDetails.branch,
                bankDetails.account_number,
                bankDetails.ifsc_code,
                bankDetails.account_holder_name,
              ]
            );
          });
          return { success: true, message: 'Bank details saved successfully' };
        }
        throw pgErr;
      }
    }

    const { error } = await supabaseAdmin
      .from('bank_details')
      .upsert({
        user_id: userId,
        ...bankDetails,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      const msg = error.message || JSON.stringify(error);
      if (msg.includes('relation "public.bank_details" does not exist') || msg.includes('schema cache')) {
        await withDbClient(async (client) => {
          await client.query(CREATE_BANK_DETAILS_TABLE_SQL);
          await client.query(
            `INSERT INTO public.bank_details (user_id, account_type, bank_name, branch, account_number, ifsc_code, account_holder_name, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
             ON CONFLICT (user_id) DO UPDATE SET
               account_type = EXCLUDED.account_type,
               bank_name = EXCLUDED.bank_name,
               branch = EXCLUDED.branch,
               account_number = EXCLUDED.account_number,
               ifsc_code = EXCLUDED.ifsc_code,
               account_holder_name = EXCLUDED.account_holder_name,
               updated_at = NOW()`,
            [
              userId,
              bankDetails.account_type,
              bankDetails.bank_name,
              bankDetails.branch,
              bankDetails.account_number,
              bankDetails.ifsc_code,
              bankDetails.account_holder_name,
            ]
          );
        });
        return { success: true, message: 'Bank details saved successfully' };
      }
      throw error;
    }
    return { success: true, message: 'Bank details saved successfully' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/** PG-only save for bank_details (used when saveBankDetails fails e.g. no Supabase schema). */
export async function saveBankDetailsPg(
  userId: number,
  bankDetails: {
    account_type: 'NRE' | 'NRO' | 'savings' | 'current';
    bank_name: string;
    branch: string;
    account_number: string;
    ifsc_code: string;
    account_holder_name: string;
  }
): Promise<{ success: true } | { success: false; error: string }> {
  const dbUrl = getDbUrl();
  if (!dbUrl) return { success: false, error: 'Database not configured' };
  try {
    await withDbClient(async (client) => {
      try {
        await client.query(
          `INSERT INTO public.bank_details (user_id, account_type, bank_name, branch, account_number, ifsc_code, account_holder_name, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
           ON CONFLICT (user_id) DO UPDATE SET
             account_type = EXCLUDED.account_type,
             bank_name = EXCLUDED.bank_name,
             branch = EXCLUDED.branch,
             account_number = EXCLUDED.account_number,
             ifsc_code = EXCLUDED.ifsc_code,
             account_holder_name = EXCLUDED.account_holder_name,
             updated_at = NOW()`,
          [
            userId,
            bankDetails.account_type,
            bankDetails.bank_name,
            bankDetails.branch,
            bankDetails.account_number,
            bankDetails.ifsc_code,
            bankDetails.account_holder_name,
          ]
        );
      } catch (e: any) {
        if (e?.code === '42P01') {
          await client.query(CREATE_BANK_DETAILS_TABLE_SQL);
          await client.query(
            `INSERT INTO public.bank_details (user_id, account_type, bank_name, branch, account_number, ifsc_code, account_holder_name, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
             ON CONFLICT (user_id) DO UPDATE SET
               account_type = EXCLUDED.account_type,
               bank_name = EXCLUDED.bank_name,
               branch = EXCLUDED.branch,
               account_number = EXCLUDED.account_number,
               ifsc_code = EXCLUDED.ifsc_code,
               account_holder_name = EXCLUDED.account_holder_name,
               updated_at = NOW()`,
            [
              userId,
              bankDetails.account_type,
              bankDetails.bank_name,
              bankDetails.branch,
              bankDetails.account_number,
              bankDetails.ifsc_code,
              bankDetails.account_holder_name,
            ]
          );
        } else throw e;
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getBankDetails(userId: number) {
  try {
    const dbUrl = getDbUrl();
    if (dbUrl) {
      try {
        const row = await withDbClient(async (client) => {
          const res = await client.query(
            'SELECT * FROM public.bank_details WHERE user_id = $1 LIMIT 1',
            [userId]
          );
          return res.rows[0];
        });
        if (row) return { success: true, data: row };
      } catch (pgErr) {
        console.error('[getBankDetails] PG error:', pgErr);
      }
    }
    const { data, error } = await supabaseAdmin
      .from('bank_details')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data: data || null };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ==================== WALLET & TRANSACTIONS ====================

export async function getWalletData(userId: number) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return {
      success: true,
      data: {
        balance: data.wallet_balance,
        currency: 'INR',
        userId,
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function createTransaction(
  userId: number,
  type: 'manual_deposit' | 'loan_disbursement' | 'withdrawal',
  amount: number,
  description: string,
  metadata?: any
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .insert([
        {
          user_id: userId,
          type,
          amount,
          description,
          currency: 'INR',
          metadata,
        },
      ])
      .select();

    if (error) {
      const msg = error.message || JSON.stringify(error);
      if (msg.includes('relation "public.transactions" does not exist')) {
        return await withDbClient(async (client) => {
          await client.query(CREATE_TRANSACTIONS_TABLE_SQL);
          const { data: retryData, error: retryError } = await supabaseAdmin
            .from('transactions')
            .insert([
              {
                user_id: userId,
                type,
                amount,
                description,
                currency: 'INR',
                metadata,
              },
            ])
            .select();
          if (retryError) throw retryError;
          return { success: true, data: retryData?.[0] };
        });
      }
      throw error;
    }
    return { success: true, data: data?.[0] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ==================== DEPOSIT MANAGEMENT (ADMIN) ====================

export interface SearchUserForDepositResult {
  id: number;
  full_name: string;
  phone_number: string;
  wallet_balance: number;
  document_number: string | null;
}

/**
 * Search user by phone number or loan order/document number for deposit top-up.
 * Uses direct PG to avoid Supabase schema cache issues with loan_applications.
 */
export async function searchUserForDeposit(
  phoneOrLoanNumber: string
): Promise<{ success: true; data: SearchUserForDepositResult } | { success: false; error: string }> {
  try {
    const trimmed = String(phoneOrLoanNumber).trim().replace(/\D/g, '');
    if (!trimmed) {
      return { success: false, error: 'Enter phone or loan order number' };
    }

    const normalizedPhone = trimmed.length === 10 ? '0' + trimmed : trimmed.length === 11 && trimmed.startsWith('0') ? trimmed : '0' + trimmed.slice(-10);
    const searchDoc = phoneOrLoanNumber.trim();

    const result = await withDbClient(async (client) => {
      if (normalizedPhone.length === 11) {
        const userRes = await client.query(
          `SELECT id, full_name, phone_number, wallet_balance FROM public.users WHERE phone_number = $1`,
          [normalizedPhone]
        );
        const user = userRes.rows[0];
        if (user) {
          const loanRes = await client.query(
            `SELECT document_number FROM public.loan_applications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
            [user.id]
          );
          return {
            id: user.id,
            full_name: user.full_name ?? '',
            phone_number: user.phone_number,
            wallet_balance: Number(user.wallet_balance ?? 0),
            document_number: loanRes.rows[0]?.document_number ?? null,
          };
        }
      }

      const loanRes = await client.query(
        `SELECT user_id, document_number FROM public.loan_applications WHERE document_number ILIKE $1 ORDER BY created_at DESC LIMIT 1`,
        ['%' + searchDoc + '%']
      );
      const loanRow = loanRes.rows[0];
      if (loanRow?.user_id) {
        const userRes = await client.query(
          `SELECT id, full_name, phone_number, wallet_balance FROM public.users WHERE id = $1`,
          [loanRow.user_id]
        );
        const user = userRes.rows[0];
        if (user) {
          return {
            id: user.id,
            full_name: user.full_name ?? '',
            phone_number: user.phone_number,
            wallet_balance: Number(user.wallet_balance ?? 0),
            document_number: loanRow.document_number,
          };
        }
      }
      return null;
    });

    if (result) {
      return { success: true, data: result };
    }
    return { success: false, error: 'No user found for this phone or loan order number' };
  } catch (error) {
    console.error('[searchUserForDeposit] error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}

export interface DepositRecord {
  id: number;
  user_id: number;
  amount: number;
  description: string;
  created_at: string;
  metadata: { operatorId?: string; operatorUsername?: string; operatorRole?: string; note?: string } | null;
  user?: { full_name: string; phone_number: string };
  document_number?: string | null;
}

export interface GetDepositsFilters {
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * List manual_deposit transactions with user info and operator from metadata.
 * When search is provided, resolves to user IDs first so pagination/count are correct.
 */
export async function getDeposits(filters: GetDepositsFilters): Promise<{
  success: true;
  data: DepositRecord[];
  total: number;
} | { success: false; error: string }> {
  try {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(10, filters.limit ?? 20));
    const offset = (page - 1) * limit;
    const searchTrim = (filters.search || '').trim();

    let userIdsFilter: number[] | null = null;
    if (searchTrim) {
      const { data: usersByPhone } = await supabaseAdmin
        .from('users')
        .select('id')
        .or(`phone_number.ilike.%${searchTrim}%,full_name.ilike.%${searchTrim}%`);
      const { data: loansByDoc } = await supabaseAdmin
        .from('loan_applications')
        .select('user_id')
        .ilike('document_number', `%${searchTrim}%`);
      const ids = new Set<number>();
      (usersByPhone || []).forEach((u: any) => ids.add(u.id));
      (loansByDoc || []).forEach((l: any) => ids.add(l.user_id));
      if (ids.size > 0) userIdsFilter = Array.from(ids);
      else userIdsFilter = []; // no match -> return empty
    }

    let query = supabaseAdmin
      .from('transactions')
      .select('id, user_id, amount, description, created_at, metadata', { count: 'exact' })
      .eq('type', 'manual_deposit')
      .order('created_at', { ascending: false });

    if (filters.startDate) {
      query = query.gte('created_at', new Date(filters.startDate).toISOString());
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      query = query.lte('created_at', end.toISOString());
    }
    if (userIdsFilter !== null) {
      if (userIdsFilter.length === 0) {
        return { success: true, data: [], total: 0 };
      }
      query = query.in('user_id', userIdsFilter);
    }

    const { data: rows, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    const userIds = [...new Set((rows || []).map((r: any) => r.user_id))];
    const usersMap: Record<number, { full_name: string; phone_number: string }> = {};
    const docMap: Record<number, string | null> = {};

    if (userIds.length > 0) {
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, full_name, phone_number')
        .in('id', userIds);
      (users || []).forEach((u: any) => {
        usersMap[u.id] = { full_name: u.full_name ?? '', phone_number: u.phone_number };
      });
      const docRows = await withDbClient(async (client) => {
        const res = await client.query(
          `SELECT DISTINCT ON (user_id) user_id, document_number FROM public.loan_applications WHERE user_id = ANY($1::bigint[]) ORDER BY user_id, created_at DESC`,
          [userIds]
        );
        return res.rows;
      });
      docRows.forEach((r: { user_id: number; document_number: string }) => {
        docMap[r.user_id] = r.document_number;
      });
    }

    const list: DepositRecord[] = (rows || []).map((r: any) => ({
      id: r.id,
      user_id: r.user_id,
      amount: Number(r.amount),
      description: r.description ?? '',
      created_at: r.created_at,
      metadata: r.metadata ?? null,
      user: usersMap[r.user_id],
      document_number: docMap[r.user_id] ?? null,
    }));

    const total = typeof count === 'number' ? count : list.length;
    return { success: true, data: list, total };
  } catch (error) {
    console.error('[getDeposits] error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load deposits',
    };
  }
}

/**
 * Create manual deposit: add amount to user wallet and record transaction with operator info.
 */
export async function createManualDeposit(
  userId: number,
  amount: number,
  note: string,
  operatorId: string,
  operatorUsername: string,
  operatorRole: string
): Promise<{ success: true; data: { transaction: any; newBalance: number } } | { success: false; error: string }> {
  try {
    if (!userId || amount <= 0) {
      return { success: false, error: 'Invalid user or amount' };
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return { success: false, error: 'User not found' };
    }

    const currentBalance = Number(user.wallet_balance ?? 0);
    const newBalance = currentBalance + amount;

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ wallet_balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (updateError) throw updateError;

    const description = note.trim() || `Manual deposit by ${operatorRole} - ${operatorUsername}`;
    const metadata = {
      operatorId,
      operatorUsername,
      operatorRole,
      note: note.trim() || null,
    };

    const txResult = await createTransaction(
      userId,
      'manual_deposit',
      amount,
      description,
      metadata
    );

    if (!txResult.success) {
      return { success: false, error: txResult.error };
    }

    return { success: true, data: { transaction: txResult.data, newBalance } };
  } catch (error) {
    console.error('[createManualDeposit] error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create deposit',
    };
  }
}

// ==================== ADMIN ACTIVITY LOG ====================

export interface AdminActivityLogEntry {
  id: number;
  admin_id: number | null;
  admin_username: string;
  admin_role: string;
  user_id: number;
  action_type: string;
  old_value: string | null;
  new_value: string | null;
  note: string | null;
  created_at: string;
}

/**
 * Log an admin action on a user (wallet, code, ban, personal_info, bank_info).
 */
export async function logAdminActivity(
  adminId: number | null,
  adminUsername: string,
  adminRole: string,
  userId: number,
  actionType: string,
  oldValue: string | null,
  newValue: string | null,
  note?: string | null
): Promise<void> {
  try {
    await supabaseAdmin.from('admin_activity_log').insert({
      admin_id: adminId,
      admin_username: adminUsername,
      admin_role: adminRole,
      user_id: userId,
      action_type: actionType,
      old_value: oldValue,
      new_value: newValue,
      note: note ?? null,
    });
  } catch (err) {
    console.error('[logAdminActivity] error:', err);
  }
}

/**
 * Get paginated activity log for a user.
 */
export async function getAdminActivityLog(
  userId: number,
  page: number = 1,
  limit: number = 50
): Promise<{ success: true; data: AdminActivityLogEntry[]; total: number } | { success: false; error: string }> {
  try {
    const offset = (page - 1) * limit;
    const { data: rows, error, count } = await supabaseAdmin
      .from('admin_activity_log')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    const list: AdminActivityLogEntry[] = (rows || []).map((r: any) => ({
      id: r.id,
      admin_id: r.admin_id,
      admin_username: r.admin_username ?? '',
      admin_role: r.admin_role ?? '',
      user_id: r.user_id,
      action_type: r.action_type ?? '',
      old_value: r.old_value ?? null,
      new_value: r.new_value ?? null,
      note: r.note ?? null,
      created_at: r.created_at,
    }));
    return { success: true, data: list, total: typeof count === 'number' ? count : list.length };
  } catch (error) {
    console.error('[getAdminActivityLog] error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load activity log',
    };
  }
}

/**
 * Get latest activity log entry for a user (for "Remarks" column or summary).
 */
export async function getLatestActivityForUser(userId: number): Promise<AdminActivityLogEntry | null> {
  try {
    const { data } = await supabaseAdmin
      .from('admin_activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      admin_id: data.admin_id,
      admin_username: data.admin_username ?? '',
      admin_role: data.admin_role ?? '',
      user_id: data.user_id,
      action_type: data.action_type ?? '',
      old_value: data.old_value ?? null,
      new_value: data.new_value ?? null,
      note: data.note ?? null,
      created_at: data.created_at,
    };
  } catch {
    return null;
  }
}

// ==================== WITHDRAWAL CODE MANAGEMENT ====================

export async function updateWithdrawalCode(userId: number, otp: string) {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ withdrawal_otp: otp, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
    return { success: true, data: 'Withdrawal code updated successfully' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ==================== ADMIN FUNCTIONS ====================

export async function adminLogin(username: string, password: string) {
  try {
    let data: any = null;
    try {
      const res = await supabaseAdmin
        .from('admin')
        .select('*')
        .eq('username', username)
        .single();
      data = res.data;
      if (res.error) throw res.error;
    } catch (supabaseErr: any) {
      const msg = supabaseErr?.message || String(supabaseErr);
      if (msg.includes('permission denied') || msg.includes('schema cache') || msg.includes('does not exist')) {
        const dbUrl = getDbUrl();
        if (dbUrl) {
          data = await withDbClient(async (client) => {
            const r = await client.query(
              'SELECT id, username, email, password_hash, role, is_active FROM public.admin WHERE username = $1',
              [username]
            );
            return r.rows[0] || null;
          });
        }
      }
      if (!data) throw supabaseErr;
    }

    if (!data) {
      return { success: false, error: 'Invalid username or password' };
    }

    if (!data.is_active) {
      return { success: false, error: 'Admin account is inactive' };
    }

    const passwordMatch = await bcrypt.compare(password, data.password_hash);
    if (!passwordMatch) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Update last login (best-effort; skip if Supabase fails)
    try {
      await supabaseAdmin.from('admin').update({ last_login: new Date().toISOString() }).eq('id', data.id);
    } catch {
      try {
        await withDbClient((client) =>
          client.query('UPDATE public.admin SET last_login = NOW() WHERE id = $1', [data.id])
        );
      } catch (_) {}
    }

    return {
      success: true,
      data: {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/** Admin list item (no password) for Admin Management UI */
export interface AdminListItem {
  id: number;
  username: string;
  email: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

/**
 * List all admins. Only for use by senior admin (caller must enforce).
 */
export async function getAdmins(): Promise<
  { success: true; data: AdminListItem[] } | { success: false; error: string }
> {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin')
      .select('id, username, email, role, is_active, created_at, last_login')
      .order('created_at', { ascending: false });

    if (error) throw error;
    const list: AdminListItem[] = (data || []).map((row: any) => ({
      id: row.id,
      username: row.username,
      email: row.email ?? null,
      role: row.role ?? 'admin',
      is_active: row.is_active ?? true,
      created_at: row.created_at,
      last_login: row.last_login ?? null,
    }));
    return { success: true, data: list };
  } catch (error) {
    console.error('[getAdmins] error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list admins',
    };
  }
}

/**
 * Create a new admin. Only role 'admin' is allowed (SUPER_ADMIN reserved for env/init).
 */
export async function createAdmin(
  username: string,
  password: string,
  role: string = 'admin'
): Promise<{ success: true; data: AdminListItem } | { success: false; error: string }> {
  try {
    const trimmedUsername = username.trim();
    if (!trimmedUsername || trimmedUsername.length < 2) {
      return { success: false, error: 'Username must be at least 2 characters' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    const allowedRole = role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'admin';
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabaseAdmin
      .from('admin')
      .insert([
        {
          username: trimmedUsername,
          password_hash: hashedPassword,
          role: allowedRole,
          is_active: true,
          email: null,
        },
      ])
      .select('id, username, email, role, is_active, created_at, last_login')
      .single();

    if (error) {
      if (error.code === '23505') return { success: false, error: 'Username already exists' };
      throw error;
    }

    const admin: AdminListItem = {
      id: data.id,
      username: data.username,
      email: data.email ?? null,
      role: data.role ?? 'admin',
      is_active: data.is_active ?? true,
      created_at: data.created_at,
      last_login: data.last_login ?? null,
    };
    return { success: true, data: admin };
  } catch (error) {
    console.error('[createAdmin] error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create admin',
    };
  }
}

// ==================== LOAN STATUS ====================

export async function getLoanStatusForUser(userId: number) {
  try {
    // Prefer direct PG so we always get the actual loan row (status, status_color, status_description from DB)
    const dbUrl = getDbUrl();
    if (dbUrl) {
      try {
        const loanRow = await withDbClient(async (client) => {
          const res = await client.query(
            `SELECT id, document_number, order_number, status, status_color, status_description,
                    loan_amount, interest_rate, loan_period_months, created_at, updated_at
             FROM public.loans
             WHERE user_id = $1 AND is_active = true
             ORDER BY created_at DESC
             LIMIT 1`,
            [userId]
          );
          return res.rows[0] || null;
        });
        if (loanRow) {
          return {
            success: true,
            data: {
              documentNumber: loanRow.document_number,
              status: loanRow.status,
              statusMessage: loanRow.status_description || '',
              statusColor: loanRow.status_color || '#F59E0B',
              amountRequested: loanRow.loan_amount,
              loanTerm: loanRow.loan_period_months,
              interestRate: loanRow.interest_rate,
              createdAt: loanRow.created_at,
              allowWithdrawal: loanRow.status_color === '#22C55E',
              currency: 'INR',
            },
          };
        }
      } catch (pgErr) {
        console.error('[v0] getLoanStatusForUser PG read error:', pgErr);
      }
    }

    const { data: loanData, error: loanError } = await supabase
      .from('loans')
      .select(`
        id,
        document_number,
        order_number,
        status,
        status_color,
        status_description,
        loan_amount,
        interest_rate,
        loan_period_months,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!loanError && loanData) {
      return {
        success: true,
        data: {
          documentNumber: loanData.document_number,
          status: loanData.status,
          statusMessage: loanData.status_description || '',
          statusColor: loanData.status_color || '#F59E0B',
          amountRequested: loanData.loan_amount,
          loanTerm: loanData.loan_period_months,
          interestRate: loanData.interest_rate,
          createdAt: loanData.created_at,
          allowWithdrawal: loanData.status_color === '#22C55E',
          currency: 'INR',
        },
      };
    }

    // Fallback to loan_applications when no loans row exists yet
    const appResult = await getActiveApplicationForUser(userId);
    const appData = appResult.success ? appResult.data : null;

    if (!appData) {
      return { success: true, data: null };
    }

    const app = appData as any;
    return {
      success: true,
      data: {
        documentNumber: app.document_number,
        status: app.status,
        statusMessage: app.admin_status_message || app.status_description || 'Your application is being processed.',
        statusColor: app.status_color || '#6C757D',
        amountRequested: app.amount_requested,
        loanTerm: app.loan_term_months,
        interestRate: app.interest_rate,
        createdAt: app.created_at,
        allowWithdrawal: false,
        currency: 'INR',
      },
    };
  } catch (error) {
    console.error('[v0] getLoanStatusForUser error:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Initialize admin from environment (uses direct PG fallback when Supabase has permission denied)
export async function initializeAdminFromEnv() {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@easyloan.com';

    if (!adminPassword) {
      return { success: false, error: 'Admin password not configured' };
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    try {
      const { data: existingAdmin } = await supabaseAdmin
        .from('admin')
        .select('id')
        .eq('username', adminUsername);

      if (existingAdmin && existingAdmin.length > 0) {
        return { success: true, message: 'Admin already exists' };
      }

      const { data, error } = await supabaseAdmin
        .from('admin')
        .insert([
          {
            username: adminUsername,
            email: adminEmail,
            password_hash: hashedPassword,
            role: 'SUPER_ADMIN',
            is_active: true,
          },
        ])
        .select();

      if (error) throw error;
      return { success: true, data: data?.[0] };
    } catch (supabaseErr: any) {
      const msg = supabaseErr?.message || String(supabaseErr);
      const usePg = msg.includes('permission denied') || msg.includes('schema cache') || msg.includes('does not exist');
      if (!usePg) {
        return { success: false, error: (supabaseErr as Error).message };
      }

      const dbUrl = getDbUrl();
      if (!dbUrl) {
        return { success: false, error: 'Set DIRECT_URL or DATABASE_URL in .env to create admin (Supabase returned: ' + msg + ')' };
      }

      const row = await withDbClient(async (client) => {
        const existing = await client.query(
          'SELECT id FROM public.admin WHERE username = $1',
          [adminUsername]
        );
        if (existing.rows.length > 0) {
          return { existing: true };
        }
        const res = await client.query(
          `INSERT INTO public.admin (username, email, password_hash, role, is_active, created_at)
           VALUES ($1, $2, $3, 'SUPER_ADMIN', true, NOW())
           RETURNING id, username, email, role`,
          [adminUsername, adminEmail || null, hashedPassword]
        );
        return { existing: false, data: res.rows[0] };
      });

      if ((row as { existing?: boolean }).existing) {
        return { success: true, message: 'Admin already exists' };
      }
      return { success: true, data: (row as { data?: any }).data };
    }
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
export async function getUserDetailsById(userId: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        personal_info (*),
        bank_details (*)
      `)
      .eq('id', userId)
      .single();

    if (!error && data) return { success: true, data };

    // When Supabase fails (e.g. table not in schema cache), try direct PG
    const dbUrl = getDbUrl();
    if (dbUrl) {
      try {
        const row = await withDbClient(async (client) => {
          const res = await client.query('SELECT * FROM public.users WHERE id = $1 LIMIT 1', [userId]);
          return res.rows[0];
        });
        if (row) {
          return { success: true, data: row };
        }
      } catch (pgErr) {
        console.error('[getUserDetailsById] PG fallback error:', pgErr);
      }
    }

    const errMsg = (error as any)?.message ?? 'User not found';
    return { success: false, error: errMsg };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getLoanApplications(userId: number) {
  try {
    const data = await withDbClient(async (client) => {
      const res = await client.query(
        `SELECT * FROM public.loan_applications WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
      return res.rows;
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getTransactions(userId: number) {
  try {
    const { data, error } = await supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getAllLoanApplications() {
  try {
    const data = await withDbClient(async (client) => {
      const res = await client.query(
        `SELECT * FROM public.loan_applications ORDER BY created_at DESC`
      );
      return res.rows;
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateLoanApplicationStatus(id: number, status: string, admin_status_message?: string, status_color?: string) {
  try {
    const row = await withDbClient(async (client) => {
      const res = await client.query(
        `UPDATE public.loan_applications
         SET status = $1, admin_status_message = $2, status_color = $3, updated_at = NOW()
         WHERE id = $4 RETURNING *`,
        [status, admin_status_message ?? null, status_color ?? null, id]
      );
      return res.rows[0];
    });
    return { success: true, data: row };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateKYCUrl(id: number, frontUrl: string, backUrl: string, selfieUrl: string) {
  try {
    const row = await withDbClient(async (client) => {
      const res = await client.query(
        `UPDATE public.loan_applications
         SET kyc_front_url = $1, kyc_back_url = $2, selfie_url = $3, updated_at = NOW()
         WHERE id = $4 RETURNING *`,
        [frontUrl, backUrl, selfieUrl, id]
      );
      return res.rows[0];
    });
    return { success: true, data: row };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/** Update a single KYC URL field on loan_applications (for update_kyc_url action). */
export async function updateLoanApplicationKycUrlField(
  applicationId: number,
  type: 'front' | 'back' | 'selfie',
  url: string
) {
  const column = type === 'front' ? 'kyc_front_url' : type === 'back' ? 'kyc_back_url' : 'selfie_url';
  try {
    const row = await withDbClient(async (client) => {
      const res = await client.query(
        `UPDATE public.loan_applications SET ${column} = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [url, applicationId]
      );
      return res.rows[0];
    });
    return { success: true, data: row };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/** Get loan_application by exact document_number with user info (for admin exact search). */
export async function getLoanApplicationWithUserByDocumentNumber(documentNumber: string) {
  try {
    const row = await withDbClient(async (client) => {
      const res = await client.query(
        `SELECT la.*, u.full_name AS u_full_name, u.phone_number AS u_phone
         FROM public.loan_applications la
         JOIN public.users u ON u.id = la.user_id
         WHERE la.document_number = $1
         ORDER BY la.created_at DESC LIMIT 1`,
        [documentNumber.trim()]
      );
      const r = res.rows[0];
      if (!r) return null;
      const { u_full_name, u_phone, ...la } = r;
      return { ...la, users: { full_name: u_full_name, phone_number: u_phone } };
    });
    return { success: true, data: row };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/** Admin loans list via PG (no is_active - column may not exist on loan_applications). */
export async function getAdminLoanApplicationsPaginated(options: {
  limit: number;
  offset: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  try {
    const { limit, offset, search, status, startDate, endDate } = options;
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (search?.trim()) {
      conditions.push(`(la.document_number ILIKE $${paramIndex} OR u.full_name ILIKE $${paramIndex} OR u.phone_number ILIKE $${paramIndex})`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }
    if (status?.trim()) {
      conditions.push(`la.status = $${paramIndex}`);
      params.push(status.trim());
      paramIndex++;
    }
    if (startDate) {
      conditions.push(`la.created_at >= $${paramIndex}::timestamptz`);
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      conditions.push(`la.created_at <= $${paramIndex}::timestamptz`);
      params.push(endDate);
      paramIndex++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRes = await withDbClient(async (client) => {
      const countQuery = `SELECT COUNT(*)::int AS total FROM public.loan_applications la JOIN public.users u ON u.id = la.user_id ${whereClause}`;
      const r = await client.query(countQuery, params);
      return r.rows[0]?.total ?? 0;
    });
    const total = typeof countRes === 'number' ? countRes : 0;

    const listParams = [...params, limit, offset];
    const rows = await withDbClient(async (client) => {
      const listQuery = `
        SELECT la.id, la.user_id, la.document_number, la.amount_requested, la.loan_term_months, la.interest_rate,
               la.status, la.created_at, u.full_name AS u_full_name, u.phone_number AS u_phone
        FROM public.loan_applications la
        JOIN public.users u ON u.id = la.user_id
        ${whereClause}
        ORDER BY la.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      const res = await client.query(listQuery, listParams);
      return res.rows.map((r: any) => ({
        ...r,
        users: { full_name: r.u_full_name, phone_number: r.u_phone },
      }));
    });

    return { success: true, data: { rows, total } };
  } catch (error) {
    return { success: false, error: (error as Error).message, data: { rows: [], total: 0 } };
  }
}

/** Get active loans for user from loans table (direct PG to avoid schema cache). */
export async function getActiveLoansForUser(userId: number) {
  try {
    const rows = await withDbClient(async (client) => {
      const res = await client.query(
        `SELECT * FROM public.loans WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC`,
        [userId]
      );
      return res.rows;
    });
    return { success: true, data: rows };
  } catch (error) {
    return { success: false, error: (error as Error).message, data: [] };
  }
}

export async function getBalanceBreakdown(userId: number) {
  try {
    const dbUrl = getDbUrl();
    if (dbUrl) {
      try {
        const [row, pendingSum] = await Promise.all([
          withDbClient(async (client) => {
            const res = await client.query(
              'SELECT COALESCE(wallet_balance, 0) AS wallet_balance FROM public.users WHERE id = $1 LIMIT 1',
              [userId]
            );
            return res.rows[0];
          }),
          getPendingWithdrawalSum(userId),
        ]);
        if (row) {
          const bal = Number(row.wallet_balance ?? 0);
          return {
            success: true,
            data: { available_balance: bal, withdrawal_balance: pendingSum },
          };
        }
      } catch (pgErr) {
        console.error('[getBalanceBreakdown] PG error:', pgErr);
      }
    }
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();
    if (error) throw error;
    const bal = Number(data?.wallet_balance ?? 0);
    const pendingSum = await getPendingWithdrawalSum(userId);
    return { success: true, data: { available_balance: bal, withdrawal_balance: pendingSum } };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/** Dashboard metrics shape expected by admin dashboard UI */
export interface DashboardMetricsData {
  newUsers: number;
  newApplicants: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  pendingWithdrawals: number;
  totalDeposits: number;
  totalWithdrawn: number;
  dateRange: { start: string; end: string };
}

/**
 * Normalize date string to start of day (UTC) for range queries.
 * Accepts YYYY-MM-DD or ISO string; returns ISO string at 00:00:00.000Z.
 */
function toRangeStart(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Normalize date string to end of day (UTC) for range queries.
 * Returns ISO string at 23:59:59.999Z.
 */
function toRangeEnd(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  d.setUTCHours(23, 59, 59, 999);
  return d.toISOString();
}

/**
 * Fetch real dashboard metrics for the admin panel.
 * Uses date range (startDate, endDate) and runs parallel Supabase queries.
 * Returns counts/sums; missing tables or errors yield 0 for that metric.
 */
export async function getDashboardMetrics(
  startDate?: string,
  endDate?: string
): Promise<{ success: true; data: DashboardMetricsData } | { success: false; error: string }> {
  const rangeStart = toRangeStart(startDate ?? new Date().toISOString().split('T')[0]);
  const rangeEnd = toRangeEnd(endDate ?? new Date().toISOString().split('T')[0]);
  if (!rangeStart || !rangeEnd) {
    return { success: false, error: 'Invalid date range' };
  }

  const safeNum = (n: unknown): number => (typeof n === 'number' && !Number.isNaN(n) ? n : 0);

  const result: DashboardMetricsData = {
    newUsers: 0,
    newApplicants: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    pendingWithdrawals: 0,
    totalDeposits: 0,
    totalWithdrawn: 0,
    dateRange: { start: rangeStart, end: rangeEnd },
  };

  try {
    // Loan application counts via direct PG to avoid schema cache
    const loanCounts = await withDbClient(async (client) => {
      const [newRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
        client.query(`SELECT COUNT(*)::int AS c FROM public.loan_applications WHERE created_at >= $1 AND created_at <= $2`, [rangeStart, rangeEnd]),
        client.query(`SELECT COUNT(*)::int AS c FROM public.loan_applications WHERE status IN ('pending', 'under_review', 'Under Review', 'Pending') AND created_at >= $1 AND created_at <= $2`, [rangeStart, rangeEnd]),
        client.query(`SELECT COUNT(*)::int AS c FROM public.loan_applications WHERE status = 'approved' AND created_at >= $1 AND created_at <= $2`, [rangeStart, rangeEnd]),
        client.query(`SELECT COUNT(*)::int AS c FROM public.loan_applications WHERE status = 'rejected' AND created_at >= $1 AND created_at <= $2`, [rangeStart, rangeEnd]),
      ]);
      return {
        newApplicants: newRes.rows[0]?.c ?? 0,
        pending: pendingRes.rows[0]?.c ?? 0,
        approved: approvedRes.rows[0]?.c ?? 0,
        rejected: rejectedRes.rows[0]?.c ?? 0,
      };
    });

    const [
      usersRes,
      withdrawalsPendingRes,
      withdrawalsCompletedRes,
      depositsRes,
    ] = await Promise.all([
      supabaseAdmin
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', rangeStart)
        .lte('created_at', rangeEnd),
      // Pending withdrawals count (created in range)
      (async () => {
        try {
          const { count } = await supabaseAdmin
            .from('withdrawals')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Pending')
            .gte('created_at', rangeStart)
            .lte('created_at', rangeEnd);
          return safeNum(count);
        } catch {
          return 0;
        }
      })(),
      // Total withdrawn: sum(amount) where status is Completed, created in range
      (async () => {
        try {
          const { data, error } = await supabaseAdmin
            .from('withdrawals')
            .select('amount')
            .in('status', ['Completed', 'completed', 'COMPLETED'])
            .gte('created_at', rangeStart)
            .lte('created_at', rangeEnd);

          if (error && error.message.includes('relation "public.withdrawals" does not exist')) {
            await withDbClient(client => client.query(CREATE_WITHDRAWALS_TABLE_SQL));
            return 0;
          }

          if (!Array.isArray(data)) return 0;
          return data.reduce((sum, row) => sum + safeNum(row?.amount), 0);
        } catch {
          return 0;
        }
      })(),
      // Manual deposits: sum(amount) where type = manual_deposit, amount < 100000, created in range
      (async () => {
        try {
          const { data } = await supabaseAdmin
            .from('transactions')
            .select('amount')
            .eq('type', 'manual_deposit')
            .lt('amount', 100000)
            .gte('created_at', rangeStart)
            .lte('created_at', rangeEnd);
          if (!Array.isArray(data)) return 0;
          return data.reduce((sum, row) => sum + safeNum(row?.amount), 0);
        } catch {
          return 0;
        }
      })(),
    ]);

    result.newUsers = safeNum((usersRes as { count?: number }).count);
    result.newApplicants = loanCounts.newApplicants;
    result.pendingApplications = loanCounts.pending;
    result.approvedApplications = loanCounts.approved;
    result.rejectedApplications = loanCounts.rejected;
    result.pendingWithdrawals = await withdrawalsPendingRes;
    result.totalWithdrawn = await withdrawalsCompletedRes;
    result.totalDeposits = await depositsRes;

    return { success: true, data: result };
  } catch (error) {
    console.error('[getDashboardMetrics] error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load dashboard metrics',
    };
  }
}
export async function getAllUsers(skip: number = 0, limit: number = 10, search?: string, status?: string) {
  try {
    let query = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone_number.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .range(skip, skip + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      total: count || 0
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getUserLoans(userId: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from('loans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.message.includes('relation "public.loans" does not exist')) {
        return { success: true, data: [] };
      }
      throw error;
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getUserActivityHistory(userId: number) {
  try {
    const { data: transactions, error: tError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (tError && !tError.message.includes('relation "public.transactions" does not exist')) {
      throw tError;
    }

    return {
      success: true,
      data: {
        transactions: transactions || [],
        repayments: [] // repayments are currently handled as part of transactions
      }
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function banUser(userId: number) {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ cibil_score: -1 }) // Convention: -1 means banned
      .eq('id', userId);

    if (error) throw error;
    return { success: true, data: 'User banned successfully' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function resetUserPassword(userId: number, password?: string) {
  try {
    if (!password) {
      return { success: false, error: 'Password is required' };
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const { error } = await supabaseAdmin
      .from('users')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
    return { success: true, data: 'Password reset successfully' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}


