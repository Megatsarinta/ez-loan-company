import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdmins, createAdmin } from '@/lib/db-operations';

/** GET: List all admins. Requires senior admin (SUPER_ADMIN). */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_id')?.value;
    const adminRole = cookieStore.get('admin_role')?.value;

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (adminRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only senior administrators can view admin list' },
        { status: 403 }
      );
    }

    const result = await getAdmins();
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, admins: result.data });
  } catch (error) {
    console.error('[api/admin/admins] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/** POST: Create new admin. Requires senior admin (SUPER_ADMIN). */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_id')?.value;
    const adminRole = cookieStore.get('admin_role')?.value;

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (adminRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only senior administrators can create new admins' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { username, password, confirmPassword, role } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Password and Confirm Password do not match' },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Only allow role 'admin' from UI (reserve SUPER_ADMIN for env/init)
    const safeRole = role === 'SUPER_ADMIN' ? 'admin' : (role || 'admin');

    const result = await createAdmin(username, password, safeRole);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, admin: result.data });
  } catch (error) {
    console.error('[api/admin/admins] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
