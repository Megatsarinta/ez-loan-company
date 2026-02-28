import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Generate unique withdraw number
function generateWithdrawNumber() {
  return Date.now().toString().slice(-15);
}

// GET: List all withdrawals with filters
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('withdrawals')
      .select(
        `
        id,
        user_id,
        amount,
        status,
        account_number,
        bank_name,
        ifsc_code,
        created_at,
        updated_at,
        user:users(id, full_name, phone_number, wallet_balance)
      `,
        { count: 'exact' }
      );

    if (startDate) {
      query = query.gte('created_at', new Date(startDate).toISOString());
    }

    if (endDate) {
      query = query.lte('created_at', new Date(endDate).toISOString());
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      // Search by basic withdrawal fields that are known to exist
      query = query.or(
        `account_number.ilike.%${search}%,bank_name.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Map created_at to withdrawal_date for Fund Management table (avoids NaN/NaN/NaN)
    const rows = (data || []).map((row: any) => ({
      ...row,
      withdrawal_date: row.created_at,
      withdraw_number: row.withdraw_number ?? `WD-${row.id}`,
      document_number: row.document_number ?? row.withdraw_number ?? `WD-${row.id}`,
    }));

    return NextResponse.json({
      success: true,
      data: rows,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[v0] Error fetching withdrawals:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST: Create new withdrawal request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount, bankName, accountNumber } = body;

    if (!userId || !amount || !bankName || !accountNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check user wallet balance
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (userData.wallet_balance < amount) {
      return NextResponse.json(
        { success: false, error: 'Insufficient wallet balance' },
        { status: 400 }
      );
    }

    // Create withdrawal record (schema aligned with CREATE_WITHDRAWALS_TABLE_SQL)
    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .insert([
        {
          user_id: userId,
          amount,
          bank_name: bankName,
          account_number: accountNumber,
          status: 'Pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log('[v0] Withdrawal created for user:', userId);

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('[v0] Error creating withdrawal:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
