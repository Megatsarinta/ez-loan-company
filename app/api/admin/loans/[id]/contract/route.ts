import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateFullContract } from '@/lib/contract-generator';
import { Client } from 'pg';

const getDbUrl = () =>
  process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL || null;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('[v0] Fetching contract for loan:', id);

    let loan: any = null;

    // Check if ID came from loan_applications (prefixed with app_) or loans table
    if (id.startsWith('app_')) {
      const appId = parseInt(id.replace('app_', ''));
      console.log('[v0] Looking up loan_applications record:', appId);

      let loanApp: any = null;
      const { data: supabaseApp, error: appError } = await supabaseAdmin
        .from('loan_applications')
        .select('*, users(full_name, phone_number, id_card_number)')
        .eq('id', appId)
        .single();

      if (!appError && supabaseApp) {
        loanApp = supabaseApp;
      }

      if (!loanApp && getDbUrl()) {
        try {
          const client = new Client({ connectionString: getDbUrl()! });
          await client.connect();
          const appRow = await client.query(
            `SELECT la.*, u.full_name, u.phone_number
             FROM public.loan_applications la
             LEFT JOIN public.users u ON u.id = la.user_id
             WHERE la.id = $1 LIMIT 1`,
            [appId]
          );
          const row = appRow.rows[0];
          let idCard: string | null = null;
          if (row?.user_id) {
            const idRes = await client.query('SELECT id_number FROM public.personal_info WHERE user_id = $1 LIMIT 1', [row.user_id]).catch(() => ({ rows: [] }));
            idCard = idRes.rows?.[0]?.id_number ?? null;
          }
          await client.end();
          if (row) {
            loanApp = {
              id: row.id,
              document_number: row.document_number,
              amount_requested: row.amount_requested,
              interest_rate: row.interest_rate,
              loan_term_months: row.loan_term_months,
              user_id: row.user_id,
              users: { full_name: row.full_name, phone_number: row.phone_number, id_card_number: idCard },
            };
          }
        } catch (pgErr) {
          console.error('[v0] Contract PG fallback error:', pgErr);
        }
      }

      if (!loanApp) {
        console.error('[v0] Loan application not found:', appError);
        return NextResponse.json(
          { success: false, error: 'Loan not found' },
          { status: 404 }
        );
      }

      loan = {
        id: loanApp.id,
        order_number: loanApp.document_number,
        borrower_name: loanApp.users?.full_name || 'Unknown',
        borrower_phone: loanApp.users?.phone_number || 'N/A',
        loan_amount: loanApp.amount_requested,
        interest_rate: loanApp.interest_rate,
        loan_period_months: loanApp.loan_term_months,
        id_number: loanApp.users?.id_card_number || 'N/A',
        bank_name: 'N/A',
      };
    } else {
      const loanId = parseInt(id.replace('loan_', ''), 10);
      if (isNaN(loanId)) {
        return NextResponse.json({ success: false, error: 'Loan not found' }, { status: 404 });
      }
      console.log('[v0] Looking up loans record:', loanId);

      let loanRecord: any = null;
      const { data: supabaseLoan, error: loanError } = await supabaseAdmin
        .from('loans')
        .select('*')
        .eq('id', loanId)
        .single();

      if (!loanError && supabaseLoan) loanRecord = supabaseLoan;

      if (!loanRecord && getDbUrl()) {
        try {
          const client = new Client({ connectionString: getDbUrl()! });
          await client.connect();
          const res = await client.query('SELECT * FROM public.loans WHERE id = $1 LIMIT 1', [loanId]);
          await client.end();
          loanRecord = res.rows[0] || null;
        } catch (pgErr) {
          console.error('[v0] Contract loans PG fallback error:', pgErr);
        }
      }

      if (!loanRecord) {
        console.error('[v0] Loan not found:', loanError);
        return NextResponse.json(
          { success: false, error: 'Loan not found' },
          { status: 404 }
        );
      }

      loan = loanRecord;
    }

    // Check if contract exists
    const { data: existingContract } = await supabaseAdmin
      .from('loan_contracts')
      .select('*')
      .eq('loan_id', loan.id)
      .single();

    if (existingContract) {
      console.log('[v0] Contract found in database');
      return NextResponse.json({
        success: true,
        contract: {
          header: existingContract.contract_header,
          body: existingContract.contract_body,
          full_document: existingContract.full_document,
          is_signed: existingContract.is_signed,
          signed_at: existingContract.signed_at,
          signature_url: existingContract.borrower_signature,
        },
      });
    }

    // Generate new contract if doesn't exist
    console.log('[v0] Generating new contract');

    const contractData = generateFullContract({
      borrower_name: loan.borrower_name,
      id_number: loan.id_number,
      phone_number: loan.borrower_phone,
      loan_amount: loan.loan_amount,
      interest_rate: loan.interest_rate,
      loan_period_months: loan.loan_period_months,
      bank_name: loan.bank_name,
    });

    // Save generated contract to database
    const { data: savedContract, error: saveError } = await supabaseAdmin
      .from('loan_contracts')
      .insert({
        loan_id: loan.id,
        borrower_name: loan.borrower_name,
        id_number: loan.id_number,
        phone_number: loan.borrower_phone,
        loan_amount: loan.loan_amount,
        interest_rate: loan.interest_rate,
        loan_period: loan.loan_period_months,
        bank_name: loan.bank_name,
        contract_header: contractData.header,
        contract_body: contractData.body,
        full_document: contractData.full_document,
        is_signed: false,
      })
      .select()
      .single();

    if (saveError) {
      console.error('[v0] Error saving contract:', saveError);
      // Don't fail - return generated contract anyway
    }

    return NextResponse.json({
      success: true,
      contract: {
        header: contractData.header,
        body: contractData.body,
        full_document: contractData.full_document,
        is_signed: false,
        signed_at: null,
        signature_url: null,
      },
    });
  } catch (error) {
    console.error('[v0] Contract fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch contract',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    console.log('[v0] Saving contract for loan:', id);

    let loan: any = null;

    // Check if ID came from loan_applications (prefixed with app_) or loans table
    if (id.startsWith('app_')) {
      const appId = parseInt(id.replace('app_', ''));
      let loanApp: any = null;
      const { data: supabaseApp, error: appError } = await supabaseAdmin
        .from('loan_applications')
        .select('*, users(full_name, phone_number, id_card_number)')
        .eq('id', appId)
        .single();
      if (!appError && supabaseApp) loanApp = supabaseApp;
      if (!loanApp && getDbUrl()) {
        try {
          const client = new Client({ connectionString: getDbUrl()! });
          await client.connect();
          const appRow = await client.query(
            `SELECT la.*, u.full_name, u.phone_number FROM public.loan_applications la LEFT JOIN public.users u ON u.id = la.user_id WHERE la.id = $1 LIMIT 1`,
            [appId]
          );
          const row = appRow.rows[0];
          let idCard: string | null = null;
          if (row?.user_id) {
            const idRes = await client.query('SELECT id_number FROM public.personal_info WHERE user_id = $1 LIMIT 1', [row.user_id]).catch(() => ({ rows: [] }));
            idCard = idRes.rows?.[0]?.id_number ?? null;
          }
          await client.end();
          if (row) loanApp = { id: row.id, document_number: row.document_number, amount_requested: row.amount_requested, interest_rate: row.interest_rate, loan_term_months: row.loan_term_months, user_id: row.user_id, users: { full_name: row.full_name, phone_number: row.phone_number, id_card_number: idCard } };
        } catch (e) { console.error('[v0] Contract POST PG fallback:', e); }
      }
      if (!loanApp) {
        return NextResponse.json({ success: false, error: 'Loan not found' }, { status: 404 });
      }
      loan = {
        id: loanApp.id,
        borrower_name: loanApp.users?.full_name || 'Unknown',
        borrower_phone: loanApp.users?.phone_number || 'N/A',
        loan_amount: loanApp.amount_requested,
        interest_rate: loanApp.interest_rate,
        loan_period_months: loanApp.loan_term_months,
        id_number: loanApp.users?.id_card_number || 'N/A',
        bank_name: 'N/A',
      };
    } else {
      const loanId = parseInt(id.replace('loan_', ''), 10);
      if (isNaN(loanId)) {
        return NextResponse.json({ success: false, error: 'Loan not found' }, { status: 404 });
      }
      let loanRecord: any = null;
      const { data: supabaseLoan, error: loanError } = await supabaseAdmin
        .from('loans')
        .select('*')
        .eq('id', loanId)
        .single();
      if (!loanError && supabaseLoan) loanRecord = supabaseLoan;
      if (!loanRecord && getDbUrl()) {
        try {
          const client = new Client({ connectionString: getDbUrl()! });
          await client.connect();
          const res = await client.query('SELECT * FROM public.loans WHERE id = $1 LIMIT 1', [loanId]);
          await client.end();
          loanRecord = res.rows[0] || null;
        } catch (e) { console.error('[v0] Contract POST loans PG fallback:', e); }
      }
      if (!loanRecord) {
        return NextResponse.json({ success: false, error: 'Loan not found' }, { status: 404 });
      }
      loan = loanRecord;
    }

    // Generate contract with provided data
    const contractData = generateFullContract({
      borrower_name: body.borrower_name || loan.borrower_name,
      id_number: body.id_number || loan.id_number,
      phone_number: body.phone_number || loan.borrower_phone,
      loan_amount: loan.loan_amount,
      interest_rate: loan.interest_rate,
      loan_period_months: loan.loan_period_months,
      bank_name: body.bank_name || loan.bank_name,
    });

    // Delete existing contract if any
    await supabaseAdmin
      .from('loan_contracts')
      .delete()
      .eq('loan_id', loan.id);

    // Save new contract
    const { data: savedContract, error: saveError } = await supabaseAdmin
      .from('loan_contracts')
      .insert({
        loan_id: loan.id,
        borrower_name: body.borrower_name || loan.borrower_name,
        id_number: body.id_number || loan.id_number,
        phone_number: body.phone_number || loan.borrower_phone,
        loan_amount: loan.loan_amount,
        interest_rate: loan.interest_rate,
        loan_period: loan.loan_period_months,
        bank_name: body.bank_name || loan.bank_name,
        contract_header: contractData.header,
        contract_body: contractData.body,
        full_document: contractData.full_document,
        is_signed: false,
      })
      .select()
      .single();

    if (saveError) {
      console.error('[v0] Error saving contract:', saveError);
      throw saveError;
    }

    return NextResponse.json({
      success: true,
      message: 'Contract saved successfully',
      contract: {
        header: contractData.header,
        body: contractData.body,
        full_document: contractData.full_document,
        is_signed: false,
      },
    });
  } catch (error) {
    console.error('[v0] Contract save error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save contract',
      },
      { status: 500 }
    );
  }
}
