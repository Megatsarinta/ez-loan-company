# Database schema (canonical tables)

This project uses **lowercase with underscores** for all table names. Use only these tables so there are no duplicates (e.g. do not use `User` if you have `users`).

| Table | Purpose |
|-------|---------|
| **users** | User accounts (phone_number, full_name, wallet_balance, personal_info_completed, kyc_completed, signature_completed, etc.) |
| **personal_info** | Personal information from the personal-information page (user_id, full_name, id_type, id_number, gender, date_of_birth, current_job, monthly_income, loan_purpose, living_address, city, state, pincode, emergency_contact_name, emergency_contact_phone) |
| **loan_applications** | Loan applications (user_id, document_number, amount_requested, loan_term_months, interest_rate, status, kyc_*, signature_url, personal_info JSON, etc.) |
| **loans** | Approved/active loans (user_id, document_number, loan_amount, interest_rate, loan_period_months, status, etc.) |
| **withdrawals** | Withdrawal requests (user_id, amount, status, account_number, bank_name, ifsc_code, created_at, updated_at) |
| **bank_details** | User bank account details (user_id, account_type, bank_name, branch, account_number, ifsc_code, account_holder_name) |
| **transactions** | Transaction history (user_id, type, amount, description, etc.) |
| **admin** | Admin users |
| **admin_activity_log** | Admin action logs |

All APIs and `lib/db-operations.ts` use these table names. If your Supabase project has duplicate or differently cased tables (e.g. `User`, `PersonalInfo`, `Withdraw`), migrate data into the tables above and remove the duplicates.
