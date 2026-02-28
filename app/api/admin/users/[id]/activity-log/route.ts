import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminActivityLog } from '@/lib/db-operations';

/** GET: Paginated activity log for a user. Admin only. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_id')?.value;

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userIdParam } = await params;
    const userId = parseInt(userIdParam, 10);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    const result = await getAdminActivityLog(userId, page, limit);

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
    console.error('[api/admin/users/[id]/activity-log] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
