import { createClient } from '@supabase/supabase-js'

// Check if required environment variables are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

// Standard client for public operations (Row Level Security enabled)
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || ''
)

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : supabase // Fallback to regular client if no service role key

// Helper to get the appropriate client based on need
export const getSupabaseClient = (useAdmin: boolean = false) => {
  return useAdmin ? supabaseAdmin : supabase
}

// Database types (you can generate these with `npx supabase gen types`)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          phone_number: string
          password_hash: string
          full_name: string
          aadhaar_number?: string | null
          pan_number?: string | null
          cibil_score: number
          wallet_balance: number
          nri_status: boolean
          nre_account?: string | null
          nro_account?: string | null
          withdrawal_otp?: string | null
          is_banned?: boolean
          personal_info_completed: boolean
          kyc_completed: boolean
          signature_completed: boolean
          last_login_at?: string | null
          last_login_ip?: string | null
          last_login_location?: string | null
          last_login_country?: string | null
          is_verified: boolean
          verified_at?: string | null
          created_at: string
          updated_at: string
        }
      }
      loan_applications: {
        Row: {
          id: number
          user_id: number
          document_number: string
          amount_requested: number
          loan_term_months: number
          interest_rate: number
          annual_rate?: number
          status: string
          kyc_front_url?: string | null
          kyc_back_url?: string | null
          selfie_url?: string | null
          signature_url?: string | null
          is_signed: boolean
          admin_status_message?: string | null
          status_color?: string | null
          submitted_at: string
          updated_at: string
          signed_at?: string | null
          currency: string
        }
      }
      personal_info: {
        Row: {
          id: number
          user_id: number
          full_name: string
          id_type: string
          id_card_number: string
          gender: string
          date_of_birth: string
          current_job: string
          monthly_income: number
          loan_purpose: string
          living_address: string
          city: string
          state: string
          pincode: string
          emergency_contact_name: string
          emergency_contact_phone: string
          created_at: string
          updated_at: string
        }
      }
      loans: {
        Row: {
          id: number
          user_id: number
          loan_application_id?: number
          document_number: string
          order_number?: string
          borrower_name: string
          borrower_phone: string
          borrower_aadhaar?: string | null
          borrower_pan?: string | null
          loan_amount: number
          interest_rate: number
          annual_rate?: number
          loan_period_months: number
          status: string
          status_color?: string | null
          status_description?: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          signed_at?: string | null
          currency: string
        }
      }
      transactions: {
        Row: {
          id: number
          user_id: number
          type: string
          amount: number
          description: string
          otp_code?: string | null
          metadata?: any
          currency: string
          created_at: string
        }
      }
      withdrawals: {
        Row: {
          id: number
          user_id: number
          withdraw_number: string
          withdrawal_code?: string | null
          amount: number
          status: string
          document_number?: string | null
          bank_name?: string | null
          account_number?: string | null
          account_name?: string | null
          ifsc_code?: string | null
          account_type?: string | null
          withdrawal_date: string
          notes?: string | null
          currency: string
          created_at: string
          updated_at: string
        }
      }
      admin: {
        Row: {
          id: number
          username: string
          email: string
          password_hash: string
          role: string
          is_active: boolean
          last_login?: string | null
          created_at: string
        }
      }
    }
  }
}