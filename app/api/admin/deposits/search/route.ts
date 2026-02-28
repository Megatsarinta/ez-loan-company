import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { searchUserForDeposit } from '@/lib/db-operations';

/** GET: Search user by phone or loan order number for deposit top-up. Admin only. */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_id')?.value;

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get('q') || req.nextUrl.searchParams.get('search') || '';
    if (!q.trim()) {
      return NextResponse.json(
        { error: 'Provide query parameter q or search (phone or loan order number)' },
        { status: 400 }
      );
    }

    const result = await searchUserForDeposit(q.trim());

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: result.data });
  } catch (error) {
    console.error('[api/admin/deposits/search] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
