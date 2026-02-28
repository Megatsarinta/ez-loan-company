import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDeposits, createManualDeposit } from '@/lib/db-operations';
import { createClient } from '@supabase/supabase-js';

/** GET: List deposits with filters and pagination. Admin only. */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_id')?.value;

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await getDeposits({
      startDate,
      endDate,
      search,
      page,
      limit,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      page,
      limit,
    });
  } catch (error) {
    console.error('[api/admin/deposits] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/** POST: Create manual deposit (top-up). Admin only. */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_id')?.value;
    const adminRole = cookieStore.get('admin_role')?.value;

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let operatorUsername = 'Admin';
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      const { data: adminRow } = await supabase
        .from('admin')
        .select('username')
        .eq('id', adminId)
        .single();
      if (adminRow?.username) operatorUsername = adminRow.username;
    }

    const body = await req.json();
    const { userId, amount, note } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Valid amount (positive number) is required' }, { status: 400 });
    }

    const operatorRole = adminRole === 'SUPER_ADMIN' ? 'Senior Admin' : 'Admin';

    const result = await createManualDeposit(
      Number(userId),
      numAmount,
      typeof note === 'string' ? note : '',
      adminId,
      operatorUsername,
      operatorRole
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      transaction: result.data.transaction,
      newBalance: result.data.newBalance,
    });
  } catch (error) {
    console.error('[api/admin/deposits] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
